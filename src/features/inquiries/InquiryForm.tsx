import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { fetchInquiryPolicy, intakeEnabled, submitInquiry } from './inquiryService'
import type { InquiryPolicy, InquiryReceipt } from './inquiryService'

interface Turnstile {
  render: (node: HTMLElement, options: { sitekey: string; action: string; callback: (token: string) => void; 'expired-callback': () => void; 'error-callback': () => void }) => string
  remove: (id: string) => void
  reset: (id: string) => void
}
declare global { interface Window { turnstile?: Turnstile } }

export default function InquiryForm() {
  const [params] = useSearchParams()
  const [policy, setPolicy] = useState<InquiryPolicy | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [token, setToken] = useState('')
  const [receipt, setReceipt] = useState<InquiryReceipt | null>(null)
  const container = useRef<HTMLDivElement>(null)
  const widget = useRef<string>()
  const key = useRef<string>()
  const form = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (!intakeEnabled) return
    let active = true
    fetchInquiryPolicy().then(value => { if (active) setPolicy(value) })
      .catch(() => { if (active) setError('승인된 개인정보 정책·접수 설정을 확인하지 못했습니다. 이메일로 문의해 주세요.') })
    return () => { active = false }
  }, [])
  useEffect(() => {
    if (!policy || receipt) return
    let active = true
    const render = () => {
      if (!active || !container.current || !window.turnstile) return
      widget.current = window.turnstile.render(container.current, {
        sitekey: policy.siteKey, action: 'contact', callback: setToken,
        'expired-callback': () => setToken(''),
        'error-callback': () => { setToken(''); setError('보안 확인을 완료하지 못했습니다. 다시 시도하거나 이메일로 문의해 주세요.') },
      })
    }
    let script: HTMLScriptElement | undefined
    if (window.turnstile) render()
    else {
      script = document.createElement('script')
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
      script.async = true
      script.onload = render
      script.onerror = () => { if (active) setError('보안 확인을 불러오지 못했습니다. 이메일로 문의해 주세요.') }
      document.head.appendChild(script)
    }
    return () => {
      active = false
      if (widget.current) window.turnstile?.remove(widget.current)
      widget.current = undefined
      script?.remove()
    }
  }, [policy, receipt])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!intakeEnabled || !policy || !token || busy) return
    const values = new FormData(e.currentTarget)
    setBusy(true); setError('')
    try {
      key.current ??= sessionStorage.getItem('contact_submission_key') || crypto.randomUUID()
      sessionStorage.setItem('contact_submission_key', key.current)
      const read = (name: string) => String(values.get(name) || '')
      const result = await submitInquiry({
        name: read('name'), email: read('email'), company: read('company'), message: read('message'),
        website: read('website'), project_slug: params.get('project'), inquiry_type: params.get('type'),
        solution: params.get('solution'), consent: { accepted: values.get('consent') === 'on', version: policy.version },
        turnstile_token: token,
      }, key.current)
      setReceipt(result); form.current?.reset()
      sessionStorage.removeItem('contact_submission_key'); key.current = undefined
    } catch (problem) { setError(problem instanceof Error ? problem.message : '접수 처리 중 오류가 발생했습니다.') }
    finally {
      setToken(''); if (widget.current) window.turnstile?.reset(widget.current)
      setBusy(false)
    }
  }
  const disabled = !intakeEnabled || !policy
  return (
    <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.02] p-6 sm:p-8 sentry-block" data-sentry-block>
      <h2 className="text-xl font-bold text-white">개발 상담 접수</h2>
      {receipt ? (
        <div role="status" className="mt-4 space-y-3 text-white/70">
          <p>문의가 접수되었습니다. 접수번호를 보관해 주세요.</p>
          <p className="break-all">{receipt.receipt_number}</p>
          <p>{new Date(receipt.received_at).toLocaleString('ko-KR')}</p>
          <p>담당자가 확인 후 입력하신 이메일로 연락드립니다.</p>
          <button type="button" className="admin-input" onClick={() => navigator.clipboard.writeText(receipt.receipt_number).catch(() => setError('접수번호 복사에 실패했습니다. 번호를 직접 보관해 주세요.'))}>접수번호 복사</button>
          <button type="button" className="ml-4 underline" onClick={() => setReceipt(null)}>새 문의 작성</button>
        </div>
      ) : (
        <form ref={form} onSubmit={handleSubmit} className="mt-5 space-y-4" aria-describedby="inquiry-policy">
          <p id="inquiry-policy" className="whitespace-pre-wrap text-sm text-slate-300">
            {policy?.text || '개인정보 수집·이용 정책과 보유·삭제 기간이 미확정되어 웹 접수는 비활성 상태입니다. 기존 이메일로 문의해 주세요.'}
          </p>
          <p className="text-sm text-slate-300">
            <Link to="/privacy" className="underline" target="_blank" rel="noopener noreferrer">개인정보 처리방침</Link>
            {policy && <span className="ml-3">정책 버전: {policy.version}</span>}
          </p>
          <p className="text-xs text-slate-400">인증정보·주민번호 등 민감한 내용은 입력하지 마세요. 첨부파일은 받지 않습니다.</p>
          <fieldset disabled={disabled || busy} className="space-y-4 disabled:opacity-50">
            {[['name', '이름 (필수)', 'text', 80], ['email', '회신 이메일 (필수)', 'email', 254], ['company', '회사/기관 (선택)', 'text', 120]].map(([name, label, type, max]) => (
              <label key={name} className="block text-sm text-white/70">
                {label}
                <input name={String(name)} type={String(type)} maxLength={Number(max)} required={name !== 'company'}
                  autoComplete="off" className="admin-input mt-2 w-full" data-sentry-mask />
              </label>
            ))}
            <label className="block text-sm text-white/70">문의 내용 (필수)
              <textarea name="message" required minLength={10} maxLength={5000} rows={6} className="admin-input mt-2 w-full" data-sentry-mask />
            </label>
            <div className="hidden" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
            <label className="flex items-start gap-2 text-sm text-white/70">
              <input name="consent" type="checkbox" required className="mt-1" />
              {policy ? '위 개인정보 수집·이용에 동의합니다. (필수)' : '정책 확정 전에는 동의 및 제출할 수 없습니다.'}
            </label>
          </fieldset>
          <div ref={container} />
          <button type="submit" disabled={disabled || busy || !token} className="rounded-full bg-white px-7 py-3 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-40">
            {busy ? '접수 확인 중…' : '문의 접수'}
          </button>
        </form>
      )}
      {error && <div className="mt-4">
        <p role="alert" className="text-sm text-red-300">{error}</p>
        {!receipt && policy && <button type="button" className="mt-3 text-sm text-white/60 underline" onClick={() => {
          if (!window.confirm('이미 접수됐을 수 있습니다. 중복 접수 가능성을 확인하고 새 문의를 작성하시겠습니까?')) return
          sessionStorage.removeItem('contact_submission_key'); key.current = undefined
          form.current?.reset(); setError(''); setToken('')
          if (widget.current) window.turnstile?.reset(widget.current)
        }}>기존 접수 재시도가 아닌 새 문의 작성</button>}
      </div>}
    </div>
  )
}
