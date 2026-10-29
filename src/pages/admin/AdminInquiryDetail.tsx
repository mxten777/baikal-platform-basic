import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import SEOHead from '@/components/seo/SEOHead'
import { getInquiry, notificationLabels, retryNotification, statusLabels, transitions, updateInquiry } from '@/features/inquiries/inquiryService'
import type { InquiryStatus } from '@/features/inquiries/inquiryService'

export default function AdminInquiryDetail() {
  const { id = '' } = useParams()
  const [reveal, setReveal] = useState(false)
  const cache = useQueryClient()
  const query = useQuery({ queryKey: ['inquiries', 'detail', id], queryFn: () => getInquiry(id), retry: false, gcTime: 0 })
  const mutation = useMutation({
    mutationFn: async (status: InquiryStatus | 'retry') => {
      const row = query.data?.inquiry
      if (!row) throw new Error('문의 정보를 먼저 읽어 주세요.')
      if (status === 'retry') await retryNotification(id, row.version)
      else await updateInquiry(id, row.version, status)
    },
    onSuccess: () => cache.invalidateQueries({ queryKey: ['inquiries'] }),
  })
  const row = query.data?.inquiry
  return (
    <div className="max-w-3xl space-y-5 sentry-block" data-sentry-block>
      <SEOHead title="문의 상세" noIndex />
      <Link to="/admin/inquiries" className="text-blue-300">← 문의 목록</Link>
      <h1 className="text-2xl font-bold">문의 상세</h1>
      {query.isLoading && <p role="status">문의 정보를 불러오는 중입니다.</p>}
      {query.error && <p role="alert" className="text-red-300">{query.error.message}</p>}
      <button className="underline" onClick={() => query.refetch()}>새로고침</button>
      {row && <>
        <p className="break-all">{row.receipt_number}</p>
        <p>{new Date(row.created_at).toLocaleString('ko-KR')} · {statusLabels[row.status]}</p>
        <p>이름: {row.name} · 회사: {row.company || '미입력'}</p>
        <p className="break-all">이메일: {reveal ? row.email : '연락처 숨김'}
          <button className="ml-3 underline" onClick={() => setReveal(!reveal)}>{reveal ? '숨기기' : '연락처 보기'}</button>
        </p>
        <p className="whitespace-pre-wrap break-words rounded-xl border border-white/10 p-4">{row.message}</p>
        <p className="text-sm text-white/50">동의 버전: {row.consent_version} · 보유 만료: {new Date(row.expires_at).toLocaleDateString('ko-KR')}</p>
        <div className="flex flex-wrap gap-3">
          {transitions[row.status].map(status => <button key={status} disabled={mutation.isPending} className="rounded-lg border border-white/20 px-4 py-2 disabled:opacity-40" onClick={() => mutation.mutate(status)}>{statusLabels[status]}로 변경</button>)}
        </div>
        <p>알림: {notificationLabels[row.notification_status]} {row.notification_last_code && `· ${row.notification_last_code}`}</p>
        {row.notification_status === 'failed' && <button className="underline" disabled={mutation.isPending} onClick={() => mutation.mutate('retry')}>확정 실패 알림 재시도</button>}
        {row.notification_status === 'unknown' && <p className="text-amber-300">전송 여부가 불명확합니다. 메일 서비스에서 확인하기 전 재발송하지 마세요.</p>}
        <h2 className="text-lg font-semibold">처리 이력</h2>
        <ul className="space-y-2 text-sm text-white/60">{query.data?.events.map(event => <li key={event.id}>{new Date(event.happened_at).toLocaleString('ko-KR')} · {statusLabels[event.from_status]} → {statusLabels[event.to_status]}</li>)}</ul>
      </>}
      {mutation.error && <p role="alert" className="text-red-300">{mutation.error.message}</p>}
    </div>
  )
}
