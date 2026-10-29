import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import vm from 'node:vm'
import ts from 'typescript'
import { PGlite } from '@electric-sql/pglite'

const source = readFileSync(new URL('../supabase/functions/_shared/inquiries.ts', import.meta.url), 'utf8')
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } })
const { createSubmitHandler, createMaintenanceHandler, notify, configuration, validateInput, databaseRpc, InquiryError } =
  await import(`data:text/javascript;base64,${Buffer.from(compiled.outputText).toString('base64')}`)
const adminId = '00000000-0000-4000-8000-000000000001'
const regularId = '00000000-0000-4000-8000-000000000002'
const projectId = '00000000-0000-4000-8000-000000000003'
const policy = { version: 'LOCAL-TEST-ONLY', text: 'Local test policy, not approved for production.',
  privacyText: 'Local test privacy policy, not approved for production.', retentionVersion: 'local', retentionDays: 2 }
const settings = {
  CONTACT_INTAKE_ENABLED: 'true', INQUIRY_POLICY_APPROVED: 'true', INQUIRY_POLICY_JSON: JSON.stringify(policy),
  INQUIRY_ALLOWED_ORIGIN: 'https://local.example',
  TURNSTILE_SECRET_KEY: 'test-secret', TURNSTILE_SITE_KEY: 'test-site', INQUIRY_HMAC_KEY: 'local-only-hmac-key'.repeat(3),
  INQUIRY_JOB_SECRET: 'local-only-job-key'.repeat(3), INQUIRY_NOTIFICATIONS_ENABLED: 'true', INQUIRY_CLEANUP_ENABLED: 'true',
  RESEND_API_KEY: 'mock-not-real', INQUIRY_MAIL_FROM: 'test@example.com', INQUIRY_MAIL_TO: 'test@example.com',
}
const env = key => settings[key]
const input = () => ({
  name: 'Local test', email: 'test@EXAMPLE.com', company: '', message: 'A local isolated inquiry test.',
  consent: { accepted: true, version: policy.version }, turnstile_token: crypto.randomUUID(), website: '',
})
const request = (body, key = crypto.randomUUID(), ip = '127.0.0.1') => new Request('https://local.example/submit', {
  method: 'POST', headers: { origin: 'https://local.example', 'Content-Type': 'application/json',
    'Idempotency-Key': key, 'x-real-ip': ip }, body: JSON.stringify(body),
})

function browserService(response, enabled = true) {
  const text = readFileSync(new URL('../src/features/inquiries/inquiryService.ts', import.meta.url), 'utf8')
    .replaceAll('import.meta.env', 'mockEnv')
  const js = ts.transpileModule(text, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
  const exports = {}
  vm.runInNewContext(js, {
    exports, require: () => ({ supabase: {} }), AbortSignal,
    mockEnv: { VITE_CONTACT_INTAKE_ENABLED: enabled ? 'true' : 'false', VITE_SUPABASE_URL: 'http://local.invalid' },
    fetch: async () => response,
  })
  return exports
}
test('browser API validates policy and receipt shapes, HTTP status, and disabled gate', async () => {
  for (const data of [null, [], { version: 1, text: 'local', siteKey: 'mock' }, { version: 'v', text: {}, siteKey: 'mock' }]) {
    const api = browserService(Response.json({ success: true, data }))
    await assert.rejects(api.fetchInquiryPolicy(), /정책을 불러오지 못했습니다/)
  }
  const valid = browserService(Response.json({ success: true, data: { version: 'v', text: 'local only', privacyText: 'local policy', siteKey: 'mock' } }))
  assert.equal((await valid.fetchInquiryPolicy()).version, 'v')
  for (const data of [null, { receipt_number: 1, received_at: '2026-10-29' }, { receipt_number: 'BQ-test', received_at: 'invalid' }]) {
    const api = browserService(Response.json({ success: true, data }))
    await assert.rejects(api.submitInquiry({}, 'mock'), /접수번호를 확인하지 못했습니다/)
  }
  const wrongStatus = browserService(Response.json({ success: true, data: { receipt_number: 'BQ-test', received_at: new Date().toISOString() } }, { status: 503 }))
  await assert.rejects(wrongStatus.submitInquiry({}, 'mock'), /웹 접수를 사용할 수 없습니다/)
  const malformed = browserService(new Response('internal details'))
  await assert.rejects(malformed.submitInquiry({}, 'mock'), /접수 응답을 확인하지 못했습니다/)
  await assert.rejects(browserService(null, false).submitInquiry({}, 'mock'), /확정 전에는/)
  const publishedOnly = browserService(Response.json({ success: true, data: {
    version: 'approved-local', text: 'Approved local consent', privacyText: 'Approved local privacy',
  } }), false)
  assert.equal((await publishedOnly.fetchPrivacyPolicy()).privacyText, 'Approved local privacy')
  const noCaptcha = browserService(Response.json({ success: true, data: {
    version: 'approved-local', text: 'Approved local consent', privacyText: 'Approved local privacy',
  } }))
  await assert.rejects(noCaptcha.fetchInquiryPolicy(), /정책을 불러오지 못했습니다/)
  for (const status of [429, 503]) {
    const limited = browserService(Response.json({ success: false }, { status }))
    await assert.rejects(limited.submitInquiry({}, 'mock'), /공식 이메일 jngdy@baikalsys\.kr/)
  }
})

test('isolated PostgreSQL + Edge inquiry contract', async t => {
  const db = new PGlite()
  await db.exec(`
    CREATE ROLE anon NOLOGIN;
    CREATE ROLE authenticated NOLOGIN;
    CREATE ROLE service_role NOLOGIN BYPASSRLS;
    CREATE SCHEMA auth;
    CREATE TABLE auth.users(id uuid PRIMARY KEY);
    INSERT INTO auth.users VALUES ('${adminId}'),('${regularId}');
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS
      $$ SELECT (nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'sub')::uuid $$;
  `)
  await db.exec(`
    CREATE FUNCTION auth.jwt() RETURNS jsonb LANGUAGE sql STABLE AS
      $$ SELECT COALESCE(nullif(current_setting('request.jwt.claims', true),'')::jsonb,'{}'::jsonb) $$;
    GRANT USAGE ON SCHEMA public,auth TO anon,authenticated,service_role;
    GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA auth TO anon,authenticated,service_role;
    CREATE TABLE public.projects(id uuid PRIMARY KEY, slug text, status text);
    INSERT INTO public.projects VALUES ('${projectId}','local-project','active');
    CREATE SCHEMA private;
    GRANT USAGE ON SCHEMA private TO authenticated;
    CREATE TABLE private.existing_fixture(id integer);
    INSERT INTO private.existing_fixture VALUES(1);
    GRANT SELECT ON private.existing_fixture TO authenticated;
  `)
  await db.exec(readFileSync(new URL('../supabase/migrations/20261029000001_contact_inquiries.sql', import.meta.url), 'utf8'))
  await db.exec(readFileSync(new URL('../supabase/migrations/20261029000002_ip_independent_inquiry_limits.sql', import.meta.url), 'utf8'))
  const asRole = (role, claims, sql, args = []) => db.transaction(async tx => {
    await tx.exec(`SET LOCAL ROLE ${role}`)
    await tx.query("SELECT set_config('request.jwt.claims',$1,true)", [JSON.stringify(claims)])
    return tx.query(sql, args)
  })
  const rpc = async (name, args) => {
    try {
      if (name === 'claim_contact_notifications') {
        return (await asRole('service_role', {}, 'SELECT to_jsonb(r) AS value FROM public.claim_contact_notifications() r')).rows.map(r => r.value)
      }
      return (await asRole('service_role', {}, `SELECT public.${name}(${Object.keys(args).map((_, i) => `$${i + 1}`).join(',')}) AS value`, Object.values(args))).rows[0].value
    } catch (error) {
      if (error.message === 'IDEMPOTENCY_CONFLICT') throw new InquiryError('IDEMPOTENCY_CONFLICT', 409)
      if (error.message === 'RATE_LIMITED') throw new InquiryError('RATE_LIMITED', 429)
      throw error
    }
  }
  const direct = (key = crypto.randomUUID(), hmac = 'a'.repeat(64)) => rpc('create_contact_inquiry', {
    p_key: key, p_hmac: hmac, p_name: 'Local test', p_email: 'test@example.com', p_company: null,
    p_message: 'Local isolated test message.', p_project_slug: 'local-project', p_type: null, p_solution: null,
    p_consent_version: 'local', p_retention_version: 'local', p_retention_days: 2,
    p_email_hmac: 'b'.repeat(64),
  })
  const reset = () => db.exec('TRUNCATE public.contact_inquiries CASCADE; TRUNCATE private.contact_request_windows;')
  const tokens = new Set()
  const captcha = async (_url, init) => {
    const body = JSON.parse(init.body)
    const success = !tokens.has(body.response) && body.response !== 'invalid'
    tokens.add(body.response)
    return Response.json({ success, hostname: 'local.example', action: 'contact' })
  }
  const handler = createSubmitHandler(env, rpc, captcha)
  try {
    await t.test('approved policy publishes before intake without CAPTCHA, HMAC, DB or provider calls', async () => {
      const config = key => ({
        ...settings, CONTACT_INTAKE_ENABLED: 'false', TURNSTILE_SECRET_KEY: '',
        TURNSTILE_SITE_KEY: '', INQUIRY_HMAC_KEY: '',
      })[key]
      const closed = createSubmitHandler(config, () => { throw Error('Must not call DB') },
        () => { throw Error('Must not call provider') })
      assert.equal(configuration(config).enabled, false)
      const get = () => new Request('https://local.example/submit', { headers: { origin: 'https://local.example' } })
      const result = await closed(get())
      assert.equal(result.status, 200)
      assert.deepEqual((await result.json()).data, {
        version: policy.version, text: policy.text, privacyText: policy.privacyText, siteKey: '',
      })
      const post = await closed(request(input()))
      assert.equal(post.status, 503)
      assert.equal((await post.json()).error.code, 'INTAKE_DISABLED')
      for (const change of [{ INQUIRY_POLICY_APPROVED: 'false' }, { INQUIRY_POLICY_JSON: '{}' },
        { INQUIRY_POLICY_JSON: JSON.stringify({ ...policy, privacyText: '' }) }]) {
        const unpublished = createSubmitHandler(key => change[key] ?? config(key),
          () => { throw Error('Must not call DB') })
        const response = await unpublished(get())
        assert.equal(response.status, 503)
        const body = await response.text()
        assert.ok(body.includes('POLICY_NOT_PUBLISHED'))
        assert.equal(body.includes(policy.privacyText), false)
      }
      const foreign = get(); foreign.headers.set('origin', 'https://evil.example')
      assert.equal((await closed(foreign)).status, 403)
    })
    await t.test('migration preserves existing private schema permissions and data', async () => {
      const fixture = await asRole('authenticated', { sub: regularId }, 'SELECT * FROM private.existing_fixture')
      assert.equal(fixture.rows[0].id, 1)
      await assert.rejects(asRole('authenticated', { sub: regularId }, 'SELECT * FROM private.contact_request_windows'), /permission denied/)
    })
    await t.test('policy missing/disabled: 503 before DB, no provisional consent', async () => {
      for (const change of [{ CONTACT_INTAKE_ENABLED: 'false' }, { INQUIRY_POLICY_JSON: '{}' },
        { INQUIRY_POLICY_JSON: JSON.stringify({ ...policy, privacyText: '' }) }, { INQUIRY_HMAC_KEY: '' }]) {
        const config = key => ({ ...settings, ...change })[key]
        assert.equal(configuration(config).enabled, false)
        const response = await createSubmitHandler(config, () => { throw Error('Must not call DB') }, captcha)(request(input()))
        assert.equal(response.status, 503)
      }
    })
    await t.test('server input boundaries, consent, unknown fields, control/header injection', () => {
      for (const change of [
        { name: '' }, { name: 'x'.repeat(81) }, { message: 'x'.repeat(9) }, { message: 'x'.repeat(5001) },
        { email: 'a@example.com\r\nBcc: b@example.com' }, { company: 'x'.repeat(121) },
        { consent: { accepted: false, version: policy.version } }, { status: 'resolved' },
        { website: 'bot' }, { project_slug: 'https://internal' }, { solution: 'unknown' },
      ]) assert.throws(() => validateInput({ ...input(), ...change }, policy.version))
      const clean = validateInput({ ...input(), name: '한'.repeat(80), message: '한'.repeat(5000) }, policy.version)
      assert.equal(clean.email, 'test@example.com')
    })
    await t.test('one policy response supplies matching consent/privacy version and explicit 365-day expiry', async () => {
      await reset()
      const candidate = { ...policy, version: 'LOCAL-365-TEST', retentionVersion: 'LOCAL-365-RETENTION', retentionDays: 365 }
      const configured = key => key === 'INQUIRY_POLICY_JSON' ? JSON.stringify(candidate) : env(key)
      const isolated = createSubmitHandler(configured, rpc, captcha)
      const publicPolicy = await isolated(new Request('https://local.example/submit', {
        headers: { origin: 'https://local.example' },
      }))
      const data = (await publicPolicy.json()).data
      assert.equal(data.version, candidate.version)
      assert.equal(data.text, candidate.text)
      assert.equal(data.privacyText, candidate.privacyText)
      assert.equal((await isolated(request({ ...input(), consent: { accepted: true, version: data.version } }))).status, 201)
      const row = (await db.query(`SELECT consent_version,retention_policy_version,
        extract(epoch FROM expires_at-created_at)/86400 AS days FROM public.contact_inquiries`)).rows[0]
      assert.equal(row.consent_version, candidate.version)
      assert.equal(row.retention_policy_version, candidate.retentionVersion)
      assert.equal(Number(row.days), 365)
      const stale = await isolated(request(input(), crypto.randomUUID(), '127.0.0.2'))
      assert.equal(stale.status, 422)
      assert.equal((await db.query('SELECT count(*)::int AS n FROM public.contact_inquiries')).rows[0].n, 1)
    })
    await t.test('normal reception persists and returns receipt only', async () => {
      await reset()
      const result = await handler(request(input()))
      assert.equal(result.status, 201)
      const body = await result.json()
      assert.match(body.data.receipt_number, /^BQ-/)
      assert.deepEqual(Object.keys(body.data).sort(), ['receipt_number', 'received_at'])
      assert.equal((await db.query('SELECT count(*)::int AS n FROM public.contact_inquiries')).rows[0].n, 1)
    })
    await t.test('same key replay, changed payload conflict, single-use CAPTCHA', async () => {
      await reset()
      const key = crypto.randomUUID(), body = input()
      const first = await handler(request(body, key))
      assert.equal(first.status, 201)
      assert.equal((await handler(request(body, key))).status, 403)
      const replay = await handler(request({ ...body, turnstile_token: crypto.randomUUID() }, key))
      assert.equal(replay.status, 200)
      assert.deepEqual((await replay.json()).data, (await first.json()).data)
      assert.equal((await handler(request({ ...body, message: 'A changed inquiry payload.', turnstile_token: crypto.randomUUID() }, key))).status, 409)
    })
    await t.test('parallel callers: unique idempotency key and atomic rate window', async () => {
      await reset()
      const key = crypto.randomUUID()
      const receipts = await Promise.all(Array.from({ length: 10 }, () => direct(key)))
      assert.equal(new Set(receipts.map(r => r.receipt_number)).size, 1)
      assert.equal(receipts.filter(r => !r.replayed).length, 1)
      const limits = await Promise.all(Array.from({ length: 40 }, () => rpc('consume_contact_challenge_budget', {})))
      assert.equal(limits.filter(Boolean).length, 30)
      const count = (await db.query("SELECT request_count FROM private.contact_request_windows WHERE bucket_key='accepted'")).rows[0]
      assert.equal(count.request_count, 1)
    })
    await t.test('IP headers and legacy verification flags are ignored, including missing and forged values', async () => {
      await reset()
      assert.doesNotMatch(source, /INQUIRY_IP_HEADER_VERIFIED|INQUIRY_TRUSTED_IP_HEADER|x-real-ip|cf-connecting-ip|x-forwarded-for|p_ip_key/)
      const seen = []
      const guardedEnv = key => {
        assert.ok(!['INQUIRY_IP_HEADER_VERIFIED', 'INQUIRY_TRUSTED_IP_HEADER'].includes(key))
        return env(key)
      }
      const isolated = createSubmitHandler(guardedEnv, async (name, args) => {
        seen.push({ name, args })
        return rpc(name, args)
      }, captcha)
      for (const value of [null, '198.51.100.55', '198.51.100.55, 203.0.113.99']) {
        const req = request(input())
        req.headers.delete('x-real-ip')
        if (value) {
          req.headers.set('x-real-ip', value)
          req.headers.set('cf-connecting-ip', value)
          req.headers.set('x-forwarded-for', value)
        }
        assert.equal((await isolated(req)).status, 201)
      }
      assert.equal(JSON.stringify(seen).includes('198.51.100.55'), false)
      assert.equal(JSON.stringify(seen).includes('p_ip_key'), false)
      const counters = (await db.query('SELECT bucket_key FROM private.contact_request_windows')).rows
      assert.equal(counters.some(r => r.bucket_key.startsWith('ip/')), false)
    })
    await t.test('CAPTCHA provider requests cannot exceed 30 per minute, even with failed challenges and rotating inputs', async () => {
      await reset()
      let calls = 0
      const isolated = createSubmitHandler(env, rpc, async (_url, init) => {
        calls++
        assert.deepEqual(Object.keys(JSON.parse(init.body)).sort(), ['response', 'secret'])
        return Response.json({ success: false })
      })
      const responses = await Promise.all(Array.from({ length: 40 }, (_, n) =>
        isolated(request({ ...input(), email: `test-${n}@example.com` }, crypto.randomUUID(), `192.0.2.${n}`))))
      assert.equal(calls, 30)
      assert.equal(responses.filter(r => r.status === 403).length, 30)
      assert.equal(responses.filter(r => r.status === 429).length, 10)
      assert.equal((await db.query('SELECT count(*)::int AS n FROM public.contact_inquiries')).rows[0].n, 0)
      await db.exec("UPDATE private.contact_request_windows SET window_start=window_start-interval '2 minutes'")
      assert.equal((await isolated(request(input()))).status, 403)
      assert.equal(calls, 31)
      const noBudget = createSubmitHandler(env, async () => { throw Error('LOCAL-PRIVATE-DB-FAILURE') },
        async () => { calls++; throw Error('Provider must not be called') })
      const unavailable = await noBudget(request(input()))
      assert.equal(unavailable.status, 503)
      assert.equal(calls, 31)
      assert.equal((await unavailable.text()).includes('LOCAL-PRIVATE-DB-FAILURE'), false)
    })
    await t.test('CAPTCHA accepts only literal success true and the configured hostname and action', async () => {
      await reset()
      for (const value of [null, [], { success: 'true', hostname: 'local.example', action: 'contact' },
        { success: true, hostname: 'evil.example', action: 'contact' },
        { success: true, hostname: 'local.example', action: 'other' }]) {
        const isolated = createSubmitHandler(env, rpc, async () => Response.json(value))
        assert.equal((await isolated(request(input()))).status, 403)
      }
      const offline = createSubmitHandler(env, rpc, async () => { throw Error('local provider failure') })
      assert.equal((await offline(request(input()))).status, 503)
      assert.equal((await db.query('SELECT count(*)::int AS n FROM public.contact_inquiries')).rows[0].n, 0)
    })
    await t.test('email HMAC limit is atomic after CAPTCHA; replay does not spend another acceptance slot', async () => {
      await reset()
      const results = await Promise.allSettled(Array.from({ length: 12 }, () => direct()))
      assert.equal(results.filter(r => r.status === 'fulfilled').length, 5)
      assert.ok(results.filter(r => r.status === 'rejected').every(r => r.reason.code === 'RATE_LIMITED'))
      assert.equal((await db.query('SELECT count(*)::int AS n FROM public.contact_inquiries')).rows[0].n, 5)
      const row = (await db.query('SELECT idempotency_key FROM public.contact_inquiries LIMIT 1')).rows[0]
      assert.equal((await direct(row.idempotency_key)).replayed, true)
      assert.equal((await db.query("SELECT request_count FROM private.contact_request_windows WHERE bucket_key='accepted'")).rows[0].request_count, 5)
      await reset()
      for (let n = 0; n < 5; n++) assert.equal((await handler(request({ ...input(), email: n % 2 ? 'TEST@example.com' : 'test@EXAMPLE.com' }))).status, 201)
      const limited = await handler(request(input()))
      assert.equal(limited.status, 429)
      assert.equal(limited.headers.get('retry-after'), '600')
      assert.match((await limited.json()).error.message, /jngdy@baikalsys\.kr/)
      const buckets = (await db.query("SELECT bucket_key,request_count FROM private.contact_request_windows WHERE bucket_key LIKE 'email/%'")).rows
      assert.equal(buckets.length, 1)
      assert.match(buckets[0].bucket_key, /^email\/[a-f0-9]{64}$/)
      assert.equal(buckets[0].request_count, 5)
    })
    await t.test('global acceptance cap rejects rotating emails atomically with no partial inquiry or queued mail', async () => {
      await reset()
      const attempts = await Promise.allSettled(Array.from({ length: 40 }, (_, n) => rpc('create_contact_inquiry', {
        p_key: crypto.randomUUID(), p_hmac: 'a'.repeat(64), p_name: 'Local test', p_email: `test-${n}@example.com`,
        p_company: null, p_message: 'Local isolated test message.', p_project_slug: null, p_type: null, p_solution: null,
        p_consent_version: 'local', p_retention_version: 'local', p_retention_days: 2,
        p_email_hmac: n.toString(16).padStart(64, '0'),
      })))
      assert.equal(attempts.filter(r => r.status === 'fulfilled').length, 30)
      assert.equal(attempts.filter(r => r.status === 'rejected' && r.reason.code === 'RATE_LIMITED').length, 10)
      assert.equal((await db.query('SELECT count(*)::int AS n FROM public.contact_inquiries')).rows[0].n, 30)
      assert.equal((await db.query("SELECT request_count FROM private.contact_request_windows WHERE bucket_key='accepted'")).rows[0].request_count, 30)
      assert.equal((await db.query("SELECT count(*)::int AS n FROM private.contact_request_windows WHERE bucket_key LIKE 'email/%'")).rows[0].n, 30)
    })
    await t.test('IP-era RPC entry points are removed and new RPCs are service-role only', async () => {
      await reset()
      assert.equal((await db.query(`SELECT to_regprocedure('public.consume_contact_rate(text)') AS old`)).rows[0].old, null)
      assert.equal((await db.query(`SELECT to_regprocedure('public.create_contact_inquiry(uuid,text,text,text,text,text,text,text,text,text,text,integer)') AS old`)).rows[0].old, null)
      for (const role of ['anon', 'authenticated']) {
        await assert.rejects(asRole(role, { sub: regularId }, 'SELECT public.consume_contact_challenge_budget()'), /permission denied/)
        await assert.rejects(asRole(role, { sub: regularId }, `SELECT public.create_contact_inquiry(
          gen_random_uuid(),$1,'Local','test@example.com',NULL,'Local test message.',NULL,NULL,NULL,'local','local',2,$2)`,
        ['a'.repeat(64), 'b'.repeat(64)]), /permission denied/)
      }
    })
    await t.test('failure logging contains only code and random request ID, never payload, IP, token or HMAC', async () => {
      await reset()
      const logs = []
      const warn = console.warn
      console.warn = (...args) => logs.push(args)
      try {
        const raw = { ...input(), email: 'private-test@example.com', message: 'PRIVATE-LOCAL-MESSAGE', turnstile_token: 'invalid' }
        assert.equal((await handler(request(raw, crypto.randomUUID(), '198.51.100.55'))).status, 403)
        const text = JSON.stringify(logs)
        for (const secret of [raw.email, raw.message, '198.51.100.55', settings.INQUIRY_HMAC_KEY, raw.turnstile_token]) {
          assert.equal(text.includes(secret), false)
        }
        assert.deepEqual(Object.keys(logs[0][1]).sort(), ['code', 'requestId'])
      } finally { console.warn = warn }
    })
    await t.test('invalid challenge/origin/payload, size and rate reject without new reception', async () => {
      await reset()
      assert.equal((await handler(request({ ...input(), turnstile_token: 'invalid' }))).status, 403)
      const wrongOrigin = request(input()); wrongOrigin.headers.set('origin', 'https://evil.example')
      assert.equal((await handler(wrongOrigin)).status, 403)
      assert.equal((await handler(request({ ...input(), message: 'x'.repeat(40000) }))).status, 413)
      assert.equal((await db.query('SELECT count(*)::int AS n FROM public.contact_inquiries')).rows[0].n, 0)
      await reset()
      for (let n = 0; n < 30; n++) await handler(request({ ...input(), turnstile_token: 'invalid' }))
      const limited = await handler(request(input()))
      assert.equal(limited.status, 429)
      assert.equal(limited.headers.get('retry-after'), '60')
    })
    await t.test('anonymous DB access denied; ordinary/user_metadata-only admin cannot read or change', async () => {
      await reset()
      await direct()
      for (const sql of ['SELECT * FROM public.contact_inquiries', 'SELECT * FROM public.contact_inquiry_list',
        'INSERT INTO public.contact_inquiries DEFAULT VALUES', 'DELETE FROM public.contact_inquiries',
        'SELECT public.consume_contact_challenge_budget()']) {
        await assert.rejects(asRole('anon', {}, sql), /permission denied/)
      }
      const row = (await db.query('SELECT id FROM public.contact_inquiries')).rows[0]
      for (const claims of [{ sub: regularId }, { sub: regularId, user_metadata: { role: 'admin' } }]) {
        assert.equal((await asRole('authenticated', claims, 'SELECT * FROM public.contact_inquiries')).rows.length, 0)
        assert.equal((await asRole('authenticated', claims, 'SELECT * FROM public.contact_inquiry_list')).rows.length, 0)
        await assert.rejects(asRole('authenticated', claims, "SELECT public.admin_update_contact_inquiry($1,1,'in_progress')", [row.id]), /FORBIDDEN/)
        await assert.rejects(asRole('authenticated', claims, 'SELECT public.admin_retry_contact_notification($1,1)', [row.id]), /FORBIDDEN/)
        await assert.rejects(asRole('authenticated', claims, 'SELECT public.claim_contact_notifications()'), /permission denied/)
      }
    })
    await t.test('app_metadata administrator: masked list schema, state history and version conflict', async () => {
      const claims = { sub: adminId, app_metadata: { role: 'admin' } }
      const rows = await asRole('authenticated', claims, 'SELECT * FROM public.contact_inquiry_list')
      assert.equal(rows.rows.length, 1)
      assert.ok(!('email' in rows.rows[0]) && !('name' in rows.rows[0]) && !('message' in rows.rows[0]))
      const id = rows.rows[0].id
      await asRole('authenticated', claims, "SELECT public.admin_update_contact_inquiry($1,1,'in_progress')", [id])
      await assert.rejects(asRole('authenticated', claims, "SELECT public.admin_update_contact_inquiry($1,1,'spam')", [id]), /VERSION_CONFLICT/)
      await assert.rejects(asRole('authenticated', claims, "UPDATE public.contact_inquiries SET status='resolved' WHERE id=$1", [id]), /permission denied/)
      await asRole('authenticated', claims, "SELECT public.admin_update_contact_inquiry($1,2,'resolved')", [id])
      assert.equal((await db.query('SELECT count(*)::int AS n FROM public.contact_inquiry_events')).rows[0].n, 2)
    })
    await t.test('worker claims uniquely, provider failure preserves inquiry and retries same email key', async () => {
      await reset(); await direct()
      const rows = await rpc('claim_contact_notifications', {})
      assert.equal(rows.length, 1)
      assert.equal((await rpc('claim_contact_notifications', {})).length, 0)
      const keys = []
      const failSend = async (_url, init) => { keys.push(init.headers['Idempotency-Key']); return new Response('', { status: 500 }) }
      const a = await notify(rows[0], env, failSend)
      await notify(rows[0], env, failSend)
      assert.equal(keys[0], keys[1])
      assert.equal(a.p_status, 'queued')
      assert.equal(await rpc('finish_contact_notification', a), true)
      assert.equal(await rpc('finish_contact_notification', a), false)
      assert.equal((await db.query('SELECT count(*)::int AS n FROM public.contact_inquiries')).rows[0].n, 1)
    })
    await t.test('successful provider acceptance, no customer PII in mail, no repeated claim', async () => {
      await reset(); await direct()
      const row = (await rpc('claim_contact_notifications', {}))[0]
      let payload
      const result = await notify(row, env, async (_url, init) => { payload = JSON.parse(init.body); return Response.json({ id: 'mock-provider-id' }) })
      assert.equal(result.p_status, 'accepted')
      assert.ok(!payload.text.includes('Local test') && !payload.text.includes('test@example.com'))
      assert.equal(await rpc('finish_contact_notification', result), true)
      assert.equal((await rpc('claim_contact_notifications', {})).length, 0)
    })
    await t.test('retry window expiration becomes unknown and cannot blindly resend', async () => {
      await reset(); await direct()
      await db.exec("UPDATE public.contact_inquiries SET notification_status='processing',notification_first_attempt_at=now()-interval '24 hours',lease_until=now()-interval '1 minute'")
      assert.equal((await rpc('claim_contact_notifications', {})).length, 0)
      const row = (await db.query('SELECT id,version,notification_status FROM public.contact_inquiries')).rows[0]
      assert.equal(row.notification_status, 'unknown')
      await assert.rejects(asRole('authenticated', { sub: adminId, app_metadata: { role: 'admin' } },
        'SELECT public.admin_retry_contact_notification($1,$2)', [row.id, row.version]), /VERSION_OR_STATE_CONFLICT/)
    })
    await t.test('worker disabled/auth required, DB failure never success-shaped', async () => {
      const worker = createMaintenanceHandler(env, rpc, () => { throw Error('No external sending') })
      assert.equal((await worker(new Request('https://local.example/job', { method: 'POST' }))).status, 403)
      const noMail = createMaintenanceHandler(key => key === 'INQUIRY_NOTIFICATIONS_ENABLED' ? 'false' : env(key), rpc)
      const req = new Request('https://local.example/job', { method: 'POST', headers: {
        Authorization: 'Bearer ' + settings.INQUIRY_JOB_SECRET, 'Content-Type': 'application/json',
      }, body: '{"action":"notifications"}' })
      assert.equal((await noMail(req)).status, 503)
      assert.equal((await createSubmitHandler(env, async () => { throw Error('offline') }, captcha)(request(input()))).status, 503)
    })
    await t.test('approved expiry cleanup cascades events, protects active leases and preserves projects', async () => {
      await reset(); await direct()
      const id = (await db.query('SELECT id FROM public.contact_inquiries')).rows[0].id
      await asRole('authenticated', { sub: adminId, app_metadata: { role: 'admin' } },
        "SELECT public.admin_update_contact_inquiry($1,1,'in_progress')", [id])
      await db.exec("UPDATE public.contact_inquiries SET created_at=now()-interval '3 days',expires_at=now()-interval '1 day',lease_until=now()+interval '1 minute'")
      assert.equal(await rpc('cleanup_contact_inquiries', {}), 0)
      await db.exec('UPDATE public.contact_inquiries SET lease_until=NULL')
      assert.equal(await rpc('cleanup_contact_inquiries', {}), 1)
      assert.equal((await db.query('SELECT * FROM public.contact_inquiry_events')).rows.length, 0)
      assert.equal((await db.query('SELECT * FROM public.projects')).rows.length, 1)
    })
    await t.test('stale worker claim cannot overwrite a new claim and exhausted lease becomes unknown', async () => {
      await reset(); await direct()
      const first = (await rpc('claim_contact_notifications', {}))[0]
      await db.exec("UPDATE public.contact_inquiries SET lease_until=now()-interval '1 minute'")
      const second = (await rpc('claim_contact_notifications', {}))[0]
      assert.notEqual(first.notification_claim_id, second.notification_claim_id)
      const finish = { p_id: first.id, p_claim: first.notification_claim_id, p_status: 'accepted', p_code: 'ACCEPTED', p_provider_id: 'mock', p_delay: 60 }
      assert.equal(await rpc('finish_contact_notification', finish), false)
      await db.exec("UPDATE public.contact_inquiries SET notification_attempts=5,lease_until=now()-interval '1 minute'")
      assert.equal((await rpc('claim_contact_notifications', {})).length, 0)
      assert.equal((await db.query('SELECT notification_status FROM public.contact_inquiries')).rows[0].notification_status, 'unknown')
    })
    await t.test('daily provider budget never claims above 90 attempts', async () => {
      await reset(); await direct()
      await db.exec(`INSERT INTO private.contact_request_windows VALUES
        ('mail',date_trunc('day',now() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC',90,now()+interval '2 days')`)
      assert.equal((await rpc('claim_contact_notifications', {})).length, 0)
    })
    await t.test('confirmed provider rejection supports admin retry; ambiguous 409 stays retryable', async () => {
      await reset(); await direct()
      const row = (await rpc('claim_contact_notifications', {}))[0]
      const rejected = await notify(row, env, async () => new Response('', { status: 401 }))
      assert.equal(rejected.p_status, 'failed')
      await rpc('finish_contact_notification', rejected)
      await asRole('authenticated', { sub: adminId, app_metadata: { role: 'admin' } },
        'SELECT public.admin_retry_contact_notification($1,1)', [row.id])
      const retry = (await rpc('claim_contact_notifications', {}))[0]
      assert.equal(retry.notification_generation, 2)
      const ambiguous = await notify(retry, env, async () => new Response('', { status: 409 }))
      assert.equal(ambiguous.p_status, 'queued')
    })
    await t.test('authorized maintenance calls real local queue with fake provider only', async () => {
      await reset(); await direct()
      let sends = 0
      const worker = createMaintenanceHandler(env, rpc, async () => { sends++; return Response.json({ id: 'local-provider' }) })
      const req = () => new Request('https://local.example/job', { method: 'POST', headers: {
        Authorization: 'Bearer ' + settings.INQUIRY_JOB_SECRET, 'Content-Type': 'application/json',
      }, body: '{"action":"notifications"}' })
      assert.equal((await worker(req())).status, 200)
      assert.equal((await worker(req())).status, 200)
      assert.equal(sends, 1)
    })
    await t.test('REST adapter maps known conflicts and does not expose database failures', async () => {
      const configured = key => ({ SUPABASE_URL: 'http://local.invalid', SUPABASE_SERVICE_ROLE_KEY: 'local-mock' })[key]
      const adapter = databaseRpc(configured, async () => Response.json({ message: 'IDEMPOTENCY_CONFLICT' }, { status: 400 }))
      await assert.rejects(adapter('create_contact_inquiry', {}), e => e.code === 'IDEMPOTENCY_CONFLICT' && e.status === 409)
      const failure = databaseRpc(configured, async () => new Response('internal database details', { status: 503 }))
      await assert.rejects(failure('create_contact_inquiry', {}), e => e.code === 'DATABASE_UNAVAILABLE')
      const limited = databaseRpc(configured, async () => Response.json({ message: 'RATE_LIMITED' }, { status: 400 }))
      await assert.rejects(limited('create_contact_inquiry', {}), e => e.code === 'RATE_LIMITED' && e.status === 429)
    })
  } finally { await db.close() }
})
