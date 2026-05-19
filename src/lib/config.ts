/** 站点全局配置 */
export const siteConfig = {
  /** 站点名称 */
  name: '写博客不如早点睡',
  /** 站点副标题 */
  tagline: '博观而约取，厚积而薄发',
  /** 站点描述（用于 SEO） */
  description: '分享生活与技术学习的个人博客',
  /** 部署后的网站根 URL（不含尾部斜杠） */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://your-domain.com',
  /** 作者信息 */
  author: {
    name: '英年早睡',
    bio: '编程初学者 · 技术爱好者 · 终身学习者',
    avatar: '/images/avatar.png',
    email: '823196588@qq.com',
    github: 'https://github.com/A22139S',
  },
  /** 导航菜单项 */
  nav: [
    { label: '首页', href: '/' },
    { label: '博客', href: '/blog' },
    { label: '关于', href: '/about' },
  ],
  /** Open Graph 默认图片（用于社交媒体预览） */
  ogImage: '/images/og-default.png',
  /** 语言设置 */
  locale: 'zh-CN',
  /** 时区 */
  timezone: 'Asia/Shanghai',
  /** 访客统计（Microsoft Clarity） */
  analytics: {
    /** Clarity 项目 ID，从 https://clarity.microsoft.com 后台获取，留空则不加载统计脚本 */
    clarityId: 'wtgeeu6a0k',
  },
} as const

export type SiteConfig = typeof siteConfig
