import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import vm from 'node:vm'
import ts from 'typescript'

function render(project, options = {}) {
  const compiled = ts.transpileModule(
    readFileSync(new URL('../src/pages/projects/ProjectDetailPage.tsx', import.meta.url), 'utf8'),
    { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } },
  )
  const jsx = (type, props) => ({ type, props })
  const modules = {
    'react/jsx-runtime': { jsx, jsxs: jsx, Fragment: 'fragment' },
    'react-router-dom': { useParams: () => ({ slug: project?.slug }), Link: 'link' },
    'react-markdown': { default: 'markdown' },
    'remark-gfm': { default: 'gfm' },
    'rehype-sanitize': { default: 'sanitize' },
    '@/components/seo/SEOHead': { default: 'seo' },
    '@/components/content/ContentCard': { default: 'content-card' },
    '@/features/projects/useProjects': {
      useProject: () => ({ data: project, isLoading: false, ...options }),
    },
    '@/utils/date': { formatDate: value => value },
    '@/lib/constants': { SITE_URL: 'https://example.test' },
    '@/lib/markdown': { markdownSanitizeSchema: { test: true } },
  }
  const exports = {}
  vm.runInNewContext(compiled.outputText, {
    exports,
    require(name) {
      assert.ok(Object.hasOwn(modules, name), `Unexpected import: ${name}`)
      return modules[name]
    },
  })
  return exports.default()
}

function nodes(tree) {
  if (!tree || typeof tree !== 'object') return []
  if (Array.isArray(tree)) return tree.flatMap(nodes)
  return [tree, ...nodes(tree.props?.children)]
}

function text(tree) {
  if (typeof tree === 'string') return tree
  if (Array.isArray(tree)) return tree.map(text).join('')
  return tree && typeof tree === 'object' ? text(tree.props?.children) : ''
}

const base = {
  id: 'example', slug: 'example', title: 'Example project', subtitle: 'Summary',
  status: 'active', tech_stack: ['React'], created_at: '2026-01-01',
}

for (const description of [null, '', '   ', '## Overview\n\nVerified **implementation**.']) {
  for (const image of [false, true]) {
    for (const links of [false, true]) {
      test(`detail: description=${JSON.stringify(description)}, image=${image}, links=${links}`, () => {
        const project = {
          ...base, description,
          thumbnail_url: image ? 'https://example.test/screen.png' : null,
          demo_url: links ? 'https://example.test/demo' : null,
          repo_url: links ? 'https://example.test/repo' : null,
        }
        const tree = render(project)
        const all = nodes(tree)
        const markdown = all.filter(n => n.type === 'markdown')
        assert.equal(markdown.length, description?.trim() ? 1 : 0)
        if (markdown.length) {
          assert.equal(markdown[0].props.children, description)
          assert.equal(markdown[0].props.remarkPlugins[0], 'gfm')
          assert.equal(markdown[0].props.rehypePlugins[0][0], 'sanitize')
        }
        assert.equal(all.filter(n => n.type === 'img').length, Number(image))
        for (const url of [project.demo_url, project.repo_url].filter(Boolean)) {
          const matches = all.filter(n => n.type === 'a' && n.props.href === url)
          assert.equal(matches.length, 1)
          assert.equal(matches[0].props.rel, 'noopener noreferrer')
        }
        assert.equal(all.filter(n => n.type === 'a').length, links ? 2 : 0)
        assert.ok(text(tree).includes('공개'))
        assert.ok(!text(tree).includes('운영 중'))
        assert.ok(!text(tree).includes('공식 사이트 방문'))
        assert.ok(all.some(n => n.type === 'link' && n.props.to === '/contact'))
        assert.ok(!all.some(n => n.props?.className?.includes('lg:col-span-2')))
      })
    }
  }
}

test('existing related content, archived status and launch date remain visible', () => {
  const tree = render({
    ...base, status: 'archived', launched_at: '2026-01-02',
    content_project_map: [{ content: { id: 'related', title: 'Related' } }],
  })
  assert.ok(text(tree).includes('archived'))
  assert.ok(text(tree).includes('2026-01-02'))
  assert.equal(nodes(tree).filter(n => n.type === 'content-card').length, 1)
})

test('loading and missing projects retain their fallback UI', () => {
  assert.ok(nodes(render(null, { isLoading: true })).some(n => n.props?.className?.includes('skeleton')))
  assert.ok(text(render(null)).includes('프로젝트를 찾을 수 없습니다.'))
})

test('admin guidance does not populate or overwrite the description or save automatically', () => {
  for (const description of [null, '## Existing description']) {
    let cursor = 0
    const state = []
    let saves = 0
    const compiled = ts.transpileModule(
      readFileSync(new URL('../src/pages/admin/AdminProjects.tsx', import.meta.url), 'utf8'),
      { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } },
    )
    const jsx = (type, props) => ({ type, props })
    const modules = {
      react: { useState(initial) {
        const index = cursor++
        if (!(index in state)) state[index] = initial
        return [state[index], value => { state[index] = value }]
      } },
      'react/jsx-runtime': { jsx, jsxs: jsx, Fragment: 'fragment' },
      '@/components/seo/SEOHead': { default: 'seo' },
      '@/features/projects/useProjects': {
        useAdminProjects: () => ({ data: [{ ...base, description }], isLoading: false }),
        useUpsertProject: () => ({ mutateAsync: async () => { saves++ } }),
        useDeleteProject: () => ({}),
      },
      'lucide-react': { Plus: 'plus', X: 'close', Pencil: 'pencil', Trash2: 'trash' },
      '@/utils/slug': { toSlug: value => value },
      '@/lib/constants': { PROJECT_CATEGORIES: [] },
    }
    const exports = {}
    vm.runInNewContext(compiled.outputText, {
      exports, Date,
      require(name) {
        assert.ok(Object.hasOwn(modules, name), `Unexpected import: ${name}`)
        return modules[name]
      },
    })
    const initial = exports.default()
    nodes(initial).find(n => n.type === 'button' && text(n).includes('수정')).props.onClick()
    cursor = 0
    const modal = nodes(exports.default()).find(n => typeof n.type === 'function')
    const form = modal.type(modal.props)
    const textarea = nodes(form).find(n => n.type === 'textarea')
    assert.equal(textarea.props.value, description ?? '')
    assert.equal(textarea.props['aria-describedby'], 'project-description-guide')
    for (const heading of ['프로젝트 개요', '해결 과제', '핵심 기능', '실제 화면', '기술 아키텍처', '구축 성과']) {
      assert.ok(text(form).includes(heading))
    }
    assert.ok(text(form).includes('공개 승인'))
    assert.equal(saves, 0)
  }
})
