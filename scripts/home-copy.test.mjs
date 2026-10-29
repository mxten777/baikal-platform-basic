import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import vm from 'node:vm'
import ts from 'typescript'

function render() {
  const compiled = ts.transpileModule(
    readFileSync(new URL('../src/pages/home/HomePage.tsx', import.meta.url), 'utf8'),
    { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } },
  )
  const jsx = (type, props) => ({ type, props })
  const modules = {
    react: { useEffect() {} },
    'react/jsx-runtime': { jsx, jsxs: jsx, Fragment: 'fragment' },
    'react-router-dom': { Link: 'link' },
    '@/components/seo/SEOHead': { default: 'seo' },
    '@/components/project/ProjectCard': { default: 'project-card' },
    '@/components/content/ContentCard': { default: 'content-card' },
    '@/components/solution/FeaturedSolutionCard': { default: 'solution-card' },
    '@/features/projects/useProjects': { useFeaturedProjects(limit) {
      assert.equal(limit, 6)
      return { data: Array.from({ length: 6 }, (_, id) => ({ id })), isLoading: false }
    } },
    '@/features/contents/useContents': { useContents: () => ({ data: { data: [] }, isLoading: false }) },
    '@/lib/constants': { SITE_URL: 'https://example.test' },
    '@/lib/solutions': { FEATURED_SOLUTION: {} },
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

test('THE LIT case distinguishes website deployment from unverified CMS and reservation operation', () => {
  const section = nodes(render()).find(n => n.type === 'section' && text(n).includes('대표 구축 사례'))
  assert.ok(section)
  const copy = text(section)
  assert.ok(copy.includes('브랜드 홈페이지 리뉴얼 · 반응형 UI · Supabase 기반 CMS 구현'))
  assert.ok(copy.includes('브랜드 홈페이지 운영 배포'))
  assert.ok(copy.includes('예약은 신청 화면·관련 코드 구현 범위'))
  assert.ok(copy.includes('CMS CRUD·예약 접수 운영은 별도 검증 대상'))
  for (const unsupported of ['AI Marketing Engine', 'AI 기반 디지털 플랫폼', '운영 중', 'Powered by BAIKAL AI Platform']) {
    assert.ok(!copy.includes(unsupported), unsupported)
  }
  const link = nodes(section).find(n => n.type === 'link')
  assert.equal(link.props.to, '/projects/the-lit-digital-renewal')
  assert.equal(text(link), '사례 자세히 보기 →')
})

test('THE LIT product describes the implemented reservation screen without payment or integrated operation claims', () => {
  const product = nodes(render()).find(n => n.type === 'li' && nodes(n).some(child => child.type === 'h3' && text(child) === 'THE LIT'))
  assert.ok(product)
  assert.ok(text(product).includes('예약은 신청 화면·관련 코드 구현 범위입니다.'))
  assert.ok(text(product).includes('예약 신청 화면'))
  assert.ok(!text(product).includes('예약·결제'))
  assert.ok(!text(product).includes('통합 운영'))
  assert.equal(nodes(product).find(n => n.type === 'link').props.to, '/solutions')
})

test('featured project query and the three-card display remain unchanged', () => {
  const cards = nodes(render()).filter(n => n.type === 'project-card')
  assert.deepEqual(cards.map(n => n.props.project.id), [0, 1, 2])
})
