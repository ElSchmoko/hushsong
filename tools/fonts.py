# Cuts each font chunk down to the letters a language uses, and joins the chunks into one small woff2.
# python3 tools/fonts.py <chars.json> <out.json>   (called by tools/fonts.js)
import json, sys, os, glob, io, base64
from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.merge import Merger

def cut(files, text):
    parts = []
    want = set(ord(c) for c in text)
    for f in files:
        font = TTFont(f)
        have = set(font.getBestCmap().keys())
        if not (have & want):
            continue
        opts = subset.Options(); opts.flavor = None; opts.layout_features = ['*']; opts.name_IDs = ['*']; opts.notdef_outline = True
        s = subset.Subsetter(opts); s.populate(unicodes=sorted(have & want)); s.subset(font)
        tmp = io.BytesIO(); font.save(tmp); parts.append(tmp.getvalue())
    if not parts:
        return None, ''
    if len(parts) == 1:
        merged = TTFont(io.BytesIO(parts[0]))
    else:
        paths = []
        for i, p in enumerate(parts):
            path = f'/tmp/hsfont_{os.getpid()}_{i}.ttf'; open(path, 'wb').write(p); paths.append(path)
        # chunks of one font share metrics; merge them into one face
        merged = Merger().merge(paths)
        for p in paths: os.remove(p)
    cps = sorted(merged.getBestCmap().keys())
    merged.flavor = 'woff2'
    out = io.BytesIO(); merged.save(out)
    # unicode-range, so the face is only asked for the letters it has
    ranges, start, prev = [], None, None
    for c in cps:
        if start is None: start = prev = c
        elif c == prev + 1: prev = c
        else: ranges.append((start, prev)); start = prev = c
    if start is not None: ranges.append((start, prev))
    rng = ','.join(f'U+{a:X}' if a == b else f'U+{a:X}-{b:X}' for a, b in ranges)
    return base64.b64encode(out.getvalue()).decode(), rng

jobs = json.load(open(sys.argv[1]))
res = {}
for code, faces in jobs.items():
    res[code] = []
    for fam, weight, pattern, text in faces:
        files = sorted(glob.glob(pattern))
        b64, rng = cut(files, text)
        if b64:
            res[code].append([fam, weight, b64, rng])
            print(f'  {code} {fam} {weight}: {len(files)} files, {len(text)} letters -> {len(b64) * 3 // 4 // 1024} KB', file=sys.stderr)
json.dump(res, open(sys.argv[2], 'w'))
