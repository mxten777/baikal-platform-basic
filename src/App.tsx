import { Routes, Route } from 'react-router-dom'
import PublicLayout from '@/layouts/PublicLayout'
import AdminLayout from '@/layouts/AdminLayout'
import ProtectedRoute from '@/routes/ProtectedRoute'

// Public pages
import HomePage from '@/pages/home/HomePage'
import AboutPage from '@/pages/about/AboutPage'
import ServicesPage from '@/pages/services/ServicesPage'
import ContactPage from '@/pages/contact/ContactPage'

// Projects
import ProjectListPage from '@/pages/projects/ProjectListPage'
import ProjectDetailPage from '@/pages/projects/ProjectDetailPage'
import ProjectCategoryPage from '@/pages/projects/ProjectCategoryPage'

// Lab
import ArticleListPage from '@/pages/lab/ArticleListPage'
import ArticleDetailPage from '@/pages/lab/ArticleDetailPage'

// Content Hub
import ContentHubPage from '@/pages/content/ContentHubPage'
import ContentChannelPage from '@/pages/content/ContentChannelPage'

// Media
import MediaPage from '@/pages/media/MediaPage'

// Topics
import TopicListPage from '@/pages/topics/TopicListPage'
import TopicDetailPage from '@/pages/topics/TopicDetailPage'

// Archive
import ArchiveYearPage from '@/pages/archive/ArchiveYearPage'

// Auth
import LoginPage from '@/pages/auth/LoginPage'

// Admin
import AdminDashboard from '@/pages/admin/AdminDashboard'
import AdminContents from '@/pages/admin/AdminContents'
import AdminProjects from '@/pages/admin/AdminProjects'
import AdminSources from '@/pages/admin/AdminSources'
import AdminSyncJobs from '@/pages/admin/AdminSyncJobs'
import AdminMedia from '@/pages/admin/AdminMedia'
import AdminSEO from '@/pages/admin/AdminSEO'
import AdminSettings from '@/pages/admin/AdminSettings'

export default function App() {
  return (
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
        <Route path="seo" element={<AdminSEO />} />
        <Route path="settings" element={<AdminSettings />} />
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

        {/* Lab */}
        <Route path="/lab/articles" element={<ArticleListPage />} />
        <Route path="/lab/articles/:slug" element={<ArticleDetailPage />} />
        <Route path="/lab/notes" element={<ArticleListPage />} />
        <Route path="/lab/experiments" element={<ArticleListPage />} />
        <Route path="/lab/research" element={<ArticleListPage />} />

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
  )
}
