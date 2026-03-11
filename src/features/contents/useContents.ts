import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getContents,
  getContentBySlug,
  getFeaturedContents,
  adminGetContents,
  adminPublishContent,
  adminRejectContent,
} from './contentService'
import type { ContentFilters } from '@/types/models'

export const contentKeys = {
  all: ['contents'] as const,
  list: (filters: ContentFilters) => ['contents', 'list', filters] as const,
  detail: (slug: string) => ['contents', 'detail', slug] as const,
  featured: (limit: number) => ['contents', 'featured', limit] as const,
  admin: (status?: string) => ['contents', 'admin', status] as const,
}

export function useContents(filters: ContentFilters = {}) {
  return useQuery({
    queryKey: contentKeys.list(filters),
    queryFn: () => getContents(filters),
  })
}

export function useContent(slug: string) {
  return useQuery({
    queryKey: contentKeys.detail(slug),
    queryFn: () => getContentBySlug(slug),
    enabled: Boolean(slug),
  })
}

export function useFeaturedContents(limit = 6) {
  return useQuery({
    queryKey: contentKeys.featured(limit),
    queryFn: () => getFeaturedContents(limit),
  })
}

export function useAdminContents(status?: string) {
  return useQuery({
    queryKey: contentKeys.admin(status),
    queryFn: () => adminGetContents(status),
  })
}

export function usePublishContent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => adminPublishContent(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: contentKeys.all }),
  })
}

export function useRejectContent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => adminRejectContent(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: contentKeys.all }),
  })
}
