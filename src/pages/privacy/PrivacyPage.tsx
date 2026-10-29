import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import SEOHead from '@/components/seo/SEOHead'
import { fetchInquiryPolicy, intakeEnabled } from '@/features/inquiries/inquiryService'
import type { InquiryPolicy } from '@/features/inquiries/inquiryService'

export default function PrivacyPage() {
  const [policy, setPolicy] = useState<InquiryPolicy | null>(null)
  const [error, setError] = useState('')
  useEffect(() => {
    if (!intakeEnabled) return
    let active = true
    fetchInquiryPolicy().then(value => { if (active) setPolicy(value) })
      .catch(() => { if (active) setError('승인된 처리방침을 불러오지 못했습니다. 아래 이메일로 문의해 주세요.') })
    return () => { active = false }
  }, [])
  return (
    <>
      <SEOHead title="개인정보 처리방침" canonical="/privacy" noIndex={!policy} />
      <section className="bg-[#080808] px-6 py-24">
        <div className="mx-auto max-w-3xl space-y-6 text-slate-300">
          <h1 className="text-3xl font-bold text-white">개인정보 처리방침</h1>
          {policy ? <>
            <p className="text-sm">정책 버전: {policy.version}</p>
            <div className="whitespace-pre-wrap break-words leading-8">{policy.privacyText}</div>
          </> : <p>{intakeEnabled ? (error || '승인된 처리방침을 확인하고 있습니다.') :
            '웹 문의 접수를 위한 개인정보 처리방침은 운영 승인 준비 중입니다. 미승인 고지문으로 동의를 받지 않으며 웹 접수는 비활성 상태입니다.'}</p>}
          {error && <p role="alert" className="text-red-300">처리방침 조회에 실패했습니다. 웹 접수를 진행하지 마세요.</p>}
          <p>문의: <a className="underline" href="mailto:jngdy@baikalsys.kr">jngdy@baikalsys.kr</a></p>
          <Link className="inline-block underline" to="/contact">문의 안내로 돌아가기</Link>
        </div>
      </section>
    </>
  )
}
