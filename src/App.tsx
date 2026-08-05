import { Routes, Route, useLocation } from 'react-router-dom'
import { Suspense, lazy, useEffect } from 'react'
import PublicLayout from '@/layouts/PublicLayout'
import AdminLayout from '@/layouts/AdminLayout'
import ProtectedRoute from '@/routes/ProtectedRoute'

// ── Lazy-loaded pages (route-level code splitting) ──────────────────────────
// Public
const HomePage             = lazy(() => import('@/pages/home/HomePage'))
const AboutPage            = lazy(() => import('@/pages/about/AboutPage'))
const ServicesPage         = lazy(() => import('@/pages/services/ServicesPage'))
const ContactPage          = lazy(() => import('@/pages/contact/ContactPage'))

// Projects
const ProjectListPage      = lazy(() => import('@/pages/projects/ProjectListPage'))
const ProjectDetailPage    = lazy(() => import('@/pages/projects/ProjectDetailPage'))
const ProjectCategoryPage  = lazy(() => import('@/pages/projects/ProjectCategoryPage'))

// Solutions
const SolutionsPage        = lazy(() => import('@/pages/solutions/SolutionsPage'))
const SolutionDetailPage   = lazy(() => import('@/pages/solutions/SolutionDetailPage'))

// Lab
const ArticleListPage      = lazy(() => import('@/pages/lab/ArticleListPage'))
const ArticleDetailPage    = lazy(() => import('@/pages/lab/ArticleDetailPage'))

// Content Hub
const ContentHubPage       = lazy(() => import('@/pages/content/ContentHubPage'))
const ContentChannelPage   = lazy(() => import('@/pages/content/ContentChannelPage'))

// Media
const MediaPage            = lazy(() => import('@/pages/media/MediaPage'))

// Topics
const TopicListPage        = lazy(() => import('@/pages/topics/TopicListPage'))
const TopicDetailPage      = lazy(() => import('@/pages/topics/TopicDetailPage'))

// Archive
const ArchiveYearPage      = lazy(() => import('@/pages/archive/ArchiveYearPage'))

// Auth
const LoginPage            = lazy(() => import('@/pages/auth/LoginPage'))

// Admin
const AdminDashboard       = lazy(() => import('@/pages/admin/AdminDashboard'))
const AdminContents        = lazy(() => import('@/pages/admin/AdminContents'))
const AdminProjects        = lazy(() => import('@/pages/admin/AdminProjects'))
const AdminSources         = lazy(() => import('@/pages/admin/AdminSources'))
const AdminSyncJobs        = lazy(() => import('@/pages/admin/AdminSyncJobs'))
const AdminMedia           = lazy(() => import('@/pages/admin/AdminMedia'))
const AdminTags            = lazy(() => import('@/pages/admin/AdminTags'))
const AdminExternal        = lazy(() => import('@/pages/admin/AdminExternal'))
const AdminMarketing       = lazy(() => import('@/pages/admin/AdminMarketing'))

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }) }, [pathname])
  return null
}

function RouteFallback() {
  return (
    <div className="min-h-[40vh] flex items-center justify-center">
      <div className="skeleton h-8 w-48 rounded-xl" />
    </div>
  )
}

export default function App() {
  return (
    <>
    <ScrollToTop />
    <Suspense fallback={<RouteFallback />}>
    <Routes>
      {/* Auth */}
      <Route path="/login" element={<LoginPage />} />

      {/* Admin (보호 라우트) */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="contents" element={<AdminContents />} />
        <Route path="projects" element={<AdminProjects />} />
        <Route path="sources" element={<AdminSources />} />
        <Route path="sync-jobs" element={<AdminSyncJobs />} />
        <Route path="media" element={<AdminMedia />} />
        <Route path="tags" element={<AdminTags />} />
        <Route path="external" element={<AdminExternal />} />
        <Route path="marketing" element={<AdminMarketing />} />
      </Route>

      {/* Public */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/contact" element={<ContactPage />} />

        {/* Projects */}
        <Route path="/projects" element={<ProjectListPage />} />
        <Route path="/projects/category/:category" element={<ProjectCategoryPage />} />
        <Route path="/projects/:slug" element={<ProjectDetailPage />} />

        {/* Solutions */}
        <Route path="/solutions" element={<SolutionsPage />} />
        <Route path="/solutions/:slug" element={<SolutionDetailPage />} />

        {/* Lab */}
        <Route path="/lab/articles" element={<ArticleListPage />} />
        <Route path="/lab/articles/:slug" element={<ArticleDetailPage />} />
        <Route path="/lab/notes" element={<ArticleListPage />} />
        <Route path="/lab/notes/:slug" element={<ArticleDetailPage />} />
        <Route path="/lab/experiments" element={<ArticleListPage />} />
        <Route path="/lab/experiments/:slug" element={<ArticleDetailPage />} />
        <Route path="/lab/research" element={<ArticleListPage />} />
        <Route path="/lab/research/:slug" element={<ArticleDetailPage />} />

        {/* Content Hub */}
        <Route path="/content" element={<ContentHubPage />} />
        <Route path="/content/:channel" element={<ContentChannelPage />} />

        {/* Media */}
        <Route path="/media" element={<MediaPage />} />
        <Route path="/media/:type" element={<MediaPage />} />

        {/* Topics */}
        <Route path="/topics" element={<TopicListPage />} />
        <Route path="/topics/:slug" element={<TopicDetailPage />} />

        {/* Archive */}
        <Route path="/archive/year/:year" element={<ArchiveYearPage />} />
      </Route>
    </Routes>
    </Suspense>
    </>
  )
}
