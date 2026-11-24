#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""把 platform 抓下来的页面清洗成干净的 index.html。

平台会在 <head> 后插入 base 与埋点脚本，并在 </html> 后追加评论 iframe。
这里用固定锚点重建文件头，并用正则清掉残留注入，不依赖索引偏移。
"""

import re

SRC = 'page.raw.html'
DST = 'index.html'

HEAD_TPL = '<!DOCTYPE html>\n<html lang="zh-CN">\n<head>\n'

s = open(SRC, encoding='utf-8', errors='replace').read()
print('raw chars:', len(s))

# 1) 截掉 </html> 之后平台追加的内容（评论 iframe 等）
i = s.lower().rfind('</html>')
if i > 0 and len(s) - (i + 7) > 2:
    print('tail trimmed:', len(s) - (i + 7))
    s = s[:i + 7]

# 2) 从 <meta charset> 开始保留正文，前面一律重建
m = re.search(r'(?is)<meta\s+charset', s)
if m and m.start() > 0:
    print('head rebuilt, dropped:', m.start())
    s = HEAD_TPL + s[m.start():]

# 3) 正则清掉残留注入
s = re.sub(r'<base\s+href="[^"]*"\s*/?>', '', s, flags=re.I)
s = re.sub(r'<script[^>]*src="[^"]*(?:ibytedapm|slardar)[^"]*"[^>]*>\s*</script>', '',
           s, flags=re.I | re.S)
s = re.sub(r'<script>(?:(?!</script>).)*?Slardar(?:(?!</script>).)*?</script>', '',
           s, flags=re.I | re.S)
s = re.sub(r'<script>(?:(?!</script>).)*?LogAnalytics(?:(?!</script>).)*?</script>', '',
           s, flags=re.I | re.S)
s = re.sub(r'<script[^>]*>\s*</script>', '', s, flags=re.I)

# 4) 清平台加的属性
for pat in (r'\s+data-inspector-id="[^"]*"',
            r'\s+data-src-ver="[^"]*"',
            r'\s+data-inspect-html="[^"]*"'):
    s = re.sub(pat, '', s)

open(DST, 'w', encoding='utf-8').write(s)

print('out chars:', len(s))
print('has title:', '\u72fc\u4eba\u6740' in s)
print('has slardar:', 'Slardar' in s)
print('has base tag:', '<base' in s.lower())
print('ends with html:', s.lower().rstrip().endswith('</html>'))
print('head ok:', s.startswith(HEAD_TPL))

assert '\u72fc\u4eba\u6740' in s, 'page content missing'
assert s.lower().rstrip().endswith('</html>'), 'not a complete html'
assert s.startswith(HEAD_TPL), 'head not rebuilt'
assert 'Slardar' not in s, 'tracking script remains'
assert 'ibytedapm' not in s, 'cdn tracking script remains'
