/** 站点全局配置 */
export const siteConfig = {
  /** 站点名称 */
  name: '我的技术博客',
  /** 站点副标题 */
  tagline: '记录思考，分享成长',
  /** 站点描述（用于 SEO） */
  description: '一个专注于前端开发、系统架构与技术思考的个人博客，分享编程心得与实践经验。',
  /** 部署后的网站根 URL（不含尾部斜杠） */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://your-domain.com',
  /** 作者信息 */
  author: {
    name: '博客作者',
    bio: '全栈工程师 · 技术爱好者 · 终身学习者',
    avatar: '/images/avatar.png',
    email: 'hello@your-domain.com',
    github: 'https://github.com/your-username',
    twitter: 'https://twitter.com/your-username',
  },
  /** 导航菜单项 */
  nav: [
    { label: '首页', href: '/' },
    { label: '文章', href: '/blog' },
    { label: '关于', href: '/about' },
  ],
  /** Open Graph 默认图片（用于社交媒体预览） */
  ogImage: '/images/og-default.png',
  /** 语言设置 */
  locale: 'zh-CN',
  /** 时区 */
  timezone: 'Asia/Shanghai',
} as const

export type SiteConfig = typeof siteConfig
