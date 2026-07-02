'use client'

import { useEffect, useRef } from 'react'
import hljs from 'highlight.js/lib/core'
import python from 'highlight.js/lib/languages/python'
import javascript from 'highlight.js/lib/languages/javascript'
import typescript from 'highlight.js/lib/languages/typescript'
import bash from 'highlight.js/lib/languages/bash'
import json from 'highlight.js/lib/languages/json'
import yaml from 'highlight.js/lib/languages/yaml'
import sql from 'highlight.js/lib/languages/sql'
import xml from 'highlight.js/lib/languages/xml'
import markdown from 'highlight.js/lib/languages/markdown'
import css from 'highlight.js/lib/languages/css'

import 'highlight.js/styles/github.css'

hljs.registerLanguage('python', python)
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('bash', bash)
hljs.registerLanguage('shell', bash)
hljs.registerLanguage('json', json)
hljs.registerLanguage('yaml', yaml)
hljs.registerLanguage('yml', yaml)
hljs.registerLanguage('sql', sql)
hljs.registerLanguage('xml', xml)
hljs.registerLanguage('html', xml)
hljs.registerLanguage('markdown', markdown)
hljs.registerLanguage('md', markdown)
hljs.registerLanguage('css', css)

export default function CodeHighlighter({ contentHtml }: { contentHtml?: string }) {
  const hasRun = useRef(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (hasRun.current || !containerRef.current) return
    hasRun.current = true

    const container = containerRef.current

    // 1. Syntax highlighting
    const codeBlocks = container.querySelectorAll('pre code')
    codeBlocks.forEach((block) => {
      block.removeAttribute('data-highlighted')
      block.className = block.className.replace(/hljs|language-\w+/g, '').trim()
      hljs.highlightElement(block as HTMLElement)
    })

    // 2. Add copy buttons
    const preBlocks = container.querySelectorAll('pre')
    preBlocks.forEach((pre) => {
      if (pre.querySelector('.code-copy-btn')) return
      // Wrap in .code-block-wrapper
      const wrapper = document.createElement('div')
      wrapper.className = 'code-block-wrapper'
      pre.parentNode?.insertBefore(wrapper, pre)
      wrapper.appendChild(pre)

      // Add header
      const header = document.createElement('div')
      header.className = 'code-block-header'
      const code = pre.querySelector('code')
      const langMatch = code?.className.match(/language-(\w+)/)
      const langLabel = document.createElement('span')
      langLabel.className = 'code-block-lang'
      langLabel.textContent = langMatch?.[1] || 'text'
      header.appendChild(langLabel)

      const btn = document.createElement('button')
      btn.className = 'code-copy-btn'
      btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg><span>复制</span>`
      btn.addEventListener('click', async () => {
        const text = pre.textContent || ''
        try {
          await navigator.clipboard.writeText(text)
          btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg><span>已复制</span>`
          btn.classList.add('copied')
          setTimeout(() => {
            btn.classList.remove('copied')
            btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg><span>复制</span>`
          }, 2000)
        } catch {
          btn.innerHTML = `<span>失败</span>`
          setTimeout(() => {
            btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg><span>复制</span>`
          }, 2000)
        }
      })
      header.appendChild(btn)
      wrapper.insertBefore(header, pre)
    })
  }, [])

  if (!contentHtml) return null

  return (
    <div
      ref={containerRef}
      dangerouslySetInnerHTML={{ __html: contentHtml }}
    />
  )
}
