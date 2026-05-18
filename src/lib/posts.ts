import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import readingTime from 'reading-time'
import type { Post, PostMeta, PaginationData, TagCount } from '@/types'

/** MDX 内容文件根目录 */
const POSTS_DIR = path.join(process.cwd(), 'content/posts')

/** 每页默认显示文章数量 */
export const POSTS_PER_PAGE = 6

/**
 * 获取所有文章的 slug 列表（用于静态路由生成）
 */
export function getAllSlugs(): string[] {
  if (!fs.existsSync(POSTS_DIR)) return []
  return fs
    .readdirSync(POSTS_DIR)
    .filter((file) => /\.(md|mdx)$/.test(file))
    .map((file) => file.replace(/\.(md|mdx)$/, ''))
}

/**
 * 读取单篇文章的完整内容（含 frontmatter 和 MDX 正文）
 */
export function getPostBySlug(slug: string): Post | null {
  // 优先查找 .mdx 再退回 .md
  const extensions = ['mdx', 'md']
  let filePath = ''
  for (const ext of extensions) {
    const candidate = path.join(POSTS_DIR, `${slug}.${ext}`)
    if (fs.existsSync(candidate)) {
      filePath = candidate
      break
    }
  }
  if (!filePath) return null

  const raw = fs.readFileSync(filePath, 'utf-8')
  const { data, content } = matter(raw)

  // 计算阅读时间（以中文字符为基础）
  const stats = readingTime(content, { wordsPerMinute: 300 })

  return {
    slug,
    title: data.title ?? '无标题',
    date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
    summary: data.summary ?? data.description ?? '',
    tags: Array.isArray(data.tags) ? data.tags : [],
    coverImage: data.coverImage ?? data.cover ?? undefined,
    draft: data.draft ?? false,
    author: data.author ?? '博客作者',
    readingTime: Math.ceil(stats.minutes),
    content,
  }
}

/**
 * 获取全部已发布文章的元数据，按日期倒序排列
 */
export function getAllPosts(): PostMeta[] {
  const slugs = getAllSlugs()
  return slugs
    .map((slug) => {
      const post = getPostBySlug(slug)
      return post
    })
    .filter((post): post is Post => post !== null && post.draft !== true)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

/**
 * 分页获取文章列表
 * @param page - 当前页码（从 1 开始）
 * @param perPage - 每页数量，默认 POSTS_PER_PAGE
 */
export function getPostsByPage(
  page: number,
  perPage = POSTS_PER_PAGE
): { posts: PostMeta[]; pagination: PaginationData } {
  const allPosts = getAllPosts()
  const totalPosts = allPosts.length
  const totalPages = Math.max(1, Math.ceil(totalPosts / perPage))
  const safePage = Math.min(Math.max(1, page), totalPages)

  const start = (safePage - 1) * perPage
  const posts = allPosts.slice(start, start + perPage)

  return {
    posts,
    pagination: {
      currentPage: safePage,
      totalPages,
      totalPosts,
      postsPerPage: perPage,
      hasPrevPage: safePage > 1,
      hasNextPage: safePage < totalPages,
    },
  }
}

/**
 * 根据标签筛选文章
 */
export function getPostsByTag(tag: string): PostMeta[] {
  return getAllPosts().filter((post) =>
    post.tags.map((t) => t.toLowerCase()).includes(tag.toLowerCase())
  )
}

/**
 * 统计所有标签及其文章数量，按数量倒序
 */
export function getAllTags(): TagCount[] {
  const posts = getAllPosts()
  const tagMap = new Map<string, number>()

  for (const post of posts) {
    for (const tag of post.tags) {
      tagMap.set(tag, (tagMap.get(tag) ?? 0) + 1)
    }
  }

  return Array.from(tagMap.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
}

/**
 * 获取上一篇 / 下一篇文章（用于详情页导航）
 */
export function getAdjacentPosts(
  slug: string
): { prev: PostMeta | null; next: PostMeta | null } {
  const posts = getAllPosts()
  const idx = posts.findIndex((p) => p.slug === slug)
  return {
    prev: idx > 0 ? posts[idx - 1] : null,
    next: idx < posts.length - 1 ? posts[idx + 1] : null,
  }
}
