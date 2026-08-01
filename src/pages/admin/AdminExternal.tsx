import { useState } from 'react'
import AdminSources from './AdminSources'
import AdminSyncJobs from './AdminSyncJobs'

const TABS = [
  { key: 'sources' as const, label: '수집 소스' },
  { key: 'sync-jobs' as const, label: '동기화 작업' },
]

export default function AdminExternal() {
  const [tab, setTab] = useState<'sources' | 'sync-jobs'>('sources')

  return (
    <div>
      <div className="flex gap-0.5 mb-6 border-b border-white/[0.06]">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === key
                ? 'text-white border-blue-500'
                : 'text-white/40 border-transparent hover:text-white/70'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === 'sources' ? <AdminSources /> : <AdminSyncJobs />}
    </div>
  )
}
