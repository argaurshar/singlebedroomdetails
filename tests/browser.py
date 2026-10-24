"""Browser acceptance suite. Starts and closes its own local HTTP server."""
from pathlib import Path
import functools,http.server,threading,json,time,hashlib
from playwright.sync_api import sync_playwright,expect
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'.test-artifacts';OUT.mkdir(exist_ok=True)
class Handler(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*a): pass
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Handler,directory=str(ROOT/'dist')))
threading.Thread(target=server.serve_forever,daemon=True).start()
URL=f'http://127.0.0.1:{server.server_port}/'
results=[]
def passed(name): results.append(name);print('PASS',name,flush=True)
def state(page):return page.evaluate('window.roomState')
try:
 with sync_playwright() as p:
  browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True)
  ctx=browser.new_context(viewport={'width':1440,'height':1100})
  page=ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  requests=[];page.on('request',lambda r:requests.append(r.url))
  page.goto(URL);page.wait_for_function('window.roomState')
  assert state(page)['mode']=='manual' and state(page)['t']==0
  assert page.locator('.step:enabled').count()==1
  assert state(page)['partCount']>=140
  page.screenshot(path=str(OUT/'desktop-start.png'),full_page=True)
  passed('fresh Manual default; full room inventory; one next action')
  # Native key activation, running gate, reset and double-click protection.
  page.locator('.step').first.focus();page.keyboard.press('Enter')
  page.wait_for_function('roomState.running && roomState.t > 1')
  assert page.locator('.step:enabled').count()==0
  page.locator('.step').first.dispatch_event('click')
  assert state(page)['completed']==0
  page.locator('#reset').click();assert state(page)['t']==0 and not state(page)['running']
  passed('keyboard activation; repeated click gating; reset cancels motion')
  # Every stage executes in real time; reset during each one then complete it.
  ends=[4.5,9.2,15.9,20.6,25.3,30.6,35.7]
  for i,end in enumerate(ends):
   page.evaluate('(t)=>seek(t)',ends[i-1] if i else 0)
   page.locator(f'[data-index="{i}"]').click()
   page.wait_for_function('roomState.running')
   page.locator('#reset').click()
   assert state(page)['t']==0 and state(page)['extension']==0
   page.evaluate('(t)=>seek(t)',ends[i-1] if i else 0)
   page.locator(f'[data-index="{i}"]').click()
   page.wait_for_function('(n)=>!roomState.running && roomState.completed===n',arg=i+1,timeout=15000)
   assert abs(state(page)['t']-end)<1e-6
  passed('all seven real-time stages complete; reset during every stage')
  # Mode changes while running settle to a documented stage endpoint.
  page.locator('#reset').click();page.locator('#auto').click()
  page.wait_for_function('roomState.t>1.2');page.locator('#manual').click()
  assert state(page)['t']==4.5 and not state(page)['running']
  page.locator('#auto').click();assert state(page)['mode']=='auto'
  page.reload();page.wait_for_function('roomState');assert state(page)['mode']=='auto'
  page.locator('#manual').click();page.locator('#reset').click()
  passed('Auto→Manual stable endpoint; explicit Auto preference survives reload')
  # Explicit simulated document visibility exercises the pause/resume handler.
  page.evaluate("Object.defineProperty(document,'hidden',{configurable:true,get:()=>window.testHidden||false})")
  page.locator('.step').first.click();page.wait_for_function('roomState.running && roomState.t>1')
  page.evaluate("window.testHidden=true;document.dispatchEvent(new Event('visibilitychange'))")
  paused=state(page)['t'];time.sleep(.2);assert state(page)['t']==paused
  page.evaluate("window.testHidden=false;document.dispatchEvent(new Event('visibilitychange'))")
  page.wait_for_function('(t)=>roomState.t>t',arg=paused)
  page.locator('#reset').click()
  passed('simulated hidden-tab pause/resume does not jump forward')
  page.evaluate('seek(35.7)');page.locator('#auto').click()
  page.wait_for_function('roomState.t<.9 && roomState.running',timeout=5000)
  page.locator('#manual').click();page.locator('#reset').click()
  passed('Auto final hold and canonical loop restart')
  # Finish does not change physical state.
  before=state(page);page.get_by_role('button',name='Clay & walnut').click();after=state(page)
  assert after['finish']=='clay' and after['t']==before['t'] and after['area']==before['area']
  page.reload();page.wait_for_function('roomState');assert state(page)['finish']=='clay'
  page.get_by_role('button',name='Sage & oak').click()
  passed('finish recolouring and persistence preserve geometry')
  page.locator('#explore').click();assert state(page)['explore']
  for extension,expected in [(0,1500),(225,1275),(450,1050)]:
   page.locator('#extension').fill(str(extension));page.locator('#extension').dispatch_event('input')
   assert state(page)['clearance']==expected
  page.locator('#bed-gap').fill('200');page.locator('#bed-gap').dispatch_event('input')
  assert state(page)['clearance']==-250 and state(page)['collision']
  expect(page.locator('#collision')).to_contain_text('250')
  page.screenshot(path=str(OUT/'interference.png'),full_page=True)
  page.locator('#extension').focus();page.keyboard.press('Home');assert state(page)['extension']==0
  page.keyboard.press('End');assert state(page)['extension']==450
  page.locator('#return').click();assert not state(page)['explore'] and state(page)['t']==0 and state(page)['bedGap']==200
  page.locator('#reset').click();assert state(page)['bedGap']==1500
  passed('slider endpoints/intermediate, keyboard, negative clearance, Explore return/reset')
  page.emulate_media(reduced_motion='reduce');page.locator('.step').first.click()
  assert state(page)['completed']==1 and not state(page)['running']
  page.locator('#auto').click();time.sleep(.15);assert not state(page)['running']
  page.locator('#manual').click();page.locator('#reset').click()
  for i in range(7):page.locator(f'[data-index="{i}"]').click()
  assert state(page)['completed']==7
  passed('reduced motion: all stages instant; no endless Auto loop')
  page.emulate_media(reduced_motion='no-preference')
  # Storage access blocked by a browser initialization stub.
  broken=browser.new_context();broken.add_init_script("Object.defineProperty(window,'localStorage',{get(){throw new Error('unavailable')}})")
  bp=broken.new_page();bp.goto(URL);bp.wait_for_function('roomState');assert state(bp)['mode']=='manual';bp.get_by_role('button',name='Slate & ash').click();assert state(bp)['finish']=='blue';broken.close()
  passed('storage failure fallback remains interactive')
  page.goto(URL+'?render');page.wait_for_function("typeof window.seek === 'function'")
  reference={}
  times=[0,.9,2.7,4.5,7.2,9.2,12.9,15.9,18.6,20.6,23.3,25.3,28.3,30.6,33.5,35.7,36]
  for t in times:
   page.evaluate('(t)=>seek(t)',t)
   reference[t]=page.locator('#scene').inner_html()
  for t in list(reversed(times))+[12.9,0,30.6,4.5,12.9,36]:
   page.evaluate('(t)=>seek(t)',t);assert page.locator('#scene').inner_html()==reference[t]
  frozen=state(page)['t'];time.sleep(.2);assert state(page)['t']==frozen
  passed('canonical repeated/backward/shuffled seeks; render mode has no clock')
  # Render every stage start/middle/end at desktop and mobile, with zero depth cycles.
  starts=[.9,5.2,9.9,16.6,21.3,26,31.3]
  for width,height,label in [(1440,1100,'desktop'),(390,844,'mobile')]:
   page.set_viewport_size({'width':width,'height':height})
   for i,(a,b) in enumerate(zip(starts,ends)):
    for suffix,t in [('start',a),('mid',(a+b)/2),('end',b)]:
     page.evaluate('(t)=>seek(t)',t)
     assert state(page)['depthCycles']==0,(i,t)
     assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
     page.locator('.figure-column').screenshot(path=str(OUT/f'{label}-{i+1}-{suffix}.png'))
   page.screenshot(path=str(OUT/f'{label}-final.png'),full_page=True)
  passed('42 desktop/mobile stage screenshots; no horizontal overflow or ordering cycles')
  # Self-contained HTML works with every nonlocal request rejected.
  assert all(u.startswith(URL) for u in requests),requests
  passed('no required external requests')
  assert not errors,errors
  passed('no uncaught browser errors')
  browser.close()
finally:
 server.shutdown();server.server_close()
 (OUT/'browser-results.json').write_text(json.dumps({'passed':results,'count':len(results)},indent=2))
print(f'{len(results)} browser acceptance groups passed')
