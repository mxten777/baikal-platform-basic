import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { HelmetProvider } from 'react-helmet-async'
import * as Sentry from '@sentry/react'
import { AuthProvider } from '@/features/auth/AuthProvider'
import { queryClient } from '@/lib/queryClient'
import { initSentry } from '@/lib/sentry'
import ErrorFallback from '@/components/errors/ErrorFallback'
import App from './App'
import './index.css'

initSentry()

const rootEl = document.getElementById('root')
if (!rootEl) throw new Error('Root element #root not found in document')

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <BrowserRouter>
      <Sentry.ErrorBoundary
        fallback={({ error, resetError }) => (
          <ErrorFallback error={error} resetError={resetError} />
        )}
      >
        <HelmetProvider>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <App />
            </AuthProvider>
            <ReactQueryDevtools initialIsOpen={false} />
          </QueryClientProvider>
        </HelmetProvider>
      </Sentry.ErrorBoundary>
    </BrowserRouter>
  </React.StrictMode>
)

