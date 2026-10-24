"""Measure 120 live animation frame intervals in the drawer stage; server on 4173 required."""
from pathlib import Path
import json,statistics
from playwright.sync_api import sync_playwright
OUT=Path(__file__).resolve().parents[1]/'.test-artifacts';OUT.mkdir(exist_ok=True)
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium')
 page=browser.new_page(viewport={'width':1440,'height':1100})
 page.goto('http://127.0.0.1:4173/bedroom.html')
 page.evaluate('seek(9.2)')
 page.locator('[data-index="2"]').click()
 result=page.evaluate('''()=>new Promise(resolve=>{let times=[];function sample(t){times.push(t);if(times.length<121)requestAnimationFrame(sample);else resolve({elapsed:times.at(-1)-times[0],intervals:times.slice(1).map((x,i)=>x-times[i]),parts:roomState.partCount});}requestAnimationFrame(sample);})''')
 intervals=result.pop('intervals')
 result['median_frame_ms']=statistics.median(intervals)
 result['average_fps']=120000/result['elapsed']
 result['environment']='Headless system Chromium 154, Linux cloud runner, 1440x1100; no tablet hardware benchmark'
 (OUT/'performance.json').write_text(json.dumps(result,indent=2))
 print(json.dumps(result,indent=2));browser.close()
