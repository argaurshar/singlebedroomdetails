from pathlib import Path
import functools,http.server,threading,json,time,hashlib,io
import numpy as np
from PIL import Image
from playwright.sync_api import sync_playwright,expect
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'.test-artifacts/library';OUT.mkdir(exist_ok=True)
class Handler(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*a):pass
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Handler,directory=str(ROOT/'dist')))
threading.Thread(target=server.serve_forever,daemon=True).start();url=f'http://127.0.0.1:{server.server_port}/library.html'
checks=[];captures=[];ids=['bedside','console','desk','coffee','bookcase','lamp','mirror']
def passed(s):checks.append(s);print('PASS',s,flush=True)
def shot(q,name,full=False):
 path=OUT/(name+'.png');q.screenshot(path=str(path),full_page=full);captures.append(path.name)
def state(q):return q.evaluate('libraryState')
try:
 with sync_playwright() as p:
  b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
  q=b.new_page(viewport={'width':1440,'height':1100});errors=[];requests=[];q.on('pageerror',lambda e:errors.append(str(e)));q.on('request',lambda r:requests.append(r.url))
  q.goto(url+'?render');expect(q.locator('.preset-card')).to_have_count(7);shot(q,'desktop-gallery',True)
  q.locator('[data-filter="Decor"]').click();expect(q.locator('.preset-card')).to_have_count(2)
  q.locator('[data-filter="All"]').click();q.locator('#search').fill('lighting');expect(q.locator('.preset-card')).to_have_count(1);q.locator('#search').fill('no such object');expect(q.locator('#no-results')).to_be_visible();q.locator('#search').fill('')
  q.locator('[data-fav="desk"]').click();q.locator('[data-filter="Saved"]').click();expect(q.locator('.preset-card')).to_have_count(1);q.locator('[data-filter="All"]').click()
  passed('search, category filters, empty result and favourite collection')
  for id in ids:
   q.locator(f'[data-open="{id}"]').click();assert state(q)['id']==id
   for stage in range(7):
    q.locator(f'[data-chapter="{stage}"]').click();s=state(q);assert s['stage']==stage and not s['running'];assert s['stats']['forced']==0 and s['stats']['unseparated']==0
    q.locator('#reset').click();assert state(q)['time']==0
   refs={}
   for t in [0,9.9,14.9,19.9,24.9,29.9,36]:
    q.evaluate('(t)=>seek(t)',t);refs[t]=(q.locator('#scene').inner_html(),np.asarray(Image.open(io.BytesIO(q.locator('#scene').screenshot()))).astype(int))
   for t in [24.9,0,36,9.9,29.9,19.9,14.9]:
    q.evaluate('(t)=>seek(t)',t);assert q.locator('#scene').inner_html()==refs[t][0],(id,t,'SVG seek');pixels=np.asarray(Image.open(io.BytesIO(q.locator('#scene').screenshot()))).astype(int);assert np.max(abs(pixels-refs[t][1]))<=5,(id,t,'raster seek')
   q.evaluate('seek(0)');comps=q.evaluate('libraryAPI.model().components');q.locator('#component-select').select_option(comps[1]['id']);q.locator('#isolate').click();assert state(q)['isolated'];q.locator('#focus-part').click();q.locator('#clear-selection').click();assert not state(q)['isolated']
   part=q.evaluate('libraryAPI.model().parts[0].id');q.locator('#part-select').select_option(part);assert state(q)['selectedPart']==part;q.locator('#focus-part').click();q.locator('#reset').click()
   q.locator('#assembly-toggle').click();n=len(comps)
   for _ in range(n):q.locator('#assembly-next').click()
   assert state(q)['assembly']==n;assert q.locator('#assembly-caption').inner_text().startswith('Assembly complete');q.locator('#assembly-prev').click();assert state(q)['assembly']==n-1;q.locator('#reset').click()
   for view in ['front','side','plan','section']:
    q.locator(f'[data-view="{view}"]').click();assert state(q)['view']==view;assert q.locator('#technical svg').count()==1
   shot(q,f'{id}-section');q.locator('[data-view="3d"]').click();q.locator('#reset').click();shot(q,f'{id}-assembled')
   q.evaluate('seek(24.99)');shot(q,f'{id}-exploded');q.evaluate('seek(14.9)');shot(q,f'{id}-connection');q.locator('#back-library').click()
  passed('all seven presets: seven stages/reset, shuffled deterministic seek, selection/isolation/focus, assembly and four drawing views')
  q.evaluate("libraryAPI.open('bedside')");q.locator('#scene').focus();q.keyboard.press('ArrowRight');assert state(q)['orbit']==10;q.keyboard.press('+');assert state(q)['zoom']>1;q.keyboard.press('Home');assert state(q)['orbit']==0 and state(q)['zoom']==1
  q.locator('#travel').focus();q.keyboard.press('End');maximum=state(q)['travel'];assert maximum>0;q.locator('#gap').fill('50');q.locator('#gap').dispatch_event('input');assert state(q)['clearance']==50-maximum;assert 'INTERFERENCE' in q.locator('#clearance').inner_text();q.locator('#travel').press('Home');assert state(q)['travel']==0
  passed('keyboard orbit/zoom, travel limits and signed clearance')
  q.locator('[data-panel="design"]').click();q.locator('[name="width"]').fill('700');q.locator('#material').select_option('ply');q.locator('#apply-dimensions').click();q.wait_for_function('libraryReady && libraryState.config.width===700',timeout=30000);assert state(q)['config']['material']=='ply'
  natural=q.locator('#scene').screenshot();q.locator('[data-finish="sage"]').click();assert q.locator('#scene').screenshot()!=natural;shot(q,'edited-plywood-sage')
  q.evaluate("libraryAPI.rebuild({...libraryState.config,width:650});libraryAPI.rebuild({...libraryState.config,width:750})");q.wait_for_function('libraryReady && libraryState.config.width===750',timeout=30000)
  q.evaluate("libraryAPI.rebuild({...libraryState.config,width:700});libraryAPI.open('mirror')");q.wait_for_timeout(1500);assert state(q)['id']=='mirror' and not state(q)['busy']
  passed('local worker edits geometry/material, rapid request replacement and switching presets during a rebuild')
  q.locator('#save-design').click();q.locator('#design-name').fill('My teaching mirror');q.locator('#save-form [type="submit"]').click();q.locator('#back-library').click();expect(q.locator('[data-saved]')).to_have_count(1);q.reload();expect(q.locator('[data-saved]')).to_have_count(1);q.locator('[data-saved]').click();q.wait_for_function('libraryReady');assert state(q)['id']=='mirror'
  q.locator('[data-panel="export"]').click()
  for button,ext in [('export-svg','.svg'),('export-csv','.csv'),('export-json','.json')]:
   with q.expect_download() as download:q.locator('#'+button).click()
   d=download.value;assert d.suggested_filename.endswith(ext);d.save_as(str(OUT/d.suggested_filename));assert (OUT/d.suggested_filename).stat().st_size>100
  design=json.loads((OUT/'mirror-design.json').read_text());assert design['version']==1 and design['id']=='mirror'
  q.locator('#import-json').set_input_files({'name':'bad.json','mimeType':'application/json','buffer':b'{"version":7}'});expect(q.locator('#toast')).to_contain_text('Unsupported design version')
  q.locator('#import-json').set_input_files(str(OUT/'mirror-design.json'));q.wait_for_function('libraryReady && libraryState.id==="mirror"')
  q.locator('[data-panel="export"]').click()
  with q.expect_popup() as popup:q.locator('#print-sheet').click()
  sheet=popup.value;sheet.wait_for_load_state();assert sheet.locator('svg').count()==4;sheet.pdf(path=str(OUT/'mirror-study.pdf'),format='A4',print_background=True);sheet.screenshot(path=str(OUT/'mirror-sheet.png'),full_page=True);captures.append('mirror-sheet.png');sheet.close()
  passed('saved variation persistence, SVG/CSV/JSON downloads, validated import and real print-to-PDF')
  # Actual clock, not render mode: interrupted chapters, complete story and reset.
  q.goto(url+'#bedside');q.wait_for_function('libraryReady')
  for stage in range(7):
   q.locator(f'[data-chapter="{stage}"]').click();q.wait_for_function('libraryState.running && libraryState.time%5>.03');q.locator('#reset').click();assert state(q)['time']==0 and not state(q)['running']
  q.locator('#auto').click();q.wait_for_function('libraryState.time>.1');q.locator('#manual').click();t=state(q)['time'];q.wait_for_timeout(150);assert state(q)['time']==t
  q.locator('#reset').click();q.locator('#play').click();q.wait_for_function('!libraryState.running && libraryState.time===36',timeout=90000)
  passed('real-time seven chapter interruptions, reset in motion, mode switching and complete 36-second playback')
  q.emulate_media(reduced_motion='reduce')
  for id in ids:
   q.evaluate('(id)=>libraryAPI.open(id)',id)
   for stage in range(7):q.locator(f'[data-chapter="{stage}"]').click();assert state(q)['stage']==stage and not state(q)['running']
  q.locator('#motion-opt').click();q.locator('[data-chapter="0"]').click();q.wait_for_function('libraryState.running');q.locator('#motion-opt').click();assert not state(q)['running'];q.emulate_media(reduced_motion='no-preference')
  passed('49 reduced-motion chapter poses and reversible animation opt-in')
  q.goto(url+'?render');q.set_viewport_size({'width':390,'height':844});shot(q,'mobile-gallery',True)
  for id in ids:
   q.evaluate('(id)=>libraryAPI.open(id)',id);assert q.evaluate('document.documentElement.scrollWidth<=innerWidth')
   q.locator('#scene').scroll_into_view_if_needed();shot(q,id+'-mobile-assembled');q.evaluate('seek(24.99)');shot(q,id+'-mobile-exploded');q.evaluate('seek(14.9)');shot(q,id+'-mobile-connection')
   q.locator('[data-panel="design"]').click();assert q.locator('#apply-dimensions').bounding_box()['height']>=44
  passed('mobile layout, all seven assembled/exploded/connection captures and usable primary controls')
  assert not errors,errors
  assert all(r.startswith(url.split('/library')[0]) or r.startswith(('blob:','data:','about:')) for r in requests),requests
  ids_on_page=q.evaluate('[...document.querySelectorAll("[id]")].map(e=>e.id)');assert len(ids_on_page)==len(set(ids_on_page)), 'duplicate DOM/SVG IDs'
  passed('no page errors, no runtime external requests and unique SVG identifiers')
  # Local storage may be blocked; studies remain usable.
  ctx=b.new_context();ctx.add_init_script("Storage.prototype.setItem=function(){throw Error('blocked')};Storage.prototype.getItem=function(){throw Error('blocked')}")
  z=ctx.new_page();z.goto(url+'?render#desk');z.wait_for_function('libraryReady');z.locator('#favourite').click();expect(z.locator('#toast')).to_contain_text('Storage is unavailable');assert state(z)['id']=='desk';ctx.close();passed('blocked browser storage degrades to portable design export')
  b.close()

finally:
 server.shutdown();(OUT/'browser-results.json').write_text(json.dumps({'checks':checks,'captures':captures},indent=2))
print(f'{len(checks)} acceptance groups passed; {len(captures)} screenshots captured. Inspect them separately.',flush=True)
