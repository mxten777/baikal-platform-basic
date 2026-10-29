export type Env = (key: string) => string | undefined
export type Rpc = <T>(name: string, args: Record<string, unknown>) => Promise<T>
type Fetch = typeof fetch
type Policy = { version: string; text: string; privacyText: string; retentionVersion: string; retentionDays: number }
export class InquiryError extends Error {
  constructor(public code: string, public status = 422) { super(code) }
}

export function configuration(env: Env) {
  let policy: Policy | undefined
  try {
    const raw: unknown = JSON.parse(env('INQUIRY_POLICY_JSON') || 'null')
    if (raw && typeof raw === 'object' && 'version' in raw && 'text' in raw && 'privacyText' in raw &&
      'retentionVersion' in raw && 'retentionDays' in raw &&
      typeof raw.version === 'string' && raw.version.trim() &&
      typeof raw.text === 'string' && raw.text.trim() &&
      typeof raw.privacyText === 'string' && raw.privacyText.trim() &&
      typeof raw.retentionVersion === 'string' && raw.retentionVersion.trim() &&
      typeof raw.retentionDays === 'number' && Number.isInteger(raw.retentionDays) &&
      raw.retentionDays > 0 && raw.retentionDays <= 3650) {
      policy = { version: raw.version, text: raw.text, privacyText: raw.privacyText,
        retentionVersion: raw.retentionVersion, retentionDays: raw.retentionDays }
    }
  } catch { /* Invalid policy must leave intake closed. */ }
  const origin = env('INQUIRY_ALLOWED_ORIGIN') || ''
  const ipHeader = env('INQUIRY_TRUSTED_IP_HEADER') || ''
  const enabled = env('CONTACT_INTAKE_ENABLED') === 'true' &&
    env('INQUIRY_POLICY_APPROVED') === 'true' && Boolean(policy) &&
    /^https:\/\/[^/]+$/.test(origin) && env('INQUIRY_IP_HEADER_VERIFIED') === 'true' &&
    ['x-real-ip', 'cf-connecting-ip'].includes(ipHeader) &&
    Boolean(env('TURNSTILE_SECRET_KEY')) && Boolean(env('TURNSTILE_SITE_KEY')) &&
    (env('INQUIRY_HMAC_KEY')?.length ?? 0) >= 32
  return { enabled, policy, origin, ipHeader }
}

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
// deno-lint-ignore no-control-regex -- Intentionally reject non-text control characters.
const control = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/
function string(value: unknown, min: number, max: number, multiline = false): string {
  if (typeof value !== 'string') throw new InquiryError('VALIDATION_ERROR')
  const clean = value.trim()
  if ([...clean].length < min || [...clean].length > max || control.test(clean) ||
    (!multiline && /[\r\n]/.test(clean))) throw new InquiryError('VALIDATION_ERROR')
  return clean
}
export function validateInput(raw: unknown, consentVersion: string) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new InquiryError('INVALID_REQUEST', 400)
  const body = raw as Record<string, unknown>
  const allowed = ['name', 'email', 'company', 'message', 'project_slug', 'inquiry_type', 'solution', 'consent', 'turnstile_token', 'website']
  if (Object.keys(body).some(k => !allowed.includes(k))) throw new InquiryError('INVALID_REQUEST', 400)
  if (body.website !== undefined && body.website !== '') throw new InquiryError('REQUEST_REJECTED', 403)
  const consent = body.consent
  if (!consent || typeof consent !== 'object' || !('accepted' in consent) || consent.accepted !== true ||
    !('version' in consent) || consent.version !== consentVersion ||
    Object.keys(consent).some(k => !['accepted', 'version'].includes(k))) {
    throw new InquiryError('CONSENT_VERSION_CHANGED')
  }
  const email = string(body.email, 3, 254)
  if (!/^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]+$/.test(email)) throw new InquiryError('VALIDATION_ERROR')
  const [local, domain] = email.split('@')
  const nullable = (v: unknown, max: number) => v == null || v === '' ? null : string(v, 1, max)
  const project = nullable(body.project_slug, 120)
  if (project && !/^[a-z0-9-]+$/.test(project)) throw new InquiryError('INVALID_PROJECT')
  const type = nullable(body.inquiry_type, 20)
  const solution = nullable(body.solution, 30)
  if (type && !['demo', 'inquiry', 'brochure'].includes(type)) throw new InquiryError('VALIDATION_ERROR')
  if (solution && !['safelyn', 'private-ai', 'ai-automation', 'the-lit'].includes(solution)) throw new InquiryError('VALIDATION_ERROR')
  return {
    name: string(body.name, 1, 80), email: `${local}@${domain.toLowerCase()}`,
    company: nullable(body.company, 120), message: string(body.message, 10, 5000, true),
    project_slug: project, inquiry_type: type, solution,
    consent_version: consentVersion, token: string(body.turnstile_token, 1, 2048),
  }
}

export async function hmac(secret: string, value: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const bytes = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value))
  return [...new Uint8Array(bytes)].map(n => n.toString(16).padStart(2, '0')).join('')
}
async function readJson(req: Request): Promise<unknown> {
  if (!req.headers.get('content-type')?.startsWith('application/json')) throw new InquiryError('UNSUPPORTED_MEDIA_TYPE', 415)
  const reader = req.body?.getReader()
  if (!reader) throw new InquiryError('INVALID_JSON', 400)
  const chunks: Uint8Array[] = []
  let size = 0
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      size += value.byteLength
      if (size > 32768) { await reader.cancel(); throw new InquiryError('PAYLOAD_TOO_LARGE', 413) }
      chunks.push(value)
    }
    const bytes = new Uint8Array(size)
    let offset = 0
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength }
    try { return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes)) }
    catch { throw new InquiryError('INVALID_JSON', 400) }
  } finally { reader.releaseLock() }
}

export function createSubmitHandler(env: Env, rpc: Rpc, send: Fetch = fetch) {
  return async (req: Request): Promise<Response> => {
    const config = configuration(env)
    const headers: Record<string, string> = {
      'Content-Type': 'application/json', 'Cache-Control': 'no-store', Vary: 'Origin',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'content-type, idempotency-key, apikey, x-client-info',
    }
    const response = (data: unknown, status: number) => new Response(JSON.stringify(data), { status, headers })
    try {
      if (req.headers.get('origin') !== config.origin || !config.origin) throw new InquiryError('ORIGIN_NOT_ALLOWED', 403)
      headers['Access-Control-Allow-Origin'] = config.origin
      if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers })
      if (!['GET', 'POST'].includes(req.method)) throw new InquiryError('METHOD_NOT_ALLOWED', 405)
      if (!config.enabled || !config.policy) throw new InquiryError('INTAKE_DISABLED', 503)
      if (req.method === 'GET') return response({ success: true, data: {
        version: config.policy.version, text: config.policy.text, privacyText: config.policy.privacyText,
        siteKey: env('TURNSTILE_SITE_KEY'),
      } }, 200)
      const ip = req.headers.get(config.ipHeader) || ''
      if (!ip || ip.length > 64 || !/^[0-9a-f:.]+$/i.test(ip)) throw new InquiryError('CLIENT_ADDRESS_UNAVAILABLE', 503)
      const rateKey = await hmac(env('INQUIRY_HMAC_KEY')!, `ip/${new Date().toISOString().slice(0, 10)}/${ip}`)
      if (!await rpc<boolean>('consume_contact_rate', { p_ip_key: rateKey })) {
        headers['Retry-After'] = '600'
        throw new InquiryError('RATE_LIMITED', 429)
      }
      const key = req.headers.get('idempotency-key') || ''
      if (!uuid.test(key)) throw new InquiryError('INVALID_REQUEST', 400)
      const body = validateInput(await readJson(req), config.policy.version)
      let verified: { success?: boolean; hostname?: string; action?: string }
      try {
        const check = await send('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ secret: env('TURNSTILE_SECRET_KEY'), response: body.token }),
          signal: AbortSignal.timeout(8000),
        })
        if (!check.ok) throw new Error('Challenge unavailable')
        verified = await check.json()
      } catch { throw new InquiryError('CHALLENGE_UNAVAILABLE', 503) }
      if (!verified?.success || verified.hostname !== new URL(config.origin).hostname || verified.action !== 'contact') {
        throw new InquiryError('CHALLENGE_FAILED', 403)
      }
      const { token: _token, ...payload } = body
      const result = await rpc<{ receipt_number: string; received_at: string; replayed: boolean }>('create_contact_inquiry', {
        p_key: key, p_hmac: await hmac(env('INQUIRY_HMAC_KEY')!, JSON.stringify(payload)),
        p_name: body.name, p_email: body.email, p_company: body.company, p_message: body.message,
        p_project_slug: body.project_slug, p_type: body.inquiry_type, p_solution: body.solution,
        p_consent_version: config.policy.version, p_retention_version: config.policy.retentionVersion,
        p_retention_days: config.policy.retentionDays,
      })
      return response({ success: true, data: { receipt_number: result.receipt_number, received_at: result.received_at } }, result.replayed ? 200 : 201)
    } catch (error) {
      const known = error instanceof InquiryError
      const code = known ? error.code : 'SERVICE_UNAVAILABLE'
      const requestId = crypto.randomUUID()
      console.warn('contact-submit', { requestId, code })
      return response({ success: false, error: { code, message: '접수를 완료하지 못했습니다. 입력·설정을 확인하거나 이메일로 문의해 주세요.' }, request_id: requestId }, known ? error.status : 503)
    }
  }
}

export function databaseRpc(env: Env, send: Fetch = fetch): Rpc {
  return async <T>(name: string, args: Record<string, unknown>): Promise<T> => {
    const url = env('SUPABASE_URL')
    const key = env('SUPABASE_SERVICE_ROLE_KEY')
    if (!url || !key) throw new InquiryError('SERVICE_UNAVAILABLE', 503)
    const r = await send(`${url}/rest/v1/rpc/${name}`, {
      method: 'POST', headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(args), signal: AbortSignal.timeout(10000),
    })
    if (!r.ok) {
      const problem: { message?: string } = await r.json().catch(() => ({}))
      if (problem.message === 'IDEMPOTENCY_CONFLICT') throw new InquiryError('IDEMPOTENCY_CONFLICT', 409)
      if (problem.message === 'INVALID_PROJECT') throw new InquiryError('INVALID_PROJECT')
      throw new InquiryError('DATABASE_UNAVAILABLE', 503)
    }
    return await r.json() as T
  }
}

export type Notification = {
  id: string; receipt_number: string; created_at: string; notification_claim_id: string;
  notification_generation: number; notification_attempts: number;
}
export async function notify(row: Notification, env: Env, send: Fetch = fetch) {
  const result = { p_id: row.id, p_claim: row.notification_claim_id,
    p_status: 'queued', p_code: 'PROVIDER_UNAVAILABLE', p_provider_id: null as string | null, p_delay: 60 }
  const key = env('RESEND_API_KEY'), from = env('INQUIRY_MAIL_FROM'), to = env('INQUIRY_MAIL_TO')
  const origin = env('INQUIRY_ALLOWED_ORIGIN')
  if (!key || !from || !to || !origin) throw new InquiryError('MAIL_NOT_CONFIGURED', 503)
  try {
    const r = await send('https://api.resend.com/emails', {
      method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json',
        'Idempotency-Key': `inquiry/${row.id}/${row.notification_generation}` },
      body: JSON.stringify({ from, to: [to], subject: `[바이칼 문의] ${row.receipt_number}`,
        text: `접수번호: ${row.receipt_number}\n접수시각: ${row.created_at}\n${origin}/admin/inquiries/${row.id}` }),
      signal: AbortSignal.timeout(8000),
    })
    if (r.ok) {
      const data: { id?: string } = await r.json()
      if (!data.id || typeof data.id !== 'string') throw new Error('Missing provider id')
      return { ...result, p_status: 'accepted', p_code: 'ACCEPTED', p_provider_id: data.id }
    }
    if (r.status === 429) {
      const delay = Number(r.headers.get('retry-after'))
      return { ...result, p_code: 'RATE_LIMITED', p_delay: Number.isFinite(delay) && delay > 0 ? Math.min(86400, Math.ceil(delay)) : 300 }
    }
    if (r.status >= 400 && r.status < 500 && ![408, 409].includes(r.status)) {
      return { ...result, p_status: 'failed', p_code: 'PROVIDER_REJECTED' }
    }
  } catch { /* Provider acceptance may be uncertain; retry only with the same idempotency key. */ }
  return { ...result, p_code: 'DELIVERY_UNCERTAIN',
    p_delay: [60, 300, 900, 3600, 3600][Math.min(row.notification_attempts - 1, 4)] + Math.floor(Math.random() * 15) }
}

export function createMaintenanceHandler(env: Env, rpc: Rpc, send: Fetch = fetch) {
  return async (req: Request): Promise<Response> => {
    const reply = (data: unknown, status: number) => Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } })
    try {
      const secret = env('INQUIRY_JOB_SECRET')
      if (!secret || secret.length < 32 || req.method !== 'POST' || req.headers.has('origin')) throw new InquiryError('FORBIDDEN', 403)
      const supplied = req.headers.get('authorization')?.replace(/^Bearer /, '') || ''
      if (await hmac(secret, supplied) !== await hmac(secret, secret)) throw new InquiryError('FORBIDDEN', 403)
      const raw = await readJson(req)
      if (!raw || typeof raw !== 'object' || !('action' in raw) || Object.keys(raw).length !== 1) throw new InquiryError('INVALID_REQUEST', 400)
      if (raw.action === 'cleanup') {
        if (env('INQUIRY_CLEANUP_ENABLED') !== 'true') throw new InquiryError('CLEANUP_DISABLED', 503)
        return reply({ success: true, removed: await rpc<number>('cleanup_contact_inquiries', {}) }, 200)
      }
      if (raw.action !== 'notifications') throw new InquiryError('INVALID_REQUEST', 400)
      if (env('INQUIRY_NOTIFICATIONS_ENABLED') !== 'true' ||
        !env('RESEND_API_KEY') || !env('INQUIRY_MAIL_FROM') || !env('INQUIRY_MAIL_TO') ||
        !/^https:\/\/[^/]+$/.test(env('INQUIRY_ALLOWED_ORIGIN') || '')) throw new InquiryError('MAIL_DISABLED', 503)
      const rows = await rpc<Notification[]>('claim_contact_notifications', {})
      for (const row of rows) {
        const result = await notify(row, env, send)
        if (!await rpc<boolean>('finish_contact_notification', result)) throw new InquiryError('CLAIM_CONFLICT', 409)
      }
      return reply({ success: true, processed: rows.length }, 200)
    } catch (error) {
      const code = error instanceof InquiryError ? error.code : 'WORKER_UNAVAILABLE'
      console.warn('contact-maintenance', { code })
      return reply({ success: false, error: { code } }, error instanceof InquiryError ? error.status : 503)
    }
  }
}
