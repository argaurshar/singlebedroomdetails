"""Measure real requestAnimationFrame playback, with no concurrent audit workload."""
from pathlib import Path
import json,time,statistics
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'.test-artifacts/cabinet'
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium');results=[]
 for width,height,throttle in [(1440,1100,1),(390,844,1),(390,844,4)]:
  q=b.new_page(viewport={'width':width,'height':height});q.goto('http://127.0.0.1:4174/cabinet.html');q.wait_for_function('cabinetState')
  session=q.context.new_cdp_session(q);session.send('Emulation.setCPUThrottlingRate',{'rate':throttle})
  q.evaluate('''()=>{window.frameDeltas=[];let last;function tick(t){if(cabinetState.running&&last)frameDeltas.push(t-last);last=t;requestAnimationFrame(tick)}requestAnimationFrame(tick)}''')
  # Run the turning chapter, then the denser runner/joinery chapters.
  for i in [0,2,3]:
   q.locator(f'[data-chapter="{i}"]').click();q.wait_for_function('cabinetState.running');q.wait_for_function('!cabinetState.running',timeout=90000)
  values=q.evaluate('frameDeltas');values.sort();result={'viewport':[width,height],'cpu_throttle':throttle,'frames':len(values),'median_ms':statistics.median(values),'p95_ms':values[int(len(values)*.95)],'over_50ms':sum(v>50 for v in values)};results.append(result);print(result,flush=True);q.close()
 b.close();(OUT/'performance-results.json').write_text(json.dumps(results,indent=2))
