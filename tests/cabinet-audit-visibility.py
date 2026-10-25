"""Check whether the full audit's flagged rail pieces contribute visible pixels.
Requires the full audit JSON and an internal HTTP server on 4174. This does not
suppress the audit warnings or prove all user-controlled orbit configurations.
"""
from pathlib import Path
from collections import defaultdict
from playwright.sync_api import sync_playwright
from PIL import Image,ImageChops
import json,io
root=Path(__file__).resolve().parents[1];out=root/'.test-artifacts/cabinet'
report=json.loads((out/'audit.json').read_text());groups=defaultdict(set)
for warning in report['orbit']['swaps']:groups[warning['at']].update([warning['a'],warning['b']])
results=[]
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium');q=b.new_page(viewport={'width':1440,'height':1100});q.goto('http://127.0.0.1:4174/cabinet.html?render');q.wait_for_function('cabinetState')
 for at,names in groups.items():
  q.evaluate("document.querySelectorAll('[data-name]').forEach(e=>e.style.removeProperty('visibility'))")
  family,value=at.split();value=float(value);q.evaluate('t=>seek(t)',value if family=='story' else 0)
  if family=='sweep':
   angle=value if value<=180 else value-360
   q.evaluate("a=>{const e=document.querySelector('#orbit');e.step='0.001';e.value=a;e.dispatchEvent(new Event('input'))}",angle)
   assert abs(q.evaluate('cabinetState.orbit')-angle)<1e-6
  before=q.locator('#cabinet-stage').screenshot()
  q.evaluate("names=>document.querySelectorAll('[data-name]').forEach(e=>{if(names.includes(e.dataset.name))e.style.visibility='hidden'})",list(names))
  after=q.locator('#cabinet-stage').screenshot();diff=ImageChops.difference(Image.open(io.BytesIO(before)).convert('RGB'),Image.open(io.BytesIO(after)).convert('RGB'));bbox=diff.getbbox();diff.save(out/('audit-diff-'+at.replace(' ','-')+'.png'));Image.open(io.BytesIO(before)).save(out/('audit-view-'+at.replace(' ','-')+'.png'));results.append({'at':at,'parts':sorted(names),'identical_with_parts_hidden':bbox is None,'difference_bounds':bbox,'changed_pixels':sum(px!=(0,0,0) for px in diff.getdata())});print(at,bbox,flush=True)
 b.close()
(out/'audit-visibility.json').write_text(json.dumps(results,indent=2)+'\n')
# Diagnostic only: visibility is evidence, not a pass criterion or warning suppression.
