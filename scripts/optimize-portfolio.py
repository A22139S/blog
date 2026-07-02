"""Apply stop-slop rules to portfolio.md, remove ASCII art, convert to clean HTML."""
import re
import json
import subprocess
import sys

# Read the markdown file
with open(r"C:\Users\史竟诚\Desktop\工作\zhuangwei\zw\portfolio.md", "r", encoding="utf-8") as f:
    text = f.read()

# ============================================================
# STEP 1: Remove ASCII art boxes (the ┌─ type character drawings)
# These are the UI mockups and technical stack boxes drawn with box-drawing chars.
# We KEEP Mermaid code blocks (```mermaid ... ```) as those render as diagrams.
# ============================================================

ASCII_ART_CHARS = set('┌└├│┐┘┤┬┴┼─')

def has_ascii_art(line):
    """Check if a line contains box-drawing characters."""
    return any(c in line for c in ASCII_ART_CHARS)

def remove_ascii_art(text):
    """Remove ALL box-drawing character art, including inside code fences.
    Replace code-fenced ASCII art with an HTML comment noting it was removed."""
    lines = text.split('\n')
    result = []
    in_code_fence = False
    fence_buffer = []  # Buffer lines within a code fence to check for ASCII art
    fence_lang = ''
    ascii_art_chars = set('┌└├│┐┘┤┬┴┼─')
    
    i = 0
    while i < len(lines):
        line = lines[i]
        stripped = line.strip()
        
        # Detect code fence start
        if stripped.startswith('```') and not in_code_fence:
            fence_lang = stripped[3:].strip()
            fence_buffer = [line]
            in_code_fence = True
            i += 1
            continue
        
        # Inside a code fence - collect lines
        if in_code_fence:
            if stripped.startswith('```'):  # End of fence
                fence_buffer.append(line)
                # Check if the fence contained ASCII art
                fence_text = '\n'.join(fence_buffer)
                has_aa = any(c in fence_text for c in ascii_art_chars)
                
                if has_aa:
                    # Replace ASCII art fences with a description
                    result.append(f'<!-- [ASCII diagram removed: {fence_lang}] -->')
                    result.append('')
                else:
                    result.extend(fence_buffer)
                
                fence_buffer = []
                in_code_fence = False
                i += 1
                continue
            else:
                fence_buffer.append(line)
                i += 1
                continue
        
        # Outside code fences - remove ASCII art lines
        if any(c in line for c in ascii_art_chars):
            box_count = sum(1 for c in line if c in ascii_art_chars)
            if box_count / max(len(stripped), 1) > 0.1:
                i += 1
                continue
        
        result.append(line)
        i += 1
    
    # Handle unclosed fence
    if fence_buffer:
        fence_text = '\n'.join(fence_buffer)
        if any(c in fence_text for c in ascii_art_chars):
            result.append('<!-- [ASCII diagram removed] -->')
        else:
            result.extend(fence_buffer)
    
    return '\n'.join(result)

# ============================================================
# STEP 2: Apply stop-slop rules
# ============================================================

# --- 2a: Remove em dashes ---
text = re.sub(r'—', ', ', text)
text = re.sub(r'–', '-', text)

# --- 2b: Binary contrast patterns ---
# "核心问题不是X，而是Y" → just Y
text = re.sub(
    r'核心问题不是["「].*?["」]，而是',
    '',
    text
)

# "这不是X，这是Y" / "这不是X，而是Y"
text = re.sub(
    r'这不是["「].*?["」](?:，而是|，这是)',
    '',
    text
)

# "不是X。是Y。" → "是Y。"
text = re.sub(
    r'不是["「][^"」]+["」][。，]\s*是',
    '是',
    text
)

# --- 2c: Filler phrases ---
filler_patterns = [
    (r'核心问题不是["「].*?["」](?:，而是|，)(.*?)(?:[。；])', r'\1。'),  # Remove negation half
    (r'这是区分["「](.*?)["」]和["「](.*?)["」]的关键[。！]?', r''),  # Binary comparison
    (r'不为了["「].*?["」]而过度设计', '避免过度设计'),
    (r'以下\s*\d+\s*个踩坑都是真实经历，每个都含["「].*?["」]完整闭环[。]?', ''),
    (r'换言之[,，]?\s*', ''),
    (r'简而言之[,，]?\s*', ''),
]

for pattern, replacement in filler_patterns:
    text = re.sub(pattern, replacement, text)

# --- 2d: Business jargon ---
jargon_map = {
    '全链路': '完整流程',
    '完全可追溯': '可追溯',
    '显著降低': '降低',
    '显著提升': '提升',
}

for old, new in jargon_map.items():
    text = text.replace(old, new)

# --- 2e: Adverbs to remove ---
adverbs = [
    '显然', '实际上', '本质上', '从根本上', '极其', '非常',
    '十分', '特别', '尤为', '尤为', '最关键的',
]
for adv in adverbs:
    text = re.sub(rf'{adv}[，,]?\s*', '', text)

# --- 2f: Vague declaratives ---
text = re.sub(r'这是\s*AI\s*Agent\s*\+\s*RAG\s*的最佳发力点[。]?', '', text)
text = re.sub(r'这是典型的["「].*?["」]的伪需求[。]?', '', text)

# --- 2g: Meta-commentary ---
text = re.sub(r'产品设计的思路是[：:]\s*先想清楚用户怎么用[，,]再决定\s*Agent\s*怎么编排[。]?\s*', '', text)

# --- 2h: Lazy extremes ---
text = re.sub(r'\b(全|所有|每个|任何)\s*环节', '关键环节', text)

# --- 2i: Passive voice fixes ---
text = re.sub(r'核心问题不是["「].*?["」](?:，而是|，)', '', text)

# --- 2j: "最佳发力点" type AI patterns ---
text = text.replace('最佳发力点', '适用场景')

# --- 2k: Remove quotable-style lines ---
text = re.sub(r'↑\s*\d+\s*倍', '', text)  # Remove dramatic up-arrow annotations
text = re.sub(r'↓\s*\d+%\s*\+\s*', '', text)

# --- 2l: Sentence-starting Wh- words in running text ---
# (Skip headings)

# ============================================================
# STEP 3: Remove ASCII art
# ============================================================
text = remove_ascii_art(text)

# ============================================================
# STEP 4: Remove HTML align attributes (inline HTML in markdown)
# ============================================================
text = re.sub(r'<p align="center">\s*', '', text)
text = re.sub(r'\s*</p>', '', text)
text = re.sub(r'<br>\s*', '\n\n', text)

# ============================================================
# STEP 5: Clean up orphaned empty <em>/<strong> or whitespace-only lines
# ============================================================
text = re.sub(r'\n\s*\n\s*\n\s*\n', '\n\n', text)
text = re.sub(r'^\s+$', '', text, flags=re.MULTILINE)

# ============================================================
# STEP 6: Fix "完整流程" in intro - remove the AI-flavored flowery subtitle
# ============================================================
# Make the subtitle more direct
text = text.replace(
    '<em>从施工服务质量检查业务痛点出发，完成「方案评估 → Agent 架构设计 → RAG 知识库 → 上线交付 → 成本闭环」完整流程</em>',
    '<em>面向 Agent 开发 / AI 产品经理岗位的实战项目</em>'
)

# Write cleaned markdown for inspection
cleaned_md_path = r"C:\Users\史竟诚\WorkBuddy\2026-05-18-task-4\blog-template\scripts\portfolio-cleaned.md"
with open(cleaned_md_path, "w", encoding="utf-8") as f:
    f.write(text)

# Convert to HTML using marked
result = subprocess.run(
    [
        r"C:\Users\史竟诚\.workbuddy\binaries\node\versions\22.22.2\node.exe",
        "-e",
        """
        const fs = require('fs');
        const marked = require('marked');
        const md = fs.readFileSync(process.argv[1], 'utf-8');
        const html = marked.parse(md, { gfm: true, breaks: false });
        const out = JSON.stringify({ html: html }, null, 2);
        fs.writeFileSync(process.argv[2], out, 'utf-8');
        """,
        cleaned_md_path,
        r"C:\Users\史竟诚\WorkBuddy\2026-05-18-task-4\blog-template\src\data\zhuangwei-inspection-content.json",
    ],
    capture_output=True,
    text=True,
    cwd=r"C:\Users\史竟诚\WorkBuddy\2026-05-18-task-4\blog-template",
)

if result.returncode != 0:
    print("ERROR:", result.stderr)
    sys.exit(1)

# Post-process: add IDs to h2/h3 headings for TOC navigation
import re as re2
with open(r"C:\Users\史竟诚\WorkBuddy\2026-05-18-task-4\blog-template\src\data\zhuangwei-inspection-content.json", "r", encoding="utf-8") as f:
    data = json.load(f)

html = data["html"]

def add_heading_ids(html_text):
    """Add id attributes to h2 and h3 tags based on text content."""
    def make_id(text):
        # Remove HTML tags and special chars, create URL-friendly ID
        clean = re2.sub(r'<[^>]+>', '', text)
        clean = re2.sub(r'[^\w\u4e00-\u9fff\s-]', '', clean)
        clean = re2.sub(r'\s+', '-', clean.strip())
        return clean.lower()
    
    def replacer(match):
        tag = match.group(1)
        attrs = match.group(2) or ''
        content = match.group(3)
        # Skip if already has an id
        if 'id=' in attrs:
            return match.group(0)
        hid = make_id(content)
        return f'<{tag}{attrs} id="{hid}">{content}</{tag}>'
    
    # Match h2 and h3 tags
    html_text = re2.sub(
        r'<(h[23])([^>]*)>(.*?)</\1>',
        replacer,
        html_text,
        flags=re2.DOTALL
    )
    return html_text

html = add_heading_ids(html)
data["html"] = html

with open(r"C:\Users\史竟诚\WorkBuddy\2026-05-18-task-4\blog-template\src\data\zhuangwei-inspection-content.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False)

print("OK: Content optimized and converted to HTML")
print(f"  Markdown: {cleaned_md_path}")
