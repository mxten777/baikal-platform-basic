-- =============================================================================
-- BAIKAL 포트폴리오 프로젝트 43개 시드 데이터
-- Supabase SQL Editor에서 실행하세요
-- 기존 slug 충돌 방지: ON CONFLICT (slug) DO NOTHING
-- =============================================================================

INSERT INTO projects (
  slug, title, subtitle, category,
  status, featured, sort_order, tech_stack, metrics
) VALUES

-- ============================================================
-- 목차 1 (1~11)
-- ============================================================

(
  'rpa-management-platform',
  '차세대 RPA 통합 관리 플랫폼',
  '로봇 프로세스 자동화를 중앙에서 설계·모니터링·운영하는 엔터프라이즈 플랫폼',
  'AI Agent',
  'active', TRUE, 1,
  ARRAY['Python', 'React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker'],
  '{}'
),
(
  'facility-safety-checklist',
  '시설 안전점검 디지털 체크리스트 시스템',
  '현장 점검원이 모바일로 안전점검을 수행하고 보고서를 자동 생성하는 시스템',
  'Platform / Infra',
  'active', FALSE, 2,
  ARRAY['React', 'PWA', 'Node.js', 'PostgreSQL', 'TypeScript'],
  '{}'
),
(
  'bookbuddy-mvp',
  '북버디 (BookBuddy) 도서공유 웹앱',
  '개인 도서를 등록·공유·대여할 수 있는 커뮤니티 기반 MVP 웹앱',
  'SaaS / MVP',
  'active', FALSE, 3,
  ARRAY['React', 'TypeScript', 'Supabase', 'Tailwind CSS'],
  '{}'
),
(
  'ai-signage-saas',
  'AI Signage SaaS 플랫폼',
  '광고 영상을 AI로 자동 생성하고 디지털 사이니지에 자동 송출하는 SaaS',
  'AI Platform',
  'active', TRUE, 4,
  ARRAY['Python', 'OpenAI', 'FFmpeg', 'React', 'TypeScript', 'FastAPI'],
  '{}'
),
(
  'private-ai-document-search',
  'Private AI 폐쇄망 문서검색·답변 플랫폼',
  '인터넷 단절 환경(폐쇄망)에 설치하는 RAG 기반 문서검색·AI 답변 시스템',
  'AI Platform',
  'active', TRUE, 5,
  ARRAY['Python', 'LangChain', 'pgvector', 'Ollama', 'FastAPI', 'React'],
  '{}'
),
(
  'grant-ai-mvp',
  'Grant AI — 보조금 지원사업 MVP',
  '기업 맞춤 보조금·지원사업을 AI가 자동 탐색·신청서를 초안 작성해 주는 플랫폼',
  'AI Agent',
  'active', TRUE, 6,
  ARRAY['React', 'TypeScript', 'OpenAI', 'LangChain', 'Python', 'FastAPI'],
  '{}'
),
(
  'groupware-ai-agent',
  'Groupware AI — AI Agent 중심 차세대 그룹웨어 MVP',
  'AI 에이전트가 업무 보조·자동화·일정 관리를 수행하는 차세대 기업 그룹웨어',
  'AI Agent',
  'active', TRUE, 7,
  ARRAY['React', 'TypeScript', 'OpenAI', 'LangChain', 'Node.js', 'PostgreSQL'],
  '{}'
),
(
  'public-institution-cms',
  '공공기관 홈페이지 + 관리자 CMS 플랫폼 MVP',
  '공공기관 전용 표준 홈페이지와 비개발자도 쉽게 사용하는 CMS 어드민 패키지',
  'Platform / Infra',
  'active', FALSE, 8,
  ARRAY['React', 'TypeScript', 'Tailwind CSS', 'Supabase', 'Node.js'],
  '{}'
),
(
  'silver-mall-welfare',
  '실버몰 — 복지용구 쇼핑몰 플랫폼 MVP',
  '노인장기요양 복지용구를 온라인으로 신청·결제·배송 관리하는 커머스 플랫폼',
  'SaaS / MVP',
  'active', FALSE, 9,
  ARRAY['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Tailwind CSS'],
  '{}'
),
(
  'the-lit-culture-platform',
  'The LIT 복합문화공간 플랫폼 MVP',
  '공연·전시·강좌·공간 예약을 통합 운영하는 복합문화공간 플랫폼',
  'SaaS / MVP',
  'active', FALSE, 10,
  ARRAY['React', 'TypeScript', 'Supabase', 'Tailwind CSS', 'Stripe'],
  '{}'
),
(
  'ai-dyslexia-literacy',
  'AI 기반 학생 문해력·난독증 개선 플랫폼 MVP',
  'AI 진단·맞춤 훈련으로 초등학생의 문해력 향상과 난독증 조기 개입을 돕는 에듀테크',
  'AI Platform',
  'active', FALSE, 11,
  ARRAY['React', 'TypeScript', 'OpenAI', 'Python', 'FastAPI', 'PostgreSQL'],
  '{}'
),

-- ============================================================
-- 목차 2 (12~27)
-- ============================================================

(
  'ai-senior-jobs',
  'AI 중장년 일자리 플랫폼',
  '중장년층의 경력·역량을 AI가 분석해 적합 일자리를 매칭하는 취업 지원 플랫폼',
  'AI Platform',
  'active', FALSE, 12,
  ARRAY['React', 'TypeScript', 'OpenAI', 'Python', 'FastAPI', 'PostgreSQL'],
  '{}'
),
(
  'seonghye-ai-symptom-check',
  '성혜정형외과 의원 AI 증상 체크',
  '정형외과 환자가 내원 전 AI로 증상을 사전 체크하고 진료 예약하는 솔루션',
  'AI Agent',
  'active', FALSE, 13,
  ARRAY['React', 'TypeScript', 'OpenAI', 'FastAPI', 'Python'],
  '{}'
),
(
  'smart-bidding-intelligence',
  'MVP 스마트 입찰·조달 인텔리전스 플랫폼',
  '공공 입찰 공고를 AI가 분석·추천하고 입찰서 초안을 자동 작성하는 조달 플랫폼',
  'AI Platform',
  'active', FALSE, 14,
  ARRAY['React', 'TypeScript', 'OpenAI', 'Python', 'FastAPI', 'PostgreSQL'],
  '{}'
),
(
  'vibe-finance-hub',
  'Vibe Finance Hub — 회계·재무 자동화 웹앱',
  '지출·수입·세금 데이터를 AI가 자동 분류·보고서 생성하는 중소기업 재무 자동화 툴',
  'SaaS / MVP',
  'active', FALSE, 15,
  ARRAY['React', 'TypeScript', 'OpenAI', 'Supabase', 'Tailwind CSS'],
  '{}'
),
(
  'public-e-approval-hub',
  '공공 전자결재(Hub) 플랫폼',
  '공공기관·지자체용 전자결재 및 행정 문서 관리 통합 플랫폼',
  'Platform / Infra',
  'active', FALSE, 16,
  ARRAY['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker'],
  '{}'
),
(
  'ai-education-workers',
  '직장인을 위한 AI 교육 플랫폼',
  'AI·디지털 전환 역량 강화를 위한 직장인 맞춤 온라인 교육 플랫폼',
  'AI Platform',
  'active', FALSE, 17,
  ARRAY['React', 'TypeScript', 'OpenAI', 'Supabase', 'Tailwind CSS'],
  '{}'
),
(
  'cooperative-whitelabel-saas',
  '농협·신협 화이트라벨 SaaS',
  '농협·신협 계열 조합이 자체 브랜드로 운영할 수 있는 화이트라벨 금융 SaaS 플랫폼',
  'SaaS / MVP',
  'active', FALSE, 18,
  ARRAY['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Tailwind CSS'],
  '{}'
),
(
  'public-facility-reservation',
  '공공시설 예약 통합 플랫폼',
  '지자체 공공시설(체육관·회의실·공원 등) 예약·결제·관리를 통합하는 플랫폼',
  'Platform / Infra',
  'active', FALSE, 19,
  ARRAY['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Tailwind CSS'],
  '{}'
),
(
  'groupware-messenger',
  '그룹웨어 + 업무메신저',
  '일정·전자결재·프로젝트 관리와 실시간 메신저를 결합한 기업용 협업 플랫폼',
  'Platform / Infra',
  'active', FALSE, 20,
  ARRAY['React', 'TypeScript', 'Node.js', 'WebSocket', 'PostgreSQL'],
  '{}'
),
(
  'welfare-goods-rental',
  '복지용품·공유물품 대여 플랫폼',
  '복지용품 및 공유 물품의 신청·대여·반납을 디지털로 관리하는 서비스',
  'Platform / Infra',
  'active', FALSE, 21,
  ARRAY['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Tailwind CSS'],
  '{}'
),
(
  'baikal-homecare-website',
  '바이칼 재가복지센터 홈페이지',
  '재가복지 서비스 소개 및 이용 신청을 위한 기관 공식 홈페이지',
  'Website',
  'active', FALSE, 22,
  ARRAY['React', 'TypeScript', 'Tailwind CSS', 'Vite'],
  '{}'
),
(
  'compensa-ai-land',
  'Compensa.AI — 토지보상 플랫폼',
  '토지 수용·보상 절차를 AI가 자동 분석·서류 초안 작성으로 지원하는 법무 플랫폼',
  'AI Platform',
  'active', TRUE, 23,
  ARRAY['React', 'TypeScript', 'OpenAI', 'Python', 'FastAPI', 'PostgreSQL'],
  '{}'
),
(
  'ai-meeting-minutes',
  'AI 회의록 자동화 웹앱',
  '회의 음성을 AI가 전사·요약·액션아이템 정리까지 자동으로 처리하는 웹앱',
  'AI Platform',
  'active', TRUE, 24,
  ARRAY['React', 'TypeScript', 'OpenAI Whisper', 'GPT-4o', 'Python', 'FastAPI'],
  '{}'
),
(
  'smart-queue-notification',
  '스마트 대기표 & 알림 플랫폼',
  '현장 대기표 발행·순서 알림·호출을 모바일로 처리하는 스마트 대기 관리 시스템',
  'Platform / Infra',
  'active', FALSE, 25,
  ARRAY['React', 'TypeScript', 'Node.js', 'WebSocket', 'Firebase', 'PostgreSQL'],
  '{}'
),
(
  'mes-workflow-hub',
  'MES WorkFlow Hub',
  '제조 현장의 생산 공정·작업지시·품질 이슈를 실시간으로 관리하는 MES 플랫폼',
  'Platform / Infra',
  'active', FALSE, 26,
  ARRAY['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker', 'WebSocket'],
  '{}'
),
(
  'kesri-website-ai-qna',
  'KESRI 웹사이트 리뉴얼 (AI QnA)',
  '한국환경안전연구소 공식 홈페이지 리뉴얼 + AI 기반 Q&A 챗봇 통합',
  'Website',
  'active', FALSE, 27,
  ARRAY['React', 'TypeScript', 'OpenAI', 'Tailwind CSS', 'Vite'],
  '{}'
),

-- ============================================================
-- 목차 3 (28~43)
-- ============================================================

(
  'vibe-coding-portfolio',
  '바이브 코딩 MVP 소개자료 웹앱',
  '바이브 코딩(Vibe Coding) 방식으로 개발한 MVP 포트폴리오 소개 웹앱',
  'SaaS / MVP',
  'active', FALSE, 28,
  ARRAY['React', 'TypeScript', 'Tailwind CSS', 'Vite', 'Supabase'],
  '{}'
),
(
  'baikalsys-website',
  '바이칼시스템즈 공식 홈페이지',
  'AI 소프트웨어 개발사 바이칼시스템즈의 공식 홈페이지 및 랜딩 페이지',
  'Website',
  'active', FALSE, 29,
  ARRAY['React', 'TypeScript', 'Tailwind CSS', 'Vite', 'Vercel'],
  '{}'
),
(
  'korea-cofron-website',
  '한국 코프론 홈페이지',
  '한국 코프론 공식 기업 홈페이지',
  'Website',
  'active', FALSE, 30,
  ARRAY['React', 'TypeScript', 'Tailwind CSS', 'Vite'],
  '{}'
),
(
  'gwangyeon-driving-academy',
  '광연운전 전문학원 홈페이지',
  '광연운전 전문학원 공식 홈페이지 — 수강 신청 및 과정 안내',
  'Website',
  'active', FALSE, 31,
  ARRAY['React', 'TypeScript', 'Tailwind CSS', 'Vite'],
  '{}'
),
(
  'dbinfo-website',
  '디비인포 홈페이지',
  '디비인포 공식 기업 홈페이지',
  'Website',
  'active', FALSE, 32,
  ARRAY['React', 'TypeScript', 'Tailwind CSS', 'Vite'],
  '{}'
),
(
  'baikal-resort-website',
  '바이칼 리조트 홈페이지 & 예약',
  '바이칼 리조트 공식 홈페이지 및 객실 예약 시스템',
  'Website',
  'active', FALSE, 33,
  ARRAY['React', 'TypeScript', 'Tailwind CSS', 'Vite', 'PostgreSQL'],
  '{}'
),
(
  'park-legal-landing',
  '박신환 행정사 랜딩페이지',
  '박신환 행정사 사무소 공식 서비스 소개 랜딩 페이지',
  'Website',
  'active', FALSE, 34,
  ARRAY['React', 'TypeScript', 'Tailwind CSS', 'Vite'],
  '{}'
),
(
  'park-dental-website',
  '박영진치과 홈페이지',
  '박영진치과 공식 홈페이지 — 진료 안내 및 예약',
  'Website',
  'active', FALSE, 35,
  ARRAY['React', 'TypeScript', 'Tailwind CSS', 'Vite'],
  '{}'
),
(
  'sunwoo-ent-website',
  '선우이비인후과 홈페이지',
  '선우이비인후과 공식 홈페이지 — 진료 안내 및 예약',
  'Website',
  'active', FALSE, 36,
  ARRAY['React', 'TypeScript', 'Tailwind CSS', 'Vite'],
  '{}'
),
(
  'seonghye-orthopedics-website',
  '성혜정형외과 홈페이지',
  '성혜정형외과 공식 홈페이지 — 진료·시술 안내 및 예약',
  'Website',
  'active', FALSE, 37,
  ARRAY['React', 'TypeScript', 'Tailwind CSS', 'Vite'],
  '{}'
),
(
  'itterak-childcare-website',
  '아이뜨락어린이집 홈페이지',
  '아이뜨락어린이집 공식 홈페이지 — 교육 철학 및 입학 안내',
  'Website',
  'active', FALSE, 38,
  ARRAY['React', 'TypeScript', 'Tailwind CSS', 'Vite'],
  '{}'
),
(
  'mansong-system-website',
  '만송시스템 홈페이지',
  '만송시스템 공식 기업 홈페이지',
  'Website',
  'active', FALSE, 39,
  ARRAY['React', 'TypeScript', 'Tailwind CSS', 'Vite'],
  '{}'
),
(
  'jeju-semiconductor-type-a',
  '제주반도체 홈페이지 [TYPE A]',
  '제주반도체 공식 홈페이지 — 디자인 TYPE A 버전',
  'Website',
  'active', FALSE, 40,
  ARRAY['React', 'TypeScript', 'Tailwind CSS', 'Vite'],
  '{}'
),
(
  'jeju-semiconductor-type-b',
  '제주반도체 홈페이지 [TYPE B]',
  '제주반도체 공식 홈페이지 — 디자인 TYPE B 버전',
  'Website',
  'active', FALSE, 41,
  ARRAY['React', 'TypeScript', 'Tailwind CSS', 'Vite'],
  '{}'
),
(
  'inplus-b2b-website',
  '인플러스 프리미엄 B2B 기업 웹사이트',
  '장애인 채용 전문 기업 인플러스의 프리미엄 B2B 기업 웹사이트',
  'Website',
  'active', FALSE, 42,
  ARRAY['React', 'TypeScript', 'Tailwind CSS', 'Vite'],
  '{}'
),
(
  'chunggaram-politician-landing',
  '청가람 국회의원 공식 랜딩페이지',
  '청가람 국회의원 공식 활동 소개 및 소통 채널 랜딩 페이지',
  'Website',
  'active', FALSE, 43,
  ARRAY['React', 'TypeScript', 'Tailwind CSS', 'Vite'],
  '{}'
)

ON CONFLICT (slug) DO NOTHING;
