import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getProjects,
  getProjectBySlug,
  getFeaturedProjects,
  adminGetProjects,
  adminUpsertProject,
  adminDeleteProject,
} from './projectService'
import type { ProjectFilters } from '@/types/models'

export const projectKeys = {
  all: ['projects'] as const,
  list: (filters: ProjectFilters) => ['projects', 'list', filters] as const,
  featured: (limit: number) => ['projects', 'featured', limit] as const,
  detail: (slug: string) => ['projects', 'detail', slug] as const,
  admin: () => ['projects', 'admin'] as const,
}

export function useProjects(filters: ProjectFilters = {}) {
  return useQuery({
    queryKey: projectKeys.list(filters),
    queryFn: () => getProjects(filters),
  })
}

export function useFeaturedProjects(limit = 6) {
  return useQuery({
    queryKey: projectKeys.featured(limit),
    queryFn: () => getFeaturedProjects(limit),
  })
}

export function useProject(slug: string) {
  return useQuery({
    queryKey: projectKeys.detail(slug),
    queryFn: () => getProjectBySlug(slug),
    enabled: Boolean(slug),
  })
}

export function useAdminProjects() {
  return useQuery({
    queryKey: projectKeys.admin(),
    queryFn: adminGetProjects,
  })
}

export function useUpsertProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: adminUpsertProject,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: projectKeys.all })
    },
  })
}

export function useDeleteProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => adminDeleteProject(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: projectKeys.all })
    },
  })
}
