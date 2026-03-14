import { Navigate } from 'react-router-dom'

export default function ProjectCategoryPage() {
  // 카테고리 필터는 ProjectListPage에서 처리 — 리다이렉트
  return <Navigate to="/projects" replace />
}
