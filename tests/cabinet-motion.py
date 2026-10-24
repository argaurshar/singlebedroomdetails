"""Dense browser evidence, not a video export. Uses internal server on 4174."""
from pathlib import Path
from playwright.sync_api import sync_playwright
from PIL import Image,ImageDraw
import numpy as np,json,io,statistics
out=Path(__file__).resolve().parents[1]/'.test-artifacts/cabinet';out.mkdir(exist_ok=True)
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium');page=b.new_page(viewport={'width':1440,'height':1100});page.goto('http://127.0.0.1:4174/cabinet.html?render');page.wait_for_function('cabinetState');previous=None;deltas=[];cpu=[];captures=[]
 for i in range(361):
  t=i/10
  state=page.evaluate('t=>{let start=performance.now();seek(t);return {...cabinetState,totalMs:performance.now()-start}}',t)
  assert state['stats']['forced']==0 and state['stats']['unseparated']==0,(t,state['stats'])
  assert abs(state['extension']+state['clearance']-800)<1e-7
  cpu.append(state['totalMs']);data=page.locator('#cabinet-stage').screenshot();im=Image.open(io.BytesIO(data)).convert('RGB');arr=np.asarray(im.resize((480,320)),dtype=float)
  deltas.append(0 if previous is None else float(np.abs(arr-previous).mean()));previous=arr
  if i%15==0 or i in [49,99,149,199,249,299,359]:
   im.save(out/f'motion-{i:03}.png');thumb=im.copy();thumb.thumbnail((320,235));captures.append((t,thumb))
  if i==0:initial=data
  if i==360:assert initial==data,'assembled endpoint image differs'
 flags=[]
 for i in range(2,360):
  baseline=max(.08,(deltas[i-1]+deltas[i+1])/2)
  if deltas[i]>3*baseline:flags.append({'time':i/10,'delta':deltas[i],'baseline':baseline})
 sheet=Image.new('RGB',(1280,((len(captures)+3)//4)*265),'#eeeadf');d=ImageDraw.Draw(sheet)
 for i,(t,im)in enumerate(captures):x=i%4*320;y=i//4*265;sheet.paste(im,(x,y+25));d.text((x+7,y+7),f'{t:.1f} seconds',fill='#304536')
 sheet.save(out/'motion-contact.jpg',quality=88)
 result={'samples':361,'range':[0,36],'step':.1,'forced_depth_orders':0,'unseparated_pairs':0,'initial_final_pixels_identical':True,'flags':flags,'js_ms_median':statistics.median(cpu),'js_ms_p95':float(np.percentile(cpu,95))}
 (out/'motion-results.json').write_text(json.dumps(result,indent=2));print(json.dumps(result,indent=2),flush=True);b.close()
