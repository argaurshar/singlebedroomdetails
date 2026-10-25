from pathlib import Path
import functools,http.server,threading,json
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'.test-artifacts/library'
class Handler(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*a):pass
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Handler,directory=str(ROOT/'dist')));threading.Thread(target=server.serve_forever,daemon=True).start();url=f'http://127.0.0.1:{server.server_port}/library.html'
results=[]
try:
 with sync_playwright() as p:
  b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox']);q=b.new_page(viewport={'width':1440,'height':1100});cdp=q.context.new_cdp_session(q)
  for width,rate in [(1440,1),(390,4)]:
   q.set_viewport_size({'width':width,'height':1100 if width==1440 else 844});cdp.send('Emulation.setCPUThrottlingRate',{'rate':rate});q.goto(url+'#desk');q.wait_for_function('libraryReady');q.locator('#scene').scroll_into_view_if_needed();q.evaluate('document.querySelector("#auto").click()')
   measured=q.evaluate('''()=>new Promise(resolve=>{let times=[],work=[],last=0;function tick(now){if(last){times.push(now-last);work.push(libraryState.stats.ms)}last=now;if(times.length<120)requestAnimationFrame(tick);else{times.sort((a,b)=>a-b);work.sort((a,b)=>a-b);resolve({fps:1000/(times.reduce((a,b)=>a+b,0)/times.length),p95FrameMs:times[114],p95RenderMs:work[114],time:libraryState.time})}}requestAnimationFrame(tick)})''');results.append({'viewport':width,'CPUThrottle':rate,**measured});print(results[-1],flush=True)
  cdp.send('Emulation.setCPUThrottlingRate',{'rate':1});q.goto(url+'#desk');q.wait_for_function('libraryReady');q.locator('#scene').scroll_into_view_if_needed();q.evaluate('document.querySelector("#auto").click()');q.wait_for_function('libraryState.time>.2');q.evaluate('document.querySelector("footer").scrollIntoView()');q.wait_for_timeout(150);t=q.evaluate('libraryState.time');q.wait_for_timeout(500);assert q.evaluate('libraryState.time')==t;q.locator('#scene').scroll_into_view_if_needed();q.wait_for_function('(t)=>libraryState.time>t',arg=t);print('PASS offscreen pause/resume',flush=True)
  # Render mode stays stopped even after Auto is selected.
  q.goto(url+'?render#desk');q.wait_for_function('libraryReady');q.evaluate('document.querySelector("#auto").click()');q.wait_for_timeout(150);assert not q.evaluate('libraryState.running');print('PASS render-mode autonomous clock disabled',flush=True)
  (OUT/'performance.json').write_text(json.dumps({'measurements':results,'checks':['offscreen pause/resume','render-mode clock disabled']},indent=2));b.close()
finally:server.shutdown()
