'use client'

import { usePathname } from 'next/navigation'
import { Header } from './Header'

/**
 * 条件导航栏
 * 首页（/）隐藏默认 Header（由 HeroSection 内部提供导航）
 * 其他页面正常显示
 */
export function ConditionalHeader() {
  const pathname = usePathname()

  // 首页不显示默认 Header
  if (pathname === '/') return null

  return <Header />
}
