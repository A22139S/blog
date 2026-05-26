'use client'

import { useEffect, useCallback } from 'react'

/**
 * 代码块复制按钮
 * 为页面上所有 <pre> 元素（在 data-rehype-pretty-code-figure 内）
 * 注入复制按钮，点击后复制代码到剪贴板
 */
export function CodeCopyButton() {
  const handleCopy = useCallback(async (pre: HTMLPreElement, btn: HTMLButtonElement) => {
    const code = pre.querySelector('code')
    if (!code) return
    const text = code.textContent ?? ''
    try {
      await navigator.clipboard.writeText(text)
      btn.classList.add('copy-success')
      const span = btn.querySelector('span')
      if (span) span.textContent = '已复制'
      setTimeout(() => {
        btn.classList.remove('copy-success')
        if (span) span.textContent = '复制'
      }, 2000)
    } catch {
      // 降级方案
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      btn.classList.add('copy-success')
      const span = btn.querySelector('span')
      if (span) span.textContent = '已复制'
      setTimeout(() => {
        btn.classList.remove('copy-success')
        if (span) span.textContent = '复制'
      }, 2000)
    }
  }, [])

  useEffect(() => {
    const figures = document.querySelectorAll('[data-rehype-pretty-code-figure]')
    figures.forEach((figure) => {
      // 避免重复注入
      if (figure.querySelector('.code-copy-btn')) return

      const pre = figure.querySelector('pre')
      if (!pre) return

      // 创建复制按钮
      const btn = document.createElement('button')
      btn.className =
        'code-copy-btn absolute right-3 top-3 rounded-md bg-white/10 px-2 py-1' +
        ' opacity-0 transition-all duration-200 hover:bg-white/20' +
        ' text-xs font-medium text-gray-400 hover:text-white'
      btn.innerHTML =
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="inline-block mr-1"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg><span>复制</span>'
      btn.setAttribute('aria-label', '复制代码')
      btn.onclick = () => handleCopy(pre, btn)

      // 在 figure 上添加 hover 事件控制按钮显示
      figure.classList.add('relative')
      figure.appendChild(btn)

      // hover 时显示按钮
      figure.addEventListener('mouseenter', () => {
        btn.classList.remove('opacity-0')
      })
      figure.addEventListener('mouseleave', () => {
        btn.classList.add('opacity-0')
      })
    })
  }, [handleCopy])

  return null
}