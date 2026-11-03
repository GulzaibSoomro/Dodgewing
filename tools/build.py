#!/usr/bin/env python3
"""Build dist/dodgewing.html: one self-contained file (CSS, JS and sprites inlined).
Use it for hosting, offline play on a phone, or Capacitor. Run from anywhere: python3 tools/build.py"""
import base64, os, re
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
rd = lambda p: open(os.path.join(root, p), encoding='utf-8').read()
html = rd('index.html')
css = rd('css/style.css')
css = re.sub(r'url\("\.\./(assets/fonts/[\w\-\.]+)"\)', lambda m: 'url("data:font/ttf;base64,' + base64.b64encode(open(os.path.join(root, m.group(1)), 'rb').read()).decode() + '")', css)
html = html.replace('<link rel="stylesheet" href="css/style.css">', '<style>\n' + css + '\n</style>')
srcs = re.findall(r'<script src="([^"]+)"></script>', html)
js = '\n'.join(rd(s) for s in srcs)
def embed(m):
    path = os.path.join(root, m.group(1))
    return 'data:image/png;base64,' + base64.b64encode(open(path, 'rb').read()).decode()
js = re.sub(r'assets/planes/[\w\-]+\.png', lambda m: embed(re.match(r'(.*)', m.group(0))), js)
html = re.sub(r'(<script src="[^"]+"></script>\s*)+', lambda m: '<script>\n' + js + '\n</script>\n', html, count=1)
os.makedirs(os.path.join(root, 'dist'), exist_ok=True)
out = os.path.join(root, 'dist', 'dodgewing.html')
open(out, 'w', encoding='utf-8').write(html)
print('built', out, round(len(html) / 1024), 'KB')
