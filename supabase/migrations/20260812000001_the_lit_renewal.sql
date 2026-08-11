-- =============================================================================
-- THE LIT Digital Renewal 프로젝트 추가
-- BAIKAL이 구축한 복합문화공간 THE LIT 공식 웹사이트 리뉴얼 사례
-- =============================================================================

INSERT INTO projects (
  slug, title, subtitle, description,
  status, category, featured, sort_order,
  tech_stack, demo_url,
  meta_title, meta_desc,
  launched_at, metrics
)
VALUES (
  'the-lit-digital-renewal',
  'THE LIT Digital Renewal',
  '공간의 경험을 디지털로 연결하다',
  E'## BAIKAL × THE LIT\n\n복합문화공간 THE LIT의 브랜드 경험을 온라인에서도 이어갈 수 있도록 공식 웹사이트와 콘텐츠 운영 환경을 새롭게 구축했습니다.\n\n단순한 홈페이지 교체가 아니라, THE LIT의 공간·콘텐츠·브랜드를 하나의 디지털 경험으로 연결하는 것을 목표로 합니다.\n\n## 구축 범위\n\n- **Website Renewal** — 브랜드 정체성을 반영한 공식 웹사이트 전면 리뉴얼\n- **CMS** — 콘텐츠를 직접 관리할 수 있는 관리자 시스템\n- **Archive** — 공연·전시 기록 아카이브 구조화\n- **Blog** — 브랜드 스토리 및 공간 이야기 발행 채널\n- **Media** — 이미지·영상 미디어 통합 관리\n- **SEO** — 검색 노출 최적화 및 구조화 데이터 적용\n- **SNS / Content Hub** — 인스타그램·블로그·유튜브 콘텐츠 통합 허브\n- **Admin System** — BAIKAL Admin Framework 기반 운영 환경 구축',
  'active',
  'Web / Platform',
  TRUE,
  0,
  ARRAY['React', 'TypeScript', 'Supabase', 'Tailwind CSS', 'Node.js', 'SEO'],
  'https://thelit.kr',
  'THE LIT Digital Renewal — BAIKAL 구축 사례',
  '복합문화공간 THE LIT의 공식 웹사이트를 BAIKAL이 새롭게 구축했습니다. Website Renewal, CMS, Archive, Blog, Media, SEO, Admin System 통합 구축.',
  '2026-08-01',
  '{}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
  title       = EXCLUDED.title,
  subtitle    = EXCLUDED.subtitle,
  description = EXCLUDED.description,
  status      = EXCLUDED.status,
  category    = EXCLUDED.category,
  featured    = EXCLUDED.featured,
  sort_order  = EXCLUDED.sort_order,
  tech_stack  = EXCLUDED.tech_stack,
  demo_url    = EXCLUDED.demo_url,
  meta_title  = EXCLUDED.meta_title,
  meta_desc   = EXCLUDED.meta_desc,
  launched_at = EXCLUDED.launched_at,
  updated_at  = NOW();
