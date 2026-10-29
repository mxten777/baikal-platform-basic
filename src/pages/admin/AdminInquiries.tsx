import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import SEOHead from '@/components/seo/SEOHead'
import { inquiryCounts, listInquiries, notificationLabels, statusLabels } from '@/features/inquiries/inquiryService'
import type { InquiryFilters } from '@/features/inquiries/inquiryService'

export default function AdminInquiries() {
  const [filters, setFilters] = useState<InquiryFilters>({ status: '', receipt: '', since: '', notification: '' })
  const [cursors, setCursors] = useState<({ created_at: string; id: string } | null)[]>([null])
  const cursor = cursors[cursors.length - 1]
  const query = useQuery({ queryKey: ['inquiries', 'list', filters, cursor], queryFn: () => listInquiries(filters, cursor), retry: false, gcTime: 0 })
  const counts = useQuery({ queryKey: ['inquiries', 'counts'], queryFn: inquiryCounts, retry: false, gcTime: 0 })
  function filter(key: keyof InquiryFilters, value: string) { setFilters({ ...filters, [key]: value }); setCursors([null]) }
  return (
    <div className="sentry-block" data-sentry-block>
      <SEOHead title="문의 관리" noIndex />
      <h1 className="text-2xl font-bold">문의 관리</h1>
      <p className="mt-2 text-sm text-white/50">메일 알림과 별개로 접수 목록을 확인해 주세요. 연락처·본문은 상세에서만 표시합니다.</p>
      {counts.data && <p className="mt-3">신규 {counts.data.fresh}건 · 알림 확인 필요 {counts.data.failed}건</p>}
      {counts.error && <p role="alert" className="text-red-300">{counts.error.message}</p>}
      <label className="mt-6 block text-sm">처리 상태
        <select value={filters.status} onChange={e => filter('status', e.target.value)} className="admin-input ml-3">
          <option value="">전체</option>
          {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </label>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <label className="text-sm">접수번호 정확히 검색<input className="admin-input mt-2 w-full" value={filters.receipt} onChange={e => filter('receipt', e.target.value)} /></label>
        <label className="text-sm">접수 시작일<input type="date" className="admin-input mt-2 w-full" value={filters.since} onChange={e => filter('since', e.target.value)} /></label>
        <label className="text-sm">알림 상태<select className="admin-input mt-2 w-full" value={filters.notification} onChange={e => filter('notification', e.target.value)}>
          <option value="">전체</option>{Object.entries(notificationLabels).map(([key, value]) => <option key={key} value={key}>{value}</option>)}
        </select></label>
      </div>
      {query.isLoading && <p role="status" className="mt-6">문의 목록을 불러오는 중입니다.</p>}
      {query.error && <p role="alert" className="mt-6 text-red-300">{query.error.message} <button className="underline" onClick={() => query.refetch()}>다시 읽기</button></p>}
      {query.data?.length === 0 && <p className="mt-6">해당 상태의 문의가 없습니다.</p>}
      <ul className="mt-6 space-y-3">
        {query.data?.map(row => (
          <li key={row.id} className="rounded-xl border border-white/10 p-4">
            <Link to={`/admin/inquiries/${row.id}`} className="break-all font-semibold text-blue-300">{row.receipt_number}</Link>
            <p className="mt-2 text-sm">{new Date(row.created_at).toLocaleString('ko-KR')} · {statusLabels[row.status]}</p>
            <p className="text-sm text-white/50">{row.company || '회사 미입력'} · 알림: {notificationLabels[row.notification_status]}
              {row.notification_status === 'unknown' && ' (중복 발송 전 확인 필요)'}</p>
          </li>
        ))}
      </ul>
      <div className="mt-6 flex gap-4">
        <button disabled={cursors.length === 1} className="disabled:opacity-30" onClick={() => setCursors(cursors.slice(0, -1))}>이전</button>
        <button disabled={query.data?.length !== 20 || query.isFetching} className="disabled:opacity-30" onClick={() => {
          const last = query.data?.[query.data.length - 1]
          if (last) setCursors([...cursors, { created_at: last.created_at, id: last.id }])
        }}>다음</button>
      </div>
    </div>
  )
}
