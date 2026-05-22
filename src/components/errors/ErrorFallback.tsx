import { Link } from 'react-router-dom'

/**
 * 전역 에러 폴백 UI
 *
 * Sentry.ErrorBoundary가 자식 트리에서 에러를 잡았을 때 표시됩니다.
 */
export default function ErrorFallback({
  error,
  resetError,
}: {
  error: unknown
  resetError: () => void
}) {
  const message = error instanceof Error ? error.message : String(error)

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="max-w-md text-center space-y-6">
        <div className="text-6xl">⚠️</div>
        <h1 className="text-2xl font-bold">문제가 발생했습니다</h1>
        <p className="text-sm text-zinc-400">
          예기치 못한 오류로 페이지를 표시할 수 없습니다.
          <br />
          잠시 후 다시 시도해주세요.
        </p>

        {import.meta.env.DEV && (
          <pre className="text-left text-xs bg-zinc-900 text-rose-300 p-4 rounded-lg overflow-auto max-h-48">
            {message}
          </pre>
        )}

        <div className="flex gap-3 justify-center">
          <button
            type="button"
            onClick={resetError}
            className="px-4 py-2 rounded-lg bg-white text-black text-sm font-medium hover:bg-zinc-200"
          >
            다시 시도
          </button>
          <Link
            to="/"
            onClick={resetError}
            className="px-4 py-2 rounded-lg border border-zinc-700 text-sm font-medium hover:bg-zinc-800"
          >
            홈으로
          </Link>
        </div>
      </div>
    </div>
  )
}
