import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import vm from 'node:vm'
import ts from 'typescript'

function telemetry(pathname = '/') {
  const source = readFileSync(new URL('../src/lib/sentry.ts', import.meta.url), 'utf8')
    .replaceAll('import.meta.env', 'mockEnv')
  const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
  let options
  let sent = 0
  let stopped = 0
  let cleared = 0
  const sentry = {
    init: value => { options = value },
    browserTracingIntegration: () => ({}), replayIntegration: () => ({}),
    makeFetchTransport: () => ({ send: async () => { sent++; return { statusCode: 200 } }, flush: async () => true }),
    getCurrentScope: () => ({ clearBreadcrumbs: () => { cleared++ } }),
    getReplay: () => ({ stop: async () => { stopped++ } }),
  }
  const exports = {}
  const window = { location: { pathname } }
  vm.runInNewContext(js, { exports, require: () => sentry, window, mockEnv: { VITE_SENTRY_DSN: 'local-mock' } })
  exports.initSentry()
  return { exports, options, window, stats: () => ({ sent, stopped, cleared }) }
}

for (const path of ['/contact', '/contact/', '/admin/inquiries', '/admin/inquiries/test-id']) {
  test(`all telemetry stays excluded after inquiry visit: ${path}`, async () => {
    const ctx = telemetry()
    const transport = ctx.options.transport({})
    await transport.send([{}, []])
    assert.equal(ctx.stats().sent, 1)
    ctx.window.location.pathname = path
    // Transport itself must deny even before React layout effects run.
    await transport.send([{}, [['replay_event', { text: 'LOCAL-PRIVATE' }]]])
    assert.equal(ctx.stats().sent, 1)
    ctx.exports.protectInquiryTelemetry()
    assert.equal(ctx.stats().stopped, 1)
    assert.equal(ctx.stats().cleared, 1)
    assert.equal(ctx.options.beforeBreadcrumb({ message: 'LOCAL-PRIVATE' }), null)
    assert.equal(ctx.options.beforeSendTransaction({ spans: ['LOCAL-PRIVATE'] }), null)
    assert.equal(ctx.options.beforeSend({ message: 'LOCAL-PRIVATE' }), null)
    ctx.window.location.pathname = '/projects'
    await transport.send([{}, [['event', { breadcrumbs: ['LOCAL-PRIVATE'] }]]])
    assert.equal(ctx.stats().sent, 1)
    assert.equal(ctx.options.beforeSend({}), null)
    assert.equal(await transport.flush(), true)
  })
}
test('direct inquiry load blocks first envelope; ordinary new document retains telemetry', async () => {
  const sensitive = telemetry('/admin/inquiries')
  await sensitive.options.transport({}).send([{}, []])
  assert.equal(sensitive.stats().sent, 0)
  const normal = telemetry('/projects')
  await normal.options.transport({}).send([{}, []])
  assert.equal(normal.stats().sent, 1)
  assert.notEqual(normal.options.beforeSend({ message: 'normal' }), null)
})

test('privacy page and form use a single server policy, without an unapproved 365-day runtime default', () => {
  const read = p => readFileSync(new URL(p, import.meta.url), 'utf8')
  const page = read('../src/pages/privacy/PrivacyPage.tsx')
  const form = read('../src/features/inquiries/InquiryForm.tsx')
  assert.match(page, /fetchInquiryPolicy\(\)/)
  assert.match(page, /policy\.privacyText/)
  assert.match(page, /운영 승인 준비 중/)
  assert.match(form, /to="\/privacy"/)
  assert.match(form, /policy\.version/)
  assert.match(read('../src/App.tsx'), /path="\/privacy"/)
  assert.match(read('../src/components/layout/Footer.tsx'), /to: '\/privacy'/)
  for (const p of ['../src/features/inquiries/inquiryService.ts', '../supabase/functions/_shared/inquiries.ts']) {
    assert.match(read(p), /privacyText/)
    assert.doesNotMatch(read(p), /retentionDays:\s*365/)
  }
})
