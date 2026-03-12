import { useParams, Navigate } from 'react-router-dom'

export default function ProjectCategoryPage() {
  const { category } = useParams<{ category: string }>()
  // 카테고리 필터는 ProjectListPage에서 처리 — 리다이렉트
  return <Navigate to="/projects" replace />
}
