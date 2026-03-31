import { supabase } from '@/lib/supabase'
import type { Project, ProjectFilters } from '@/types/models'

export async function getProjects(filters: ProjectFilters = {}): Promise<Project[]> {
  let query = supabase
    .from('projects')
    .select('*')
    .eq('status', filters.status ?? 'active')
    .order('sort_order', { ascending: true })
    .order('launched_at', { ascending: false })

  if (filters.featured !== undefined) {
    query = query.eq('featured', filters.featured)
  }
  if (filters.category) {
    query = query.eq('category', filters.category)
  }

  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as Project[]
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      media_assets(*),
      content_project_map(
        relation,
        content:contents(
          id, slug, title, summary, content_type,
          thumbnail_url, published_at, status,
          tags:content_tag_map(tag:tags(*))
        )
      )
    `)
    .eq('slug', slug)
    .in('status', ['active', 'archived'])
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data as Project
}

export async function getFeaturedProjects(limit = 6): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('id, slug, title, subtitle, thumbnail_url, category, tech_stack, featured')
    .eq('status', 'active')
    .eq('featured', true)
    .order('sort_order', { ascending: true })
    .limit(limit)

  if (error) throw error
  return (data ?? []) as Project[]
}

// Admin: 전체 프로젝트 (draft 포함)
export async function adminGetProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as Project[]
}

export async function adminUpsertProject(
  project: Partial<Project> & { slug: string; title: string }
): Promise<Project> {
  const { data, error } = await supabase
    .from('projects')
    .upsert(project, { onConflict: 'slug' })
    .select()
    .single()

  if (error) throw error
  return data as Project
}

export async function adminDeleteProject(id: string): Promise<void> {
  const { error } = await supabase.from('projects').delete().eq('id', id)
  if (error) throw error
}
