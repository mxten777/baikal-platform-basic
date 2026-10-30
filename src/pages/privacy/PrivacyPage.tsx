import { Link } from 'react-router-dom'
import SEOHead from '@/components/seo/SEOHead'

export default function PrivacyPage() {
  return (
    <>
      <SEOHead title="개인정보 관련 문의" canonical="/privacy" noIndex />
      <section className="bg-[#080808] px-6 py-24">
        <div className="mx-auto max-w-3xl space-y-6 text-slate-300">
          <h1 className="text-3xl font-bold text-white">개인정보 관련 문의</h1>
          <p>홈페이지 문의는 이메일로 받고 있습니다.</p>
          <p>개인정보 보호책임자: 정동열 · 대표이사</p>
          <p>개인정보 열람·정정·삭제·처리정지 요청: <a className="underline" href="mailto:jngdy@baikalsys.kr">jngdy@baikalsys.kr</a></p>
          <Link className="inline-block underline" to="/contact">문의 안내로 돌아가기</Link>
        </div>
      </section>
    </>
  )
}
