import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { MDXRemote } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import rehypePrettyCode from 'rehype-pretty-code'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import { getAllSlugs, getPostBySlug, getAdjacentPosts } from '@/lib/posts'
import { siteConfig } from '@/lib/config'
import { formatDate, extractToc } from '@/lib/utils'
import { TagBadge } from '@/components/TagBadge'
import { TableOfContents } from '@/components/TableOfContents'
import { CodeCopyButton } from '@/components/CodeCopyButton'
import { ReadingProgress, TocHighlighter } from '@/components/ReadingProgress'
import { FloatingToolbar } from '@/components/FloatingToolbar'

interface BlogPostPageProps {
  params: { slug: string }
}

/** 静态路由生成：为每篇文章预生成页面 */
export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }))
}

/** 动态 metadata：基于文章 frontmatter 生成 SEO 信息 */
export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const post = getPostBySlug(params.slug)
  if (!post) return {}

  const ogImage = post.coverImage ?? siteConfig.ogImage
  const postUrl = `${siteConfig.url}/blog/${post.slug}`

  return {
    title: post.title,
    description: post.summary,
    authors: [{ name: post.author ?? siteConfig.author.name }],
    keywords: post.tags,
    openGraph: {
      type: 'article',
      url: postUrl,
      title: post.title,
      description: post.summary,
      publishedTime: post.date,
      authors: [post.author ?? siteConfig.author.name],
      tags: post.tags,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.summary,
      images: [ogImage],
    },
    alternates: {
      canonical: postUrl,
    },
  }
}

/** 代码高亮配置（使用 rehype-pretty-code + shiki） */
const prettyCodeOptions = {
  theme: {
    dark: 'github-dark',
    light: 'github-light',
  },
  keepBackground: false,
  // 为代码块添加高亮行标记
  onVisitHighlightedLine(node: { properties: { className: string[] } }) {
    node.properties.className.push('highlighted')
  },
}

/** MDX 自定义组件映射 */
const mdxComponents = {
  // 可在此扩展自定义 MDX 组件
  // 例如：Callout, ImageCaption, CodeSandbox 等
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const post = getPostBySlug(params.slug)
  if (!post) notFound()

  const { prev, next } = getAdjacentPosts(params.slug)

  // 从 Markdown 内容提取目录（服务端执行，零客户端开销）
  const tocItems = extractToc(post.content)

  // 结构化数据（JSON-LD）
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.summary,
    datePublished: post.date,
    author: {
      '@type': 'Person',
      name: post.author ?? siteConfig.author.name,
    },
    url: `${siteConfig.url}/blog/${post.slug}`,
    image: post.coverImage ?? siteConfig.ogImage,
    keywords: post.tags.join(', '),
  }

  return (
    <>
      {/* 注入 JSON-LD 结构化数据 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 阅读进度条 + TOC 高亮 + 代码复制按钮 */}
      <ReadingProgress />
      <TocHighlighter />
      <CodeCopyButton />

      {/*
       * 外层容器：最宽 1280px，左右内边距
       * 内部采用 flex 布局：主内容区 + 右侧文章目录侧边栏
       */}
      <div className="container mx-auto max-w-screen-xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex gap-10">
          {/* ===== 主内容区域（最宽 800px） ===== */}
          <div className="min-w-0 flex-1 xl:max-w-3xl">
            {/* 面包屑导航 */}
            <nav className="mb-8 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Link href="/" className="hover:text-primary-600 dark:hover:text-primary-400">
                首页
              </Link>
              <span>/</span>
              <Link href="/blog" className="hover:text-primary-600 dark:hover:text-primary-400">
                文章
              </Link>
              <span>/</span>
              <span className="max-w-xs truncate text-gray-700 dark:text-gray-300">{post.title}</span>
            </nav>

            {/* 文章头部信息 */}
            <header className="mb-10">
              {/* 标签 */}
              <div className="mb-4 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <TagBadge key={tag} tag={tag} />
                ))}
              </div>

              {/* 标题 */}
              <h1 className="mb-6 text-3xl font-bold leading-tight tracking-tight text-gray-900 dark:text-gray-50 sm:text-4xl">
                {post.title}
              </h1>

              {/* 元信息行 */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <time dateTime={post.date}>{formatDate(post.date)}</time>
                {post.author && (
                  <>
                    <span>·</span>
                    <span>{post.author}</span>
                  </>
                )}
                {post.readingTime && (
                  <>
                    <span>·</span>
                    <span>约 {post.readingTime} 分钟阅读</span>
                  </>
                )}
                {tocItems.length > 0 && (
                  <>
                    <span>·</span>
                    <span>{tocItems.length} 个章节</span>
                  </>
                )}
              </div>

              {/* 摘要 */}
              {post.summary && (
                <p className="mt-6 rounded-lg border-l-4 border-primary-500 bg-primary-50 py-3 pl-4 pr-4 text-base leading-relaxed text-gray-700 dark:border-primary-400 dark:bg-primary-900/20 dark:text-gray-300">
                  {post.summary}
                </p>
              )}
            </header>

            {/* 文章正文（MDX 渲染） */}
            <article className="prose-custom">
              <MDXRemote
                source={post.content}
                components={mdxComponents}
                options={{
                  mdxOptions: {
                    remarkPlugins: [remarkGfm],
                    rehypePlugins: [
                      rehypeSlug,
                      [rehypeAutolinkHeadings, { behavior: 'wrap', properties: { className: ['anchor'] } }],
                      [rehypePrettyCode as never, prettyCodeOptions],
                    ],
                  },
                }}
              />
            </article>

            {/* 文章底部：标签 + 上下篇导航 */}
            <footer className="mt-12 border-t border-gray-200 pt-8 dark:border-gray-700">
              {/* 底部标签 */}
              <div className="mb-8 flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">标签：</span>
                {post.tags.map((tag) => (
                  <TagBadge key={tag} tag={tag} />
                ))}
              </div>

              {/* 上一篇 / 下一篇 */}
              <nav className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {prev && (
                  <Link
                    href={`/blog/${prev.slug}`}
                    className="group flex flex-col rounded-xl border border-gray-200 p-4 transition-colors hover:border-primary-300 dark:border-gray-700 dark:hover:border-primary-600"
                  >
                    <span className="mb-1 text-xs font-medium text-gray-400 dark:text-gray-500">
                      ← 上一篇
                    </span>
                    <span className="line-clamp-2 text-sm font-medium text-gray-700 group-hover:text-primary-600 dark:text-gray-300 dark:group-hover:text-primary-400">
                      {prev.title}
                    </span>
                  </Link>
                )}
                {next && (
                  <Link
                    href={`/blog/${next.slug}`}
                    className="group flex flex-col rounded-xl border border-gray-200 p-4 text-right transition-colors hover:border-primary-300 dark:border-gray-700 dark:hover:border-primary-600 sm:col-start-2"
                  >
                    <span className="mb-1 text-xs font-medium text-gray-400 dark:text-gray-500">
                      下一篇 →
                    </span>
                    <span className="line-clamp-2 text-sm font-medium text-gray-700 group-hover:text-primary-600 dark:text-gray-300 dark:group-hover:text-primary-400">
                      {next.title}
                    </span>
                  </Link>
                )}
              </nav>
            </footer>
          </div>

          {/* ===== 右侧文章目录侧边栏（仅大屏显示） ===== */}
          <aside className="hidden xl:block xl:w-64 shrink-0">
            <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
              <TableOfContents items={tocItems} />
            </div>
          </aside>
        </div>
      </div>
    </>
  )
}
