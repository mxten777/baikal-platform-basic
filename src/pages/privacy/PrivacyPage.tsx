import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import SEOHead from '@/components/seo/SEOHead'
import { fetchPrivacyPolicy } from '@/features/inquiries/inquiryService'
import type { PrivacyPolicy } from '@/features/inquiries/inquiryService'

export default function PrivacyPage() {
  const [policy, setPolicy] = useState<PrivacyPolicy | null>(null)
  const [error, setError] = useState('')
  useEffect(() => {
    let active = true
    fetchPrivacyPolicy().then(value => { if (active) setPolicy(value) })
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
          </> : <p>{error
            ? '웹 문의 접수를 위한 개인정보 처리방침은 운영 승인 준비 중이거나 현재 조회할 수 없습니다. 미승인 고지문으로 동의를 받지 않습니다.'
            : '승인된 처리방침을 확인하고 있습니다.'}</p>}
          {error && <p role="alert" className="text-red-300">처리방침 조회에 실패했습니다. 웹 접수를 진행하지 마세요.</p>}
          <p>개인정보 보호책임자: 정동열 · 대표이사</p>
          <p>개인정보 열람·정정·삭제·처리정지 요청: <a className="underline" href="mailto:jngdy@baikalsys.kr">jngdy@baikalsys.kr</a></p>
          <Link className="inline-block underline" to="/contact">문의 안내로 돌아가기</Link>
        </div>
      </section>
    </>
  )
}
