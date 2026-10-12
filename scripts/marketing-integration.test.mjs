import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { test } from 'node:test'
import vm from 'node:vm'
import ts from 'typescript'

const root = fileURLToPath(new URL('..', import.meta.url))
const edgePath = `${root}supabase\\functions\\generate-marketing\\index.ts`
const hookPath = `${root}src\\features\\ai-content\\useAIContent.ts`
const servicePath = `${root}src\\features\\ai-content\\aiContentService.ts`
const pagePath = `${root}src\\pages\\admin\\AdminAIContent.tsx`
const contentServicePath = `${root}src\\features\\contents\\contentService.ts`
const engineUrl = 'https://engine.test/marketing/generate'
const browserUrl = 'https://supabase.test/functions/v1/generate-marketing'
const successBody = {
  success: true, content: 'mock content', channel: 'instagram',
  metadata: { brand: 'BAIKAL', language: 'ko' },
}

function loadModule(path, globals, modules, source = readFileSync(path, 'utf8')) {
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
    },
    reportDiagnostics: true,
  })
  assert.equal(compiled.diagnostics.length, 0)
  const exports = {}
  vm.runInNewContext(compiled.outputText, {
    exports, Error, ...globals,
    require(name) {
      assert.ok(Object.hasOwn(modules, name), `Unexpected import: ${name}`)
      return modules[name]
    },
  }, { filename: path })
  return exports
}

function edgeHarness(options = {}) {
  let handler
  const calls = []
  const delays = []
  const authTokens = []
  const logs = []
  const responses = options.responses ?? [{ status: 200, body: successBody }]
  loadModule(edgePath, {
    Request, Response,
    Deno: {
      env: {
        get: name => ({
          SUPABASE_URL: 'https://supabase.test',
          SUPABASE_SERVICE_ROLE_KEY: 'mock-service-key',
          BAIKAL_AI_URL: 'https://engine.test/',
          BAIKAL_AI_API_KEY: 'mock-engine-key',
          ...options.env,
        })[name],
      },
      serve: callback => { handler = callback },
    },
    console: Object.fromEntries(['log', 'warn', 'error'].map(level => [
      level, (...args) => logs.push({ level, args }),
    ])),
    setTimeout(callback, delay) {
      delays.push(delay)
      callback()
    },
    async fetch(url, init) {
      assert.equal(url, engineUrl)
      assert.equal(init.method, 'POST')
      assert.deepEqual(JSON.parse(JSON.stringify(init.headers)), {
        'Content-Type': 'application/json', 'X-API-Key': 'mock-engine-key',
      })
      calls.push(JSON.parse(init.body))
      const reply = responses[calls.length - 1]
      assert.ok(reply, 'Unexpected extra engine request')
      if (reply.throw) throw new Error('mock connection failure')
      return new Response(reply.raw ?? JSON.stringify(reply.body), { status: reply.status })
    },
  }, {
    'https://esm.sh/@supabase/supabase-js@2': {
      createClient(url, key) {
        assert.equal(url, 'https://supabase.test')
        assert.equal(key, 'mock-service-key')
        return {
          auth: {
            async getUser(token) {
              authTokens.push(token)
              return {
                data: { user: options.user === undefined
                  ? { id: 'admin-id', app_metadata: { role: 'admin' } } : options.user },
                error: options.authError ?? null,
              }
            },
          },
        }
      },
    },
  })
  return {
    calls, delays, authTokens, logs,
    async request(body = { source_content: ' source ', channel: 'instagram' }, requestOptions = {}) {
      const method = requestOptions.method ?? 'POST'
      const headers = requestOptions.headers ?? { Authorization: 'Bearer mock-jwt' }
      const response = await handler(new Request('https://edge.test', {
        method, headers,
        ...(method === 'POST' ? { body: requestOptions.raw ?? JSON.stringify(body) } : {}),
      }))
      return {
        status: response.status, headers: response.headers,
        body: response.status === 204 ? null : await response.json(),
      }
    },
  }
}

test('Edge legacy defaults and transparent success response', async () => {
  const h = edgeHarness()
  const result = await h.request()
  assert.equal(result.status, 200)
  assert.deepEqual(result.body, successBody)
  assert.deepEqual(h.authTokens, ['mock-jwt'])
  assert.deepEqual(h.calls, [{
    source_content: 'source', channel: 'instagram', purpose: 'promotion',
    tone: 'professional', language: 'ko', brand: 'BAIKAL', additional_instruction: '',
  }])
  assert.equal(result.headers.get('Access-Control-Allow-Origin'), '*')
})

for (const channel of ['instagram', 'threads', 'naver_blog', 'reels']) {
  test(`Edge context/custom settings and no injected instructions: ${channel}`, async () => {
    const h = edgeHarness()
    const input = {
      source_content: ' product source ', channel, product_name: ' product title ',
      content_kind: ' PRODUCT ', purpose: 'education', tone: 'friendly',
      language: 'en', brand: 'ADELIO', additional_instruction: ' user instruction ',
    }
    assert.equal((await h.request(input)).status, 200)
    assert.deepEqual(h.calls[0], {
      ...input, source_content: 'product source', product_name: 'product title',
      content_kind: 'PRODUCT',
      ...(channel === 'reels' ? { channel: 'instagram', output_format: 'reels_script' } : {}),
    })
  })
}

test('Edge permits null and independently optional context fields', async () => {
  for (const context of [
    { product_name: null, content_kind: null },
    { product_name: 'name' }, { content_kind: 'poem' },
  ]) {
    const h = edgeHarness()
    assert.equal((await h.request({ source_content: 'source', channel: 'threads', ...context })).status, 200)
    for (const field of ['product_name', 'content_kind']) {
      assert.equal(h.calls[0][field], context[field])
      assert.equal(Object.hasOwn(h.calls[0], field), Object.hasOwn(context, field))
    }
  }
})

test('Legacy Reels conversion preserves the complete engine script response', async () => {
  const responseBody = {
    ...successBody,
    content: 'HOOK\nHook\nCONCEPT\nConcept\nSCENES\nScene 1\n화면: 원본\n내레이션: 설명\n자막: 설명\nCAPTION\nCaption\nHASHTAGS\n#mock\nDURATION\n30s',
    metadata: { brand: 'BAIKAL', language: 'ko', output_format: 'reels_script' },
  }
  const h = edgeHarness({ responses: [{ status: 200, body: responseBody }] })
  const result = await h.request({ source_content: 'source', channel: 'reels' })
  assert.equal(result.status, 200)
  assert.deepEqual(result.body, responseBody)
  assert.equal(h.calls[0].channel, 'instagram')
  assert.equal(h.calls[0].output_format, 'reels_script')
  assert.equal(Object.hasOwn(h.calls[0], 'product_name'), false)
  assert.equal(Object.hasOwn(h.calls[0], 'content_kind'), false)
})

for (const field of ['product_name', 'content_kind']) {
  for (const [label, value] of [
    ['empty', ''], ['whitespace', ' \t\n '], ['number', 123], ['boolean', false],
    ['array', []], ['object', {}], ['over limit', 'x'.repeat(201)],
    ['raw length before trimming', ` ${'x'.repeat(200)}`],
  ]) {
    test(`Edge rejects ${field}: ${label} before engine call`, async () => {
      const h = edgeHarness()
      const result = await h.request({ source_content: 'source', channel: 'instagram', [field]: value })
      assert.equal(result.status, 422)
      assert.equal(result.body.success, false)
      assert.equal(result.body.error, 'VALIDATION_ERROR')
      assert.ok(result.body.message.includes(field))
      assert.equal(h.calls.length, 0)
    })
  }
  test(`Edge ${field} uses code-point length at exact 200 boundary`, async () => {
    const value = '\u{1F680}'.repeat(200)
    const h = edgeHarness()
    assert.equal((await h.request({ source_content: 'source', channel: 'instagram', [field]: value })).status, 200)
    assert.equal(h.calls[0][field], value)
  })
}

test('Edge retains additional instruction validation and Unicode 1000 boundary', async () => {
  for (const value of [42, false, [], {}, 'x'.repeat(1001), '\u{1F680}'.repeat(1001)]) {
    const h = edgeHarness()
    const result = await h.request({ source_content: 'source', channel: 'reels', additional_instruction: value })
    assert.equal(result.status, 422)
    assert.equal(result.body.error, 'VALIDATION_ERROR')
    assert.equal(h.calls.length, 0)
  }
  for (const value of [null, '', 'x'.repeat(1000), '\u{1F680}'.repeat(1000)]) {
    const h = edgeHarness()
    assert.equal((await h.request({ source_content: 'source', channel: 'reels', additional_instruction: value })).status, 200)
    assert.equal(h.calls[0].additional_instruction, value ?? '')
  }
})

test('Edge CORS, method, JWT, admin priority/fallback and secret gates', async () => {
  const cases = [
    [{}, { method: 'OPTIONS' }, 204],
    [{}, { method: 'GET' }, 405],
    [{}, { headers: {} }, 401],
    [{ user: null, authError: { message: 'invalid JWT' } }, {}, 401],
    [{ user: { id: 'user', app_metadata: { role: 'user' }, user_metadata: { role: 'admin' } } }, {}, 403],
    [{ user: { id: 'admin', user_metadata: { role: 'admin' } } }, {}, 200],
    [{ env: { BAIKAL_AI_URL: '' } }, {}, 503],
    [{ env: { BAIKAL_AI_API_KEY: '' } }, {}, 503],
  ]
  for (const [options, requestOptions, status] of cases) {
    const h = edgeHarness(options)
    assert.equal((await h.request(undefined, requestOptions)).status, status)
    assert.equal(h.calls.length, status === 200 ? 1 : 0)
    assert.equal(h.authTokens.length, [204, 405].includes(status) || requestOptions.headers ? 0 : 1)
  }
})

test('Edge legacy invalid input errors remain unchanged', async () => {
  for (const [input, status, code] of [
    [{ channel: 'instagram' }, 422, 'VALIDATION_ERROR'],
    [{ source_content: ' ' , channel: 'instagram' }, 422, 'VALIDATION_ERROR'],
    [{ source_content: 'source' }, 422, 'VALIDATION_ERROR'],
    [{ source_content: 'source', channel: 'invalid' }, 400, 'INVALID_CHANNEL'],
  ]) {
    const h = edgeHarness()
    const result = await h.request(input)
    assert.equal(result.status, status)
    assert.equal(result.body.error, code)
    assert.equal(h.calls.length, 0)
  }
  const h = edgeHarness()
  assert.equal((await h.request(undefined, { raw: '{' })).body.error, 'INVALID_JSON')
  assert.equal(h.calls.length, 0)
})

test('Edge 429 retries use identical payload and 1s/3s delays', async () => {
  const rateLimit = { status: 429, body: { error: { code: 'RATE_LIMIT', message: 'limited' } } }
  for (const [responses, status, delays] of [
    [[rateLimit, { status: 200, body: successBody }], 200, [1000]],
    [[rateLimit, rateLimit, { status: 200, body: successBody }], 200, [1000, 3000]],
    [[rateLimit, rateLimit, rateLimit], 429, [1000, 3000]],
  ]) {
    const h = edgeHarness({ responses })
    const result = await h.request({ source_content: 'source', channel: 'reels', content_kind: 'product', product_name: 'name' })
    assert.equal(result.status, status)
    assert.deepEqual(h.delays, delays)
    assert.equal(h.calls.length, responses.length)
    h.calls.forEach(payload => assert.deepEqual(payload, h.calls[0]))
    if (status === 429) {
      assert.equal(result.body.error, 'RATE_LIMIT')
      assert.equal(result.body.message, 'LLM API 요청 한도를 초과했습니다. 잠시 후 다시 시도해 주세요.')
    }
  }
})

test('Edge engine errors remain explicit without non-429 retries', async () => {
  for (const [reply, expectedStatus, code] of [
    [{ throw: true }, 502, 'AI_ENGINE_UNREACHABLE'],
    [{ status: 200, raw: 'not json' }, 502, 'AI_ENGINE_ERROR'],
    [{ status: 503, body: { error: { code: 'LLM_NOT_CONFIGURED', message: 'not configured' } } }, 502, 'LLM_NOT_CONFIGURED'],
    [{ status: 422, body: { error: { code: 'VALIDATION_ERROR', message: 'invalid' } } }, 422, 'VALIDATION_ERROR'],
    [{ status: 401, body: { error: { code: 'UNAUTHORIZED', message: 'denied' } } }, 401, 'UNAUTHORIZED'],
  ]) {
    const h = edgeHarness({ responses: [reply] })
    const result = await h.request()
    assert.equal(result.status, expectedStatus)
    assert.equal(result.body.error, code)
    assert.equal(result.body.success, false)
    assert.equal(h.calls.length, 1)
    assert.deepEqual(h.delays, [])
    assert.ok(h.logs.some(log => log.level === 'error'))
  }
})

function hookHarness(options = {}) {
  const states = []
  let cursor = 0
  const requests = []
  const saves = []
  const session = { access_token: 'mock-jwt', user: { id: 'admin-id' } }
  const module = loadModule(hookPath, {
    async fetch(url, init) {
      assert.equal(url, browserUrl)
      assert.equal(init.method, 'POST')
      assert.equal(init.headers.Authorization, 'Bearer mock-jwt')
      requests.push(JSON.parse(init.body))
      if (options.edge) {
        const result = await options.edge.request(requests.at(-1))
        return new Response(JSON.stringify(result.body), { status: result.status })
      }
      return new Response(JSON.stringify(options.responseBody ?? successBody), { status: options.status ?? 200 })
    },
  }, {
    react: {
      useState(initial) {
        const index = cursor++
        if (!(index in states)) states[index] = initial
        return [states[index], value => {
          states[index] = typeof value === 'function' ? value(states[index]) : value
        }]
      },
    },
    '@/lib/supabase': { supabase: { auth: { async getSession() {
      return { data: { session: options.noSession ? null : session } }
    } } } },
    './aiContentService': {
      async createAIContent(input) {
        if (options.saveError) throw new Error('mock save failure')
        saves.push({ table: 'ai_contents', input: JSON.parse(JSON.stringify(input)) })
        return { id: 'content-id' }
      },
      async createAIContentOutput(input) {
        if (options.outputSaveError) throw new Error('mock output save failure')
        saves.push({ table: 'ai_content_outputs', input: JSON.parse(JSON.stringify(input)) })
        return { id: 'output-id' }
      },
      async saveAIContentEditedText(id, text) {
        if (options.editedSaveError) throw new Error('mock edited save failure')
        saves.push({ table: 'ai_content_outputs', id, input: { edited_text: text } })
      },
      ...options.services,
    },
  }, readFileSync(hookPath, 'utf8').replace(
    'import.meta.env.VITE_SUPABASE_URL', JSON.stringify('https://supabase.test'),
  ))
  function render() {
    cursor = 0
    return module.useAIContent()
  }
  function configure(fields) {
    const hook = render()
    for (const [field, value] of Object.entries(fields)) hook.setField(field, value)
    return render()
  }
  return { render, configure, requests, saves }
}

function contentListHarness(options = {}) {
  const calls = []
  const service = loadModule(contentServicePath, {}, {
    '@/lib/supabase': { supabase: {
      from(table) {
        assert.equal(table, 'contents')
        let fields
        const query = {
          select(value) { fields = value; calls.push(['select', value]); return query },
          order(field, value) { calls.push(['order', field, value]); return query },
          eq(field, value) { calls.push(['eq', field, value]); return query },
          then(resolve, reject) {
            const columns = fields.split('source:')[0].split(',').map(field => field.trim()).filter(Boolean)
            const data = (options.rows ?? []).map(row => Object.fromEntries(
              columns.filter(column => Object.hasOwn(row, column)).map(column => [column, row[column]]),
            ))
            return Promise.resolve({ data, error: options.error ?? null }).then(resolve, reject)
          },
        }
        return query
      },
    } },
    '@/lib/constants': { PER_PAGE_DEFAULT: 12 },
  })
  return { service, calls }
}

test('Blog DB list -> page selection -> Hook -> Edge includes the stored body and preserves request/save contracts', async () => {
  const stored = {
    id: 'blog-id', title: 'Blog', summary: 'Summary', body: 'Full blog body\nSecond paragraph',
    content_type: 'rss', status: 'published',
  }
  const list = contentListHarness({ rows: [stored] })
  const contents = await list.service.adminGetContents('published')
  assert.equal(contents[0].body, stored.body)
  assert.deepEqual(list.calls.find(call => call[0] === 'eq'), ['eq', 'status', 'published'])
  assert.deepEqual(JSON.parse(JSON.stringify(list.calls.find(call => call[0] === 'order'))),
    ['order', 'created_at', { ascending: false }])
  const edge = edgeHarness()
  const h = hookHarness({ edge })
  const page = pageHarness(h, { contentsQuery: { data: contents, isLoading: false } })
  page.button('Blog').props.onClick()
  assert.equal(page.nodes().some(node => page.text(node).includes('RSS 요약 기반')), false)
  page.nodes().find(node => node.type === 'button' && page.text(node).includes('BlogSummary')).props.onClick()
  await h.render().generate()
  assert.equal(h.render().error, null)
  const expectedRequest = {
    source_content: 'Blog\n\nSummary\n\nFull blog body\nSecond paragraph',
    channel: 'instagram', purpose: 'promotion', tone: 'professional', language: 'ko',
    brand: 'BAIKAL', additional_instruction: '', content_kind: 'article',
  }
  assert.deepEqual(h.requests[0], expectedRequest)
  assert.deepEqual(edge.calls[0], expectedRequest)
  assert.deepEqual(h.saves[0], { table: 'ai_contents', input: {
    title: 'Blog', content_kind: 'article', source_type: 'blog', brand: 'BAIKAL',
    created_by: 'admin-id', source_content_id: 'blog-id',
  } })
})

test('Blog list service distinguishes an empty result from a DB query failure', async () => {
  const empty = contentListHarness()
  assert.equal((await empty.service.adminGetContents('published')).length, 0)
  const error = new Error('permission denied')
  const failed = contentListHarness({ error })
  await assert.rejects(failed.service.adminGetContents('published'), value => value === error)
})

test('RSS without a usable body is explicitly summary-based in the UI and engine request', async () => {
  for (const body of [undefined, null, '', ' \n\t ']) {
    const stored = {
      id: 'rss-id', title: 'RSS title', summary: 'RSS summary', body, content_type: 'rss',
    }
    const list = contentListHarness({ rows: [stored] })
    const contents = await list.service.adminGetContents('published')
    const edge = edgeHarness()
    const h = hookHarness({ edge })
    const page = pageHarness(h, { contentsQuery: { data: contents, isLoading: false } })
    page.button('Blog').props.onClick()
    assert.ok(page.nodes().some(node => page.text(node) === 'RSS 요약 기반 · 전체 원문 없음'))
    page.nodes().find(node => node.type === 'button' && page.text(node).includes('RSS title')).props.onClick()
    assert.ok(page.nodes().some(node => page.text(node) === '전체 원문 없이 저장된 제목·요약을 기반으로 생성합니다.'))
    await h.render().generate()
    assert.equal(h.render().error, null)
    const expectedSource = 'RSS 요약 기반 콘텐츠입니다. 전체 원문이 아닌 제목·요약만 제공됩니다.\n\nRSS title\n\nRSS summary'
    assert.equal(edge.calls[0].source_content, expectedSource)
    assert.equal(h.requests[0].source_content.trim(), expectedSource)
    assert.equal(h.requests[0].additional_instruction, '')
    assert.equal(h.saves[0].input.source_content_id, 'rss-id')
    assert.equal(Object.hasOwn(h.saves[0].input, 'body'), false)
  }
})

test('Non-RSS Blog without a body retains the existing title/summary request', async () => {
  const h = hookHarness()
  await h.configure({
    sourceType: 'blog', title: 'Title', selectedContent: {
      id: 'article-id', title: 'Title', summary: 'Summary', content_type: 'article',
    },
  }).generate()
  assert.equal(h.requests[0].source_content, 'Title\n\nSummary')
  assert.equal(h.render().error, null)
})

for (const channel of ['instagram', 'threads', 'naver_blog', 'reels']) {
  test(`Hook -> Edge product context and unchanged saves: ${channel}`, async () => {
    const edge = edgeHarness()
    const h = hookHarness({ edge })
    await h.configure({
      title: ' product name ', body: ' product source ', contentKind: 'product',
      channel, brand: 'ADELIO', purpose: 'education', tone: 'friendly',
      additionalInstruction: 'Keep the source facts unchanged.',
    }).generate()
    assert.equal(h.render().error, null)
    assert.equal(h.render().result, 'mock content')
    assert.equal(h.render().isLoading, false)
    assert.equal(h.requests[0].product_name, 'product name')
    assert.equal(h.requests[0].content_kind, 'product')
    assert.equal(h.requests[0].additional_instruction, 'Keep the source facts unchanged.')
    assert.equal(edge.calls[0].additional_instruction, 'Keep the source facts unchanged.')
    assert.equal(edge.calls[0].brand, 'ADELIO')
    assert.equal(edge.calls[0].channel, channel === 'reels' ? 'instagram' : channel)
    assert.deepEqual(h.saves, [
      { table: 'ai_contents', input: {
        title: 'product name', body: 'product source', content_kind: 'product',
        source_type: 'direct', brand: 'ADELIO', created_by: 'admin-id',
      } },
      { table: 'ai_content_outputs', input: {
        ai_content_id: 'content-id', channel, purpose: 'education',
        tone: 'friendly', output_text: 'mock content', created_by: 'admin-id',
      } },
    ])
  })
}

for (const kind of ['article', 'project', 'case_study', 'column', 'notice', 'interview', 'meeting', 'tech_doc', 'poem']) {
  test(`Hook non-product type forwarded without product name: ${kind}`, async () => {
    const h = hookHarness()
    await h.configure({ title: 'title', body: 'source', contentKind: kind }).generate()
    assert.equal(h.requests[0].content_kind, kind)
    assert.equal(Object.hasOwn(h.requests[0], 'product_name'), false)
    assert.equal(h.requests[0].additional_instruction, '')
    assert.equal(h.saves[0].input.content_kind, kind)
  })
}

test('Hook Blog/Project source selection and reference saves are preserved', async () => {
  for (const [fields, expectedSource, reference] of [
    [{ sourceType: 'blog', selectedContent: {
      id: 'blog-id', title: 'Blog', summary: 'Summary', body: 'Full blog body',
    }, contentKind: 'article' },
      'Blog\n\nSummary\n\nFull blog body', { source_content_id: 'blog-id' }],
    [{ sourceType: 'project', selectedProject: {
      id: 'project-id', title: 'Project', subtitle: 'Subtitle', description: 'Description',
      category: 'Category', tech_stack: ['React', 'TS'],
    }, contentKind: 'project' },
      'Project\n\nSubtitle\n\nDescription\n\n카테고리: Category\n\n기술 스택: React, TS',
      { source_project_id: 'project-id' }],
  ]) {
    const h = hookHarness()
    await h.configure({ title: 'title', ...fields }).generate()
    assert.equal(h.requests[0].source_content, expectedSource)
    assert.equal(Object.hasOwn(h.requests[0], 'product_name'), false)
    assert.equal(Object.hasOwn(h.saves[0].input, 'body'), false)
    for (const [key, value] of Object.entries(reference)) assert.equal(h.saves[0].input[key], value)
  }
})

test('Hook validation/session/errors never save failed generation', async () => {
  for (const [options, fields, expectedRequests] of [
    [{}, {}, 0],
    [{}, { title: 'title' }, 0],
    [{}, { title: 'title', sourceType: 'blog' }, 0],
    [{}, { title: 'title', sourceType: 'project' }, 0],
    [{ noSession: true }, { title: 'title', body: 'source' }, 0],
    [{ status: 429, responseBody: { success: false, message: 'limit' } }, { title: 'title', body: 'source' }, 1],
    [{ status: 422, responseBody: { success: false, message: 'invalid context' } }, { title: 'title', body: 'source' }, 1],
    [{ responseBody: { success: false, message: 'failed' } }, { title: 'title', body: 'source' }, 1],
    [{ saveError: true }, { title: 'title', body: 'source' }, 1],
  ]) {
    const h = hookHarness(options)
    await h.configure(fields).generate()
    assert.ok(h.render().error)
    assert.equal(h.render().isLoading, false)
    assert.equal(h.requests.length, expectedRequests)
    assert.equal(h.saves.length, 0)
    if (options.status === 429) {
      assert.equal(h.render().error, 'LLM API 요청 한도를 초과했습니다. 잠시 후 다시 시도해 주세요.')
    }
    if (options.saveError) assert.equal(h.render().error, 'mock save failure')
  }
})

test('Hook reset preserves initial form/result/error semantics', async () => {
  const h = hookHarness()
  await h.configure({ title: 'name', body: 'source', contentKind: 'product' }).generate()
  h.render().reset()
  assert.equal(h.render().form.title, '')
  assert.equal(h.render().form.contentKind, 'article')
  assert.equal(h.render().result, '')
  assert.equal(h.render().error, null)
  assert.equal(h.render().outputId, null)
  assert.equal(h.render().editedText, '')
  assert.equal(h.render().hasUnsavedEdits, false)
  assert.equal(h.render().saveMessage, null)
})

test('Hook edits preserve original, save only edited text and can discard unsaved changes', async () => {
  const h = hookHarness()
  await h.configure({ title: 'ADELIO', body: 'source' }).generate()
  assert.equal(h.render().outputId, 'output-id')
  assert.equal(h.render().editedText, 'mock content')
  assert.equal(h.render().hasUnsavedEdits, false)
  const text = '  수정한 ADELIO 문구\n#아델리오 #선쿠션  '
  h.render().setEditedText(text)
  assert.equal(h.render().result, 'mock content')
  assert.equal(h.render().hasUnsavedEdits, true)
  assert.equal(await h.render().saveEdits(), true)
  assert.deepEqual(h.saves.at(-1), {
    table: 'ai_content_outputs', id: 'output-id', input: { edited_text: text },
  })
  assert.equal(h.render().isSaving, false)
  assert.equal(h.render().hasUnsavedEdits, false)
  assert.ok(h.render().saveMessage)
  h.render().setEditedText('')
  assert.equal(h.render().saveMessage, null)
  assert.equal(await h.render().saveEdits(), false)
  assert.ok(h.render().saveError)
  h.render().discardEdits()
  assert.equal(h.render().editedText, text)
  assert.equal(h.render().hasUnsavedEdits, false)
})

test('Hook edit save errors keep edits and never report success', async () => {
  for (const options of [{ noSession: true }, { editedSaveError: true }]) {
    const h = hookHarness(options)
    h.render().loadOutput({
      id: 'existing-id', output_text: 'original', edited_text: 'saved',
      ai_content: { title: 'ADELIO' },
    })
    h.render().setEditedText('new edit')
    assert.equal(await h.render().saveEdits(), false)
    assert.equal(h.render().editedText, 'new edit')
    assert.equal(h.render().saveMessage, null)
    assert.ok(h.render().saveError)
    assert.equal(h.render().isSaving, false)
    assert.equal(h.render().hasUnsavedEdits, true)
    assert.equal(h.saves.length, 0)
  }
  const h = hookHarness({ outputSaveError: true })
  await h.configure({ title: 'title', body: 'source' }).generate()
  assert.equal(h.render().result, 'mock content')
  assert.equal(h.render().outputId, null)
  assert.equal(await h.render().saveEdits(), false)
  assert.ok(h.render().saveError)
})

function serviceHarness(options = {}) {
  const rows = [{
    id: 'output-id', channel: 'instagram', purpose: 'promotion', status: 'draft',
    output_text: 'original', edited_text: null, created_at: '2026-10-11',
    published_content_id: null, hidden_from_status: null,
    ai_content: { id: 'content-id', title: 'ADELIO', source_type: 'direct', content_kind: 'product' },
  }]
  const updates = []
  const publications = []
  const service = loadModule(servicePath, {}, {
    '@/lib/supabase': { supabase: {
      from(table) {
        assert.ok(['ai_content_outputs', 'contents'].includes(table))
        let update
        let insert
        let single = false
        const filters = []
        const query = {
          update(value) {
            update = value
            updates.push({ table, value: JSON.parse(JSON.stringify(value)) })
            return query
          },
          insert(value) { insert = value; return query },
          select(fields) {
            if (!update && !insert) assert.ok(fields.includes('edited_text'))
            return query
          },
          eq(field, value) { filters.push(row => row[field] === value); return query },
          neq(field, value) { filters.push(row => row[field] !== value); return query },
          order() { return query },
          limit() { return query },
          single() { single = true; return query },
          then(resolve, reject) {
            if (options.error) return Promise.resolve({ data: null, error: options.error }).then(resolve, reject)
            if (insert) {
              publications.push(JSON.parse(JSON.stringify(insert)))
              return Promise.resolve({ data: { id: 'published-id' }, error: null }).then(resolve, reject)
            }
            const selected = rows.filter(row => filters.every(filter => filter(row)))
            if (update) selected.forEach(row => Object.assign(row, JSON.parse(JSON.stringify(update))))
            const error = single && selected.length !== 1 ? new Error('Output not found or forbidden') : null
            const data = single ? selected[0] ?? null : selected
            return Promise.resolve({ data: JSON.parse(JSON.stringify(data)), error }).then(resolve, reject)
          },
        }
        return query
      },
    } },
    '@/utils/slug': { toSlug: () => 'adelio' },
  })
  return { service, rows, updates, publications }
}

test('Actual service -> reload -> fresh Hook preserves edited text and existing approval/hide/publication', async () => {
  const { service, rows, updates, publications } = serviceHarness()
  const text = '  저장한 수정본\n#아델리오  '
  const h = hookHarness({ services: service })
  h.render().loadOutput((await service.getAIContentHistory())[0])
  h.render().setEditedText(text)
  assert.equal(await h.render().saveEdits(), true)
  assert.deepEqual(updates[0], { table: 'ai_content_outputs', value: { edited_text: text } })
  assert.equal(rows[0].output_text, 'original')
  assert.equal(rows[0].status, 'draft')
  const fresh = hookHarness()
  fresh.render().loadOutput((await service.getAIContentHistory())[0])
  assert.equal(fresh.render().editedText, text)
  assert.equal(fresh.render().hasUnsavedEdits, false)
  await service.approveOutput('output-id')
  assert.equal(rows[0].status, 'approved')
  await service.publishOutput((await service.getAIContentHistory())[0])
  assert.equal(publications[0].body, text)
  assert.equal(rows[0].status, 'published')
  await service.hideOutput((await service.getAIContentHistory())[0])
  assert.equal(rows[0].status, 'hidden')
  assert.equal((await service.getAIContentHistory()).length, 0)
  assert.equal((await service.getAIContentHistory(true))[0].edited_text, text)
  await service.restoreOutput((await service.getAIContentHistory(true))[0])
  assert.equal(rows[0].status, 'published')
  assert.equal(rows[0].edited_text, text)
})

test('Actual service rejects blank, missing and forbidden edited-text saves', async () => {
  const h = serviceHarness()
  await assert.rejects(h.service.saveAIContentEditedText('output-id', ' \n '), /수정/)
  assert.equal(h.updates.length, 0)
  await assert.rejects(h.service.saveAIContentEditedText('missing-id', 'edit'), /not found/)
  const denied = serviceHarness({ error: new Error('permission denied') })
  await assert.rejects(denied.service.saveAIContentEditedText('output-id', 'edit'), /permission denied/)
})

function pageHarness(hook, options = {}) {
  const states = []
  let cursor = 0
  const clipboard = []
  const invalidations = []
  const actions = []
  let history = options.history ?? []
  const jsx = (type, props) => ({ type, props: props ?? {} })
  const module = loadModule(pagePath, {
    navigator: { clipboard: { async writeText(text) {
      if (options.copyError) throw new Error('clipboard denied')
      clipboard.push(text)
    } } },
    setTimeout() {},
  }, {
    'react/jsx-runtime': { jsx, jsxs: jsx, Fragment: 'fragment' },
    react: { useState(initial) {
      const index = cursor++
      if (!(index in states)) states[index] = initial
      return [states[index], value => {
        states[index] = typeof value === 'function' ? value(states[index]) : value
      }]
    } },
    'lucide-react': Object.fromEntries([
      'Sparkles', 'Copy', 'Check', 'Loader2', 'History', 'Plus', 'FolderKanban', 'FileText', 'EyeOff',
    ].map(name => [name, name])),
    '@tanstack/react-query': {
      useQuery: () => ({ data: history, isLoading: false, error: options.historyError }),
      useQueryClient: () => ({ async invalidateQueries(value) {
        invalidations.push(JSON.parse(JSON.stringify(value)))
        if (options.service) history = await options.service.getAIContentHistory()
      } }),
    },
    '@/components/seo/SEOHead': { default: 'SEOHead' },
    '@/features/ai-content/useAIContent': { useAIContent: () => hook.render() },
    '@/features/ai-content/aiContentService': {
      getAIContentHistory: async () => history,
      approveOutput: async id => { actions.push({ action: 'approve', id }) },
      publishOutput: async row => { actions.push({ action: 'publish', id: row.id }) },
      hideOutput: async row => { actions.push({ action: 'hide', id: row.id }) },
      restoreOutput: async row => { actions.push({ action: 'restore', id: row.id }) },
    },
    '@/features/contents/useContents': { useAdminContents: status => {
      assert.equal(status, 'published')
      return options.contentsQuery ?? { data: [] }
    } },
    '@/features/projects/useProjects': { useAdminProjects: () => options.projectsQuery ?? { data: [] } },
    '@/utils/date': { formatDateShort: value => value },
  })
  function render() {
    cursor = 0
    return module.default()
  }
  function nodes() {
    function walk(node) {
      if (Array.isArray(node)) return node.flatMap(walk)
      if (!node || typeof node !== 'object') return []
      return [node, ...walk(node.props.children)]
    }
    return walk(render())
  }
  function text(node) {
    if (Array.isArray(node)) return node.map(text).join('').trim()
    if (!node || typeof node === 'boolean') return ''
    if (typeof node === 'object') return text(node.props.children)
    return String(node).trim()
  }
  function button(label) {
    const found = nodes().find(node => node.type === 'button' && text(node) === label)
    assert.ok(found, `Missing button: ${label}`)
    return found
  }
  return { render, nodes, button, text, clipboard, invalidations, actions }
}

test('Blog/Project list errors are visible and never rendered as empty results', () => {
  for (const [label, queryKey, emptyMessage, errorPrefix] of [
    ['Blog', 'contentsQuery', '게시된 콘텐츠가 없습니다', 'Blog 목록 조회에 실패했습니다:'],
    ['프로젝트', 'projectsQuery', '프로젝트가 없습니다', '프로젝트 목록 조회에 실패했습니다:'],
  ]) {
    for (const data of [undefined, [], [{ id: 'cached', title: 'Cached item' }]]) {
      const page = pageHarness(hookHarness(), {
        [queryKey]: { data, isLoading: false, error: new Error('permission denied') },
      })
      page.button(label).props.onClick()
      assert.ok(page.nodes().some(node => node.props.role === 'alert'
        && page.text(node) === `${errorPrefix}permission denied`))
      assert.equal(page.nodes().some(node => page.text(node) === emptyMessage), false)
      assert.equal(page.nodes().some(node => node.type === 'button' && page.text(node) === 'Cached item'), false)
    }
    const empty = pageHarness(hookHarness(), { [queryKey]: { data: [], isLoading: false, error: null } })
    empty.button(label).props.onClick()
    assert.ok(empty.nodes().some(node => empty.text(node) === emptyMessage))
    assert.equal(empty.nodes().some(node => node.props.role === 'alert'), false)
  }
})

test('Page edit/save/copy -> history -> reload keeps edits with desktop and mobile controls', async () => {
  const { service } = serviceHarness()
  const h = hookHarness({ services: service })
  h.render().loadOutput((await service.getAIContentHistory())[0])
  const page = pageHarness(h, { service, history: await service.getAIContentHistory() })
  const text = '아델리오 수정본\n#아델리오 #선쿠션'
  const editor = () => page.nodes().find(node => node.type === 'textarea' && node.props['aria-label'] === '생성 콘텐츠 수정')
  assert.equal(editor().props.value, 'original')
  editor().props.onChange({ target: { value: text } })
  assert.equal(editor().props.value, text)
  await page.button('복사').props.onClick()
  assert.deepEqual(page.clipboard, [text])
  await page.button('수정본 저장').props.onClick()
  assert.equal(page.button('수정본 저장').props.disabled, true)
  assert.deepEqual(page.invalidations, [{ queryKey: ['ai-content-history'] }])
  page.button('생성 이력').props.onClick()
  const editButtons = page.nodes().filter(node => node.type === 'button' && page.text(node) === '보기·수정')
  assert.equal(editButtons.length, 2)
  editButtons[0].props.onClick()
  assert.equal(editor().props.value, text)
  editor().props.onChange({ target: { value: '' } })
  assert.ok(page.button('수정본 저장').props.disabled)
  assert.ok(page.button('승인').props.disabled)
  page.button('수정 취소').props.onClick()
  assert.equal(editor().props.value, text)
  assert.equal(page.button('승인').props.disabled, false)
  await page.button('승인').props.onClick()
  assert.deepEqual(page.actions, [{ action: 'approve', id: 'output-id' }])
  page.button('숨김').props.onClick()
  const confirm = page.nodes().filter(node => node.type === 'button' && page.text(node) === '숨김').at(-1)
  await confirm.props.onClick()
  assert.deepEqual(page.actions.at(-1), { action: 'hide', id: 'output-id' })

  const fresh = hookHarness()
  const reloaded = pageHarness(fresh, { history: await service.getAIContentHistory() })
  reloaded.button('생성 이력').props.onClick()
  reloaded.button('보기·수정').props.onClick()
  assert.equal(reloaded.nodes().find(node => node.type === 'textarea').props.value, text)
  await reloaded.button('복사').props.onClick()
  assert.deepEqual(reloaded.clipboard, [text])
})

test('Page surfaces clipboard failure instead of reporting copied', async () => {
  const h = hookHarness()
  h.render().loadOutput({ id: 'id', output_text: 'original', edited_text: null, ai_content: null })
  const page = pageHarness(h, { copyError: true })
  await page.button('복사').props.onClick()
  assert.ok(page.nodes().some(node => node.props.role === 'alert' && page.text(node) === 'clipboard denied'))
  assert.equal(page.clipboard.length, 0)
})

test('Page locks edits/navigation/actions while saving and reports history reload errors', async () => {
  let finishSave
  const pendingSave = new Promise(resolve => { finishSave = resolve })
  const h = hookHarness({ services: { saveAIContentEditedText: () => pendingSave } })
  const row = { id: 'output-id', status: 'draft', output_text: 'original', edited_text: null, ai_content: null }
  h.render().loadOutput(row)
  h.render().setEditedText('edit')
  const page = pageHarness(h, { history: [row], historyError: new Error('history unavailable') })
  page.button('생성 이력').props.onClick()
  const saving = page.button('수정본 저장').props.onClick()
  assert.equal(h.render().isSaving, true)
  assert.ok(page.nodes().find(node => node.type === 'textarea').props.disabled)
  assert.ok(page.button('새 콘텐츠').props.disabled)
  assert.ok(page.button('보기·수정').props.disabled)
  assert.ok(page.button('승인').props.disabled)
  assert.ok(page.button('숨김').props.disabled)
  assert.ok(page.button('저장 중...').props.disabled)
  assert.ok(page.nodes().some(node => node.props.role === 'alert' && page.text(node) === 'history unavailable'))
  finishSave()
  await saving
  assert.equal(h.render().isSaving, false)
  assert.equal(page.button('승인').props.disabled, false)
})

test('Hook loaded history uses original fallback and preserves an explicitly empty saved edit', () => {
  const h = hookHarness()
  h.render().loadOutput({ id: 'id', output_text: 'original', edited_text: null, ai_content: null })
  assert.equal(h.render().editedText, 'original')
  h.render().loadOutput({ id: 'id', output_text: 'original', edited_text: '', ai_content: null })
  assert.equal(h.render().editedText, '')
  assert.equal(h.render().hasUnsavedEdits, false)
})
