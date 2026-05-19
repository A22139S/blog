import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { siteConfig } from '@/lib/config'
import { ConditionalHeader } from '@/components/ConditionalHeader'
import { Footer } from '@/components/Footer'
import { ThemeProvider } from '@/components/ThemeProvider'

// 字体配置
const fontSans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const fontMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

/** 根布局全局 metadata */
export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: ['博客', '技术', '前端', 'Next.js', 'TypeScript', 'React'],
  authors: [{ name: siteConfig.author.name }],
  creator: siteConfig.author.name,
  openGraph: {
    type: 'website',
    locale: siteConfig.locale,
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: '@your_twitter',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // 在此填入 Google Search Console 验证码
    // google: 'your-google-verification-code',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang={siteConfig.locale}
      suppressHydrationWarning
      className={`${fontSans.variable} ${fontMono.variable}`}
    >
      <head>
        {/*
         * 主题初始化内联脚本
         * 在 HTML 解析阶段（DOM 可见之前）就运行，彻底避免浅色/深色闪烁（FOUC）。
         * dangerouslySetInnerHTML 是此场景的标准做法，字符串内容完全受控。
         */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');var p=window.matchMedia('(prefers-color-scheme: dark)').matches;if(t==='dark'||(t===null&&p)){document.documentElement.classList.add('dark');}else{document.documentElement.classList.remove('dark');}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-screen bg-white text-gray-900 antialiased dark:bg-gray-950 dark:text-gray-100 transition-colors duration-300">
        {/* 深色模式提供者（语义容器） */}
        <ThemeProvider>
          <div className="flex min-h-screen flex-col">
            <ConditionalHeader />
            {/* 主内容区域 */}
            <main className="flex-1 animate-fade-in">{children}</main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
