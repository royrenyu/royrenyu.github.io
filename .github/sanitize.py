#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""把 platform 抓下来的页面清洗成干净的 index.html。"""

import re

SRC = 'page.raw.html'
DST = 'index.html'

s = open(SRC, encoding='utf-8', errors='replace').read()

# 1) 截掉 </html> 之后平台追加的内容（评论 iframe 等）
i = s.lower().rfind('</html>')
if i > 0:
    s = s[:i + 7]

# 2) 去掉 <head> 之后、<meta charset> 之前被塞入的埋点脚本
head = s.lower().find('<head>')
meta = s.lower().find('<meta charset')
if head > 0 and meta > head:
    gap = s[head + 6:meta]
    if gap.strip():
        s = s[:head + 6] + '\n' + s[meta:]

# 3) 去掉平台加的属性
for pat in (r'\s+data-inspector-id="[^"]*"',
            r'\s+data-src-ver="[^"]*"',
            r'\s+data-inspect-html="[^"]*"'):
    s = re.sub(pat, '', s)

open(DST, 'w', encoding='utf-8').write(s)

print('chars:', len(s))
print('has title:', '狼人杀' in s)
print('head scripts removed:', not re.search(r'<head>\s*<script', s, re.I))
print('tail iframe removed:', 'miaoda-html-comment' not in s)
print('closed html:', s.lower().rstrip().endswith('</html>'))

assert '狼人杀' in s, 'page content missing'
assert s.lower().rstrip().endswith('</html>'), 'not a complete html'
assert not re.search(r'<head>\s*<script', s, re.I), 'head injection remains'
