import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, parseISO } from 'date-fns'
import { zhCN } from 'date-fns/locale'

/**
 * 合并 Tailwind CSS 类名（处理冲突）
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 格式化日期为中文友好格式
 * @example formatDate('2024-01-15') => '2024年1月15日'
 */
export function formatDate(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'yyyy年M月d日', { locale: zhCN })
  } catch {
    return dateStr
  }
}

/**
 * 截断文本到指定长度，超出部分用省略号替代
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trimEnd() + '…'
}

/**
 * 将标签名称转换为 URL 安全的 slug
 */
export function tagToSlug(tag: string): string {
  return encodeURIComponent(tag.toLowerCase().replace(/\s+/g, '-'))
}

/**
 * 生成文章页面的完整 URL
 */
export function getPostUrl(slug: string, baseUrl = ''): string {
  return `${baseUrl}/blog/${slug}`
}

/**
 * 生成标签页面的完整 URL
 */
export function getTagUrl(tag: string, baseUrl = ''): string {
  return `${baseUrl}/tags/${tagToSlug(tag)}`
}

// ===== 目录（TOC）相关工具 =====

/** 目录条目类型 */
export interface TocItem {
  /** 标题级别（1~4） */
  level: number
  /** 原始标题文本 */
  text: string
  /** 与 rehype-slug 生成的 id 相同（小写 + 连字符） */
  id: string
}

/**
 * 从 Markdown/MDX 原始内容中提取标题列表
 * 支持 ATX 风格标题（# ~ ####），与 rehype-slug 生成的 id 保持一致
 */
export function extractToc(content: string): TocItem[] {
  const lines = content.split('\n')
  const items: TocItem[] = []

  for (const line of lines) {
    // 只匹配行首的 # 标记（ATX 风格，不含 Setext 样式）
    const match = line.match(/^(#{1,4})\s+(.+?)(?:\s*#{1,4})?\s*$/)
    if (!match) continue

    const level = match[1].length
    // 去除标题中的 Markdown 内联语法（粗体、链接、代码等）
    const rawText = match[2]
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/\*(.+?)\*/g, '$1')
      .replace(/`(.+?)`/g, '$1')
      .replace(/\[(.+?)\]\(.+?\)/g, '$1')
      .trim()

    // 生成与 rehype-slug 一致的 id（转小写，空格→连字符，移除特殊字符）
    const id = rawText
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\u4e00-\u9fa5-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')

    items.push({ level, text: rawText, id })
  }

  return items
}
