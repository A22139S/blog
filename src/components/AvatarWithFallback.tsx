'use client'

import { useState } from 'react'

interface AvatarWithFallbackProps {
  /** 头像图片 URL */
  src: string
  /** 图片无法加载时显示的文字（如首字母） */
  fallback: string
  /** 作者名称，用于 alt 属性 */
  alt: string
}

/**
 * 头像组件（客户端组件）
 * 图片加载成功时显示图片，加载失败时显示首字母 fallback
 */
export function AvatarWithFallback({ src, fallback, alt }: AvatarWithFallbackProps) {
  const [imgError, setImgError] = useState(false)

  if (imgError || !src) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700 text-2xl font-bold text-white">
        {fallback}
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className="h-full w-full object-cover"
      onError={() => setImgError(true)}
    />
  )
}
