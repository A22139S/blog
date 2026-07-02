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
import { CodeCopyButton } from '@/components/CodeCopyButton'
import { ReadingProgress } from '@/components/ReadingProgress'
import ArticleDetail from '@/components/ArticleDetail'

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

/** 代码高亮配置（rehype-pretty-code + Shiki） */
const prettyCodeOptions = {
  theme: {
    dark: 'github-dark',
    light: 'github-light',
  },
  keepBackground: false,
  onVisitHighlightedLine(node: { properties: { className: string[] } }) {
    node.properties.className.push('highlighted')
  },
}

/** MDX 自定义组件映射 */
const mdxComponents = {
  // 可在此扩展自定义 MDX 组件
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const post = getPostBySlug(params.slug)
  if (!post) notFound()

  const { prev, next } = getAdjacentPosts(params.slug)

  // 从 Markdown 内容提取目录（服务端执行）
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

  const formattedDate = formatDate(post.date)

  return (
    <>
      {/* JSON-LD 结构化数据 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 全局 UI 组件 */}
      <ReadingProgress />
      <CodeCopyButton />

      {/* 统一文章详情布局 */}
      <ArticleDetail
        title={post.title}
        date={formattedDate}
        author={post.author}
        readingTime={post.readingTime}
        description={post.summary}
        tocItems={tocItems}
        breadcrumb={
          <nav className="flex items-center gap-2 text-sm" style={{ color: '#999' }}>
            <Link href="/" className="hover:underline" style={{ color: '#999' }}>
              首页
            </Link>
            <span>/</span>
            <Link href="/blog" className="hover:underline" style={{ color: '#999' }}>
              文章
            </Link>
            <span>/</span>
            <span className="truncate max-w-xs" style={{ color: '#666' }}>
              {post.title}
            </span>
          </nav>
        }
        headerExtra={
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <TagBadge key={tag} tag={tag} />
            ))}
          </div>
        }
        footerExtra={
          <div>
            {/* 底部标签（可点击链接） */}
            {post.tags.length > 0 && (
              <div className="mb-8 flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium" style={{ color: '#888' }}>
                  标签：
                </span>
                {post.tags.map((tag) => (
                  <TagBadge key={tag} tag={tag} />
                ))}
              </div>
            )}

            {/* 上一篇 / 下一篇 */}
            <nav className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {prev && (
                <Link
                  href={`/blog/${prev.slug}`}
                  className="group flex flex-col rounded-lg border p-4 transition-colors hover:border-gray-300"
                  style={{ borderColor: '#eee' }}
                >
                  <span className="mb-1 text-xs" style={{ color: '#999' }}>
                    ← 上一篇
                  </span>
                  <span
                    className="line-clamp-2 text-sm font-medium group-hover:underline"
                    style={{ color: '#555' }}
                  >
                    {prev.title}
                  </span>
                </Link>
              )}
              {next && (
                <Link
                  href={`/blog/${next.slug}`}
                  className="group flex flex-col rounded-lg border p-4 text-right transition-colors hover:border-gray-300 sm:col-start-2"
                  style={{ borderColor: '#eee' }}
                >
                  <span className="mb-1 text-xs" style={{ color: '#999' }}>
                    下一篇 →
                  </span>
                  <span
                    className="line-clamp-2 text-sm font-medium group-hover:underline"
                    style={{ color: '#555' }}
                  >
                    {next.title}
                  </span>
                </Link>
              )}
            </nav>
          </div>
        }
      >
        <MDXRemote
          source={post.content}
          components={mdxComponents}
          options={{
            mdxOptions: {
              remarkPlugins: [remarkGfm],
              rehypePlugins: [
                rehypeSlug,
                [
                  rehypeAutolinkHeadings,
                  { behavior: 'wrap', properties: { className: ['anchor'] } },
                ],
                [rehypePrettyCode as never, prettyCodeOptions],
              ],
            },
          }}
        />
      </ArticleDetail>
    </>
  )
}
