from pathlib import Path
import functools,http.server,threading,json,time,hashlib
from playwright.sync_api import sync_playwright,expect
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'.test-artifacts/cabinet';OUT.mkdir(exist_ok=True)
class Handler(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*a):pass
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Handler,directory=str(ROOT/'dist')))
threading.Thread(target=server.serve_forever,daemon=True).start();url=f'http://127.0.0.1:{server.server_port}/cabinet.html'
checks=[]
def passed(s):checks.append(s);print('PASS',s,flush=True)
try:
 with sync_playwright() as p:
  b=p.chromium.launch(executable_path='/usr/bin/chromium');page=b.new_page(viewport={'width':1440,'height':1100});errors=[];requests=[];page.on('pageerror',lambda e:errors.append(str(e)));page.on('request',lambda r:requests.append(r.url));page.goto(url);page.wait_for_function('cabinetState');assert page.evaluate('cabinetState.parts')==69
  page.locator('[data-chapter="0"]').focus();page.keyboard.press('Enter');page.wait_for_function('cabinetState.running && cabinetState.time>.1');page.locator('#reset').click();assert page.evaluate('cabinetState.time')==0
  passed('initial model, keyboard start and reset during motion')
  for i in range(7):
   page.locator(f'[data-chapter="{i}"]').click();page.wait_for_function('cabinetState.running');page.locator('#reset').click();assert page.evaluate('cabinetState.time')==0
   page.locator(f'[data-chapter="{i}"]').click();page.wait_for_function('!cabinetState.running',timeout=20000);assert page.evaluate('cabinetState.index')==i
  passed('all seven real-time chapters complete and retain their active caption; reset during each')
  page.locator('#auto').click();page.wait_for_function('cabinetState.running');page.locator('#manual').click();t=page.evaluate('cabinetState.time');time.sleep(.15);assert page.evaluate('cabinetState.time')==t
  page.locator('[data-chapter="4"]').click();page.locator('[data-chapter="1"]').click();assert page.evaluate('cabinetState.index')==1;page.locator('#manual').click()
  passed('Auto/Manual pause and direct chapter interruption')
  page.evaluate('seek(14.9)')
  for e in [0,160,320]:
   page.locator('#extension').fill(str(e));page.locator('#extension').dispatch_event('input');assert page.evaluate('cabinetState.extension')==e;assert page.evaluate('cabinetState.clearance')==800-e
  page.locator('#extension').focus();page.keyboard.press('Home');assert page.evaluate('cabinetState.extension')==0;page.keyboard.press('End');assert page.evaluate('cabinetState.extension')==320
  passed('interactive drawer endpoints, half stroke and keyboard all agree with clearance model')
  page.locator('summary').click();page.locator('#orbit').focus();page.keyboard.press('End');assert page.evaluate('cabinetState.orbit')==180
  page.locator('#home-view').click();assert page.evaluate('cabinetState.orbit')==0
  box=page.locator('#cabinet-stage').bounding_box();page.mouse.move(box['x']+box['width']/2,box['y']+box['height']/2);page.mouse.down();page.mouse.move(box['x']+box['width']/2+70,box['y']+box['height']/2,steps=8);page.mouse.up();assert page.evaluate('cabinetState.orbit')>20
  page.locator('[data-finish="sage"]').click();assert page.evaluate('cabinetState.finish')=='sage';page.reload();page.wait_for_function('cabinetState');assert page.evaluate('cabinetState.finish')=='sage';page.locator('[data-finish="walnut"]').click()
  passed('keyboard/pointer orbit, reset view, material changes and persistence')
  page.emulate_media(reduced_motion='reduce')
  for i in range(7):page.locator(f'[data-chapter="{i}"]').click();assert not page.evaluate('cabinetState.running');assert page.evaluate('cabinetState.index')==i
  page.locator('#motion').click();page.locator('[data-chapter="1"]').click();page.wait_for_function('cabinetState.running');page.locator('#motion').click();assert not page.evaluate('cabinetState.running');page.emulate_media(reduced_motion='no-preference')
  passed('all reduced-motion still poses and reversible explicit animation opt-in')
  page.goto(url+'?render');page.wait_for_function('cabinetState');states={}
  for t in [0,5,9.8,14.8,19.8,24.8,29.8,36]:
   page.evaluate('(t)=>seek(t)',t);states[t]=page.locator('#cabinet-stage').screenshot()
  for t in [36,14.8,0,29.8,5,19.8,24.8,9.8,0]:page.evaluate('(t)=>seek(t)',t);assert page.locator('#cabinet-stage').screenshot()==states[t]
  for t in [3,9,14,19,24,29,35]:
   page.evaluate('(t)=>seek(t)',t);page.locator('#reset').click();assert page.locator('#cabinet-stage').screenshot()==states[0]
  page.locator('#auto').click();time.sleep(.15);assert not page.evaluate('cabinetState.running')
  passed('forward/reverse/shuffled seek and render mode are deterministic')
  # Every stage at three times and four layout widths.
  for width in [1440,768,390,360]:
   page.set_viewport_size({'width':width,'height':1000 if width>500 else 844})
   for i in range(7):
    end=36 if i==6 else (i+1)*5-.001
    for tag,t in [('start',i*5),('mid',(i*5+end)/2),('end',end)]:
     page.evaluate('(t)=>seek(t)',t);assert page.evaluate('cabinetState.stats.forced===0 && cabinetState.stats.unseparated===0');assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
     if width in [1440,390]:page.screenshot(path=str(OUT/f'{width}-{i}-{tag}.png'),full_page=True)
   if width<500:
    for sel in ['#manual','#auto','.chapter','#play','#reset','#home-view']:assert page.locator(sel).first.bounding_box()['height']>=44,sel
  passed('42 desktop/mobile captures; 360/390/768/1440 layouts; 44 px primary touch controls')
  # A storage failure must not break the app.
  c=b.new_context();c.add_init_script("Object.defineProperty(window,'localStorage',{get(){throw Error('blocked')}})");q=c.new_page();q.goto(url);q.wait_for_function('cabinetState');q.locator('[data-finish="oak"]').click();assert q.evaluate('cabinetState.finish')=='oak';c.close()
  assert not errors,errors;assert all(r.startswith(url) for r in requests),requests
  passed('blocked storage fallback; no runtime external requests or browser errors')
  page.set_viewport_size({'width':1440,'height':1100});page.goto(url);page.wait_for_function('cabinetState');page.locator('#play').click();page.wait_for_function('cabinetState.time>.1')
  page.evaluate("()=>{const d=document.createElement('div');d.style.height='2400px';document.body.append(d);scrollTo(0,document.body.scrollHeight)}");time.sleep(.2);paused=page.evaluate('cabinetState.time');time.sleep(.2);assert page.evaluate('cabinetState.time')==paused
  page.evaluate('scrollTo(0,0)');page.wait_for_function('(t)=>cabinetState.time>t',arg=paused);assert page.evaluate('cabinetState.time')<paused+.25;page.locator('#reset').click();assert not errors,errors
  passed('offscreen playback pauses and resumes without a time jump')
  b.close()
finally:
 server.shutdown();server.server_close();(OUT/'browser-results.json').write_text(json.dumps({'passed':checks,'count':len(checks)},indent=2))
