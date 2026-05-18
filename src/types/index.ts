/** 文章元数据类型定义 */
export interface PostMeta {
  /** 文章唯一标识（来自文件名） */
  slug: string
  /** 文章标题 */
  title: string
  /** 发布日期（ISO 8601 格式） */
  date: string
  /** 文章摘要 */
  summary: string
  /** 标签列表 */
  tags: string[]
  /** 封面图片路径（可选） */
  coverImage?: string
  /** 是否为草稿（草稿不在列表中显示） */
  draft?: boolean
  /** 作者名称 */
  author?: string
  /** 预估阅读时间（分钟） */
  readingTime?: number
}

/** 完整文章（含 MDX 内容） */
export interface Post extends PostMeta {
  /** MDX 渲染后的原始内容字符串 */
  content: string
}

/** 分页数据结构 */
export interface PaginationData {
  /** 当前页码（从 1 开始） */
  currentPage: number
  /** 总页数 */
  totalPages: number
  /** 总文章数 */
  totalPosts: number
  /** 每页文章数 */
  postsPerPage: number
  /** 是否有上一页 */
  hasPrevPage: boolean
  /** 是否有下一页 */
  hasNextPage: boolean
}

/** 标签统计 */
export interface TagCount {
  /** 标签名称 */
  tag: string
  /** 该标签下的文章数量 */
  count: number
}
