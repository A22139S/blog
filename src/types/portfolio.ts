export interface Project {
  id: string
  title: string
  description: string
  category: 'web' | 'tool' | 'design' | 'other'
  tags: string[]
  imageUrl: string
  demoUrl?: string
  githubUrl?: string
  featured: boolean
  /** 项目详情的富 HTML 内容，如有则渲染在详情页中 */
  contentHtml?: string
}

export type ProjectCategory = Project['category'] | 'all'

export const CATEGORY_LABELS: Record<ProjectCategory, string> = {
  all: '全部',
  web: 'Web 应用',
  tool: '工具脚本',
  design: '设计',
  other: '其他',
}
