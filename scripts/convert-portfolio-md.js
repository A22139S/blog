/**
 * 将 portfolio.md 转换为 HTML 并输出为 JSON 数据文件
 * 用法: node scripts/convert-portfolio-md.js
 */
const fs = require('fs')
const path = require('path')
const { marked } = require('marked')

// 配置 marked 支持 GFM 表格
marked.setOptions({
  gfm: true,
  breaks: false,
})

const mdPath = process.argv[2] || 'C:/Users/史竟诚/Desktop/工作/zhuangwei/zw/portfolio.md'
const outPath = path.resolve(__dirname, '../src/data/zhuangwei-inspection-content.json')

console.log(`Reading: ${mdPath}`)
let raw = fs.readFileSync(mdPath, 'utf-8')

// ---- 预处理 Mermaid 代码块，转为带标注的 HTML 容器 ----
// 将所有 ```mermaid ... ``` 替换为带 data-lang="mermaid" 的 <pre> 块
raw = raw.replace(/```mermaid\n([\s\S]*?)```/g, (_, code) => {
  // 转义 HTML 实体以免被 marked 二次处理
  const escaped = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  return (
    '<pre data-lang="mermaid" class="mermaid-diagram">' +
    escaped +
    '</pre>'
  )
})

// ---- 预处理 ASCII art 框图 ----
// 将 ``` 代码块（非 mermaid）保持为普通 pre
// marked 会自己处理 markdown 代码块

// ---- 转换 Markdown ----
let html = marked.parse(raw)

// ---- 后处理：添加 CSS 类 ----
// 给表格添加样式类
html = html.replace(/<table>/g, '<table class="data-table">')

// 给所有 pre > code (非 mermaid) 添加样式
html = html.replace(
  /<pre><code class="language-python">/g,
  '<pre class="code-block"><code class="language-python">'
)
html = html.replace(
  /<pre><code class="language-">/g,
  '<pre class="code-block"><code>'
)

// 写入输出文件
const outDir = path.dirname(outPath)
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true })
}

fs.writeFileSync(
  outPath,
  JSON.stringify({ html }, null, 2),
  'utf-8'
)

console.log(`Done! HTML content written to: ${outPath}`)
console.log(`HTML length: ${html.length} chars`)
