import { supabase } from '@/lib/supabase'

export type InquiryStatus = 'new' | 'in_progress' | 'resolved' | 'spam'
export const statusLabels: Record<InquiryStatus, string> = {
  new: '신규', in_progress: '응대 중', resolved: '완료', spam: '스팸',
}
export const transitions: Record<InquiryStatus, InquiryStatus[]> = {
  new: ['in_progress', 'spam'], in_progress: ['resolved', 'spam'], resolved: ['new'], spam: ['new'],
}
export interface InquirySummary {
  id: string; receipt_number: string; company: string | null; project_id: string | null
  status: InquiryStatus; version: number; created_at: string; updated_at: string
  notification_status: 'queued' | 'processing' | 'accepted' | 'failed' | 'unknown'
  notification_last_code: string | null; next_attempt_at: string
}
export interface InquiryDetail extends InquirySummary {
  name: string; email: string; message: string; consent_version: string; expires_at: string
}
export interface InquiryEvent { id: string; from_status: InquiryStatus; to_status: InquiryStatus; happened_at: string }
export interface InquiryPolicy { version: string; text: string; privacyText: string; siteKey: string }
export interface InquiryReceipt { receipt_number: string; received_at: string }
export interface InquiryInput {
  name: string; email: string; company: string; message: string
  project_slug: string | null; inquiry_type: string | null; solution: string | null
  consent: { accepted: boolean; version: string }; website: string; turnstile_token: string
}
export const intakeEnabled = import.meta.env.VITE_CONTACT_INTAKE_ENABLED === 'true'
export const notificationLabels: Record<InquirySummary['notification_status'], string> = {
  queued: '대기', processing: '전송 처리 중', accepted: '메일 서비스 접수', failed: '확정 실패', unknown: '전송 여부 불명확',
}
const endpoint = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/submit-inquiry`

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}
async function publicRequest(init: RequestInit): Promise<unknown> {
  if (!intakeEnabled) throw new Error('개인정보 정책·접수 설정 확정 전에는 웹 접수를 사용할 수 없습니다.')
  let r: Response
  try { r = await fetch(endpoint, { ...init, credentials: 'omit', signal: AbortSignal.timeout(15000) }) }
  catch { throw new Error('접수 여부를 확인하지 못했습니다. 입력을 바꾸지 않고 같은 접수를 재시도하거나 이메일로 문의해 주세요.') }
  let body: unknown
  try { body = await r.json() }
  catch { throw new Error('접수 응답을 확인하지 못했습니다. 입력을 바꾸지 않고 같은 접수를 재시도해 주세요.') }
  if (!r.ok || !isRecord(body) || body.success !== true || !('data' in body)) {
    if (r.status === 429) throw new Error(`요청이 많습니다. ${r.headers.get('retry-after') || '600'}초 후 다시 시도해 주세요.`)
    if (r.status === 409) throw new Error('같은 접수의 입력이 변경됐습니다. 원래 입력으로 재시도하거나 새 문의를 작성해 주세요.')
    throw new Error('접수를 완료하지 못했습니다. 동의 내용·입력·보안 확인을 다시 확인하거나 이메일로 문의해 주세요.')
  }
  return body.data
}
export async function fetchInquiryPolicy(): Promise<InquiryPolicy> {
  const policy = await publicRequest({ method: 'GET' })
  if (!isRecord(policy) || typeof policy.version !== 'string' || !policy.version.trim() ||
    typeof policy.text !== 'string' || !policy.text.trim() ||
    typeof policy.privacyText !== 'string' || !policy.privacyText.trim() ||
    typeof policy.siteKey !== 'string' || !policy.siteKey.trim()) {
    throw new Error('승인된 개인정보 정책을 불러오지 못했습니다.')
  }
  return { version: policy.version, text: policy.text, privacyText: policy.privacyText, siteKey: policy.siteKey }
}
export async function submitInquiry(input: InquiryInput, key: string): Promise<InquiryReceipt> {
  const data = await publicRequest({
    method: 'POST', headers: { 'Content-Type': 'application/json', 'Idempotency-Key': key }, body: JSON.stringify(input),
  })
  if (!isRecord(data) || typeof data.receipt_number !== 'string' || !data.receipt_number.trim() ||
    typeof data.received_at !== 'string' || !Number.isFinite(Date.parse(data.received_at))) {
    throw new Error('접수번호를 확인하지 못했습니다. 같은 접수를 재시도해 주세요.')
  }
  return { receipt_number: data.receipt_number, received_at: data.received_at }
}

async function requireAdmin() {
  const { data, error } = await supabase.auth.getUser()
  if (error || data.user?.app_metadata?.role !== 'admin') throw new Error('관리자 인증이 필요합니다.')
}
export interface InquiryFilters { status: string; receipt: string; since: string; notification: string }
export async function listInquiries(filters: InquiryFilters, cursor: { created_at: string; id: string } | null) {
  await requireAdmin()
  let query = supabase.from('contact_inquiry_list').select('*')
    .order('created_at', { ascending: false }).order('id', { ascending: false }).limit(20)
  if (filters.status) query = query.eq('status', filters.status)
  if (filters.receipt.trim()) query = query.eq('receipt_number', filters.receipt.trim())
  if (filters.since) query = query.gte('created_at', new Date(`${filters.since}T00:00:00`).toISOString())
  if (filters.notification) query = query.eq('notification_status', filters.notification)
  if (cursor) query = query.or(`created_at.lt.${cursor.created_at},and(created_at.eq.${cursor.created_at},id.lt.${cursor.id})`)
  const { data, error } = await query
  if (error) throw new Error('문의 목록을 읽지 못했습니다. 접수 테이블 배포·권한과 연결을 확인해 주세요.')
  return (data ?? []) as InquirySummary[]
}
export async function inquiryCounts() {
  await requireAdmin()
  const [fresh, failed] = await Promise.all([
    supabase.from('contact_inquiry_list').select('id', { count: 'exact', head: true }).eq('status', 'new'),
    supabase.from('contact_inquiry_list').select('id', { count: 'exact', head: true }).in('notification_status', ['failed', 'unknown']),
  ])
  if (fresh.error || failed.error) throw new Error('신규 문의·알림 실패 건수를 읽지 못했습니다.')
  return { fresh: fresh.count ?? 0, failed: failed.count ?? 0 }
}
export async function getInquiry(id: string) {
  await requireAdmin()
  const { data, error } = await supabase.from('contact_inquiries')
    .select('id,receipt_number,company,project_id,status,version,created_at,updated_at,notification_status,notification_last_code,next_attempt_at,name,email,message,consent_version,expires_at')
    .eq('id', id).single()
  if (error) throw new Error('문의 상세를 읽지 못했습니다. 접근 권한과 문의 존재 여부를 확인해 주세요.')
  const events = await supabase.from('contact_inquiry_events').select('id,from_status,to_status,happened_at')
    .eq('inquiry_id', id).order('happened_at', { ascending: false })
  if (events.error) throw new Error('문의 처리 이력을 읽지 못했습니다.')
  return { inquiry: data as InquiryDetail, events: (events.data ?? []) as InquiryEvent[] }
}
export async function updateInquiry(id: string, version: number, status: InquiryStatus) {
  await requireAdmin()
  const { error } = await supabase.rpc('admin_update_contact_inquiry', { p_id: id, p_version: version, p_status: status })
  if (error) throw new Error('상태를 변경하지 못했습니다. 다른 관리자의 변경 여부를 새로고침으로 확인해 주세요.')
}
export async function retryNotification(id: string, version: number) {
  await requireAdmin()
  const { error } = await supabase.rpc('admin_retry_contact_notification', { p_id: id, p_version: version })
  if (error) throw new Error('재시도를 예약하지 못했습니다. 확정 실패 상태와 최신 버전을 확인해 주세요.')
}
