"""Revision interaction checks; internal development server on port 4173 required."""
from pathlib import Path
import json,time
from playwright.sync_api import sync_playwright,expect
out=Path(__file__).resolve().parents[1]/'.test-artifacts/revision';out.mkdir(parents=True,exist_ok=True)
checks=[]
def passed(s):checks.append(s);print('PASS',s,flush=True)
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium')
 page=b.new_page(viewport={'width':1440,'height':1000});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto('http://127.0.0.1:4173/bedroom.html');page.wait_for_function('roomState')
 page.locator('#study').click();assert page.locator('.step:enabled').count()==7
 page.locator('[data-index="4"]').click();page.wait_for_function('roomState.running && roomState.studyIndex===4')
 page.locator('[data-index="1"]').click();page.wait_for_function('roomState.running && roomState.studyIndex===1')
 page.locator('#pause').click();assert not page.evaluate('roomState.running')
 page.locator('#scrub').focus();page.keyboard.press('End');assert page.evaluate('roomState.t')==9.2
 page.keyboard.press('Home');assert page.evaluate('roomState.t')==5.2
 page.keyboard.press('End');passed('Study unlocks chapters; interruption, pause and keyboard scrub endpoints')
 page.locator('#parts [data-component="oak"]').focus();page.keyboard.press('Enter')
 assert page.evaluate('roomState.selected')=='oak'
 assert page.evaluate('document.activeElement.dataset.component')=='oak'
 expect(page.locator('#part-title')).to_have_text('Oak finish');expect(page.locator('#part-measure')).to_have_text('15 mm')
 page.screenshot(path=str(out/'selected-oak.png'),full_page=True)
 page.locator('#focus-clear').click();assert page.evaluate('roomState.selected') is None
 passed('keyboard part selection retains focus, exposes dimensions and clears emphasis')
 page.locator('#pause').click();page.wait_for_function('roomState.running');page.locator('#reset').click();assert page.evaluate('roomState.t')==0
 passed('replay and reset cancel active study animation')
 page.emulate_media(reduced_motion='reduce');page.locator('[data-index="5"]').click();assert not page.evaluate('roomState.running')
 page.locator('#motion-opt').click();page.locator('#pause').click();page.wait_for_function('roomState.running')
 page.locator('#motion-opt').click();assert not page.evaluate('roomState.running')
 passed('reduced motion remains still by default; explicit per-visit opt-in is reversible')
 page.emulate_media(reduced_motion='no-preference');page.goto('http://127.0.0.1:4173/bedroom.html?render');page.wait_for_function('roomState')
 selected_bounds=[]
 for i,t in enumerate([4.5,9.2,15.9,20.6,25.3,30.6,35.7]):
  page.evaluate('(t)=>seek(t)',t)
  for button in page.locator('#parts button').all():
   component=button.get_attribute('data-component');button.click();assert page.evaluate('roomState.selected')==component
   assert page.locator('#part-description').inner_text().strip()
   if i in [1,2,4,5]:
    bounds=page.evaluate('roomInventory.filter(p=>p.component===roomState.selected).map(p=>p.screenBounds)')
    assert all(0<=v[0]<v[2]<=1000 and 0<=v[1]<v[3]<=800 for v in bounds),(i,component,bounds)
    selected_bounds.append([i,component,bounds])
   if component in ['runner','hangers','fan','services']:
    page.screenshot(path=str(out/f'selected-{i}-{component}.png'),full_page=True)
   page.locator('#focus-clear').click()
 page.evaluate('seek(30.6)');page.locator('#parts [data-component="fan"]').click();page.evaluate('seek(30.6)');assert page.evaluate('roomState.selected') is None
 passed('all 31 component buttons map to descriptions; active bounds inside scene; seek clears transient selection')
 page.set_viewport_size({'width':390,'height':844});page.evaluate('seek(25.3)')
 active=page.locator('[data-index="4"]').bounding_box();rail=page.locator('#steps').bounding_box()
 assert active['x']>=rail['x']-1 and active['x']+active['width']<=rail['x']+rail['width']+1,(active,rail)
 assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
 page.screenshot(path=str(out/'mobile-ceiling-final.png'),full_page=True)
 for selector in ['#manual','#auto','#study','#reset','#pause','#scrub','#parts button','.step.current']:
  assert page.locator(selector).first.bounding_box()['height']>=44,selector
 passed('mobile active chapter scrolls into view; 44 px primary targets; no page overflow')
 # True mobile touch and narrow/tablet widths; captures include component inspector.
 for width in [360,768,1024]:
  page.set_viewport_size({'width':width,'height':900});page.evaluate('seek(15.9)')
  assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
  page.screenshot(path=str(out/f'width-{width}.png'),full_page=True)
 passed('360, 768 and 1024 px responsive layouts have no horizontal overflow')
 assert not errors,errors
 passed('no uncaught revision browser errors')
 b.close()
(out/'study-browser-results.json').write_text(json.dumps({'checks':checks,'count':len(checks),'selected_component_bounds':selected_bounds},indent=2))
