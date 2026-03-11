import { useParams } from 'react-router-dom'
import SEOHead from '@/components/seo/SEOHead'
export default function ProjectCategoryPage() {
  const { category } = useParams<{ category: string }>()
  return (
    <>
      <SEOHead title={`${category} 프로젝트`} canonical={`/projects/category/${category}`} />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{category?.toUpperCase()} 프로젝트</h1>
      </div>
    </>
  )
}
