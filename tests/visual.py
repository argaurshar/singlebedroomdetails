"""Dense deterministic motion review: no video export is claimed."""
from pathlib import Path
import json,io,time
import numpy as np
from PIL import Image,ImageDraw
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'.test-artifacts';OUT.mkdir(exist_ok=True)
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium')
 page=b.new_page(viewport={'width':1440,'height':1100},device_scale_factor=1)
 page.goto('http://127.0.0.1:4173/?render');page.wait_for_function("typeof window.seek === 'function'")
 scene_deltas=[];ui_deltas=[];previous=None;previous_ui=None;bounds=[];cpu=[];frames=[]
 for i in range(361):
  t=i/10
  result=page.evaluate('''t=>{const start=performance.now();seek(t);const svg=document.querySelector('#room-svg');const box=svg.getBBox();return {ms:performance.now()-start,cycles:roomState.depthCycles,box:[box.x,box.y,box.width,box.height],ext:roomState.extension,clearance:roomState.clearance,parts:roomInventory.length,invalid:svg.innerHTML.includes('NaN')||svg.innerHTML.includes('Infinity')}}''',t)
  assert not result['invalid'] and result['cycles']==0,(t,result)
  assert abs(result['ext']+result['clearance']-1500)<1e-8
  bounds.append(result['box']);cpu.append(result['ms'])
  shot=Image.open(io.BytesIO(page.locator('.figure-column').screenshot())).convert('RGB')
  # Use actual scene bounds: the revision adds a transport bar below the SVG.
  # A fixed crop would misclassify the chapter scrubber reset as a geometry jump.
  figure_box=page.locator('.figure-column').bounding_box();scene_box=page.locator('#scene').bounding_box()
  sx=scene_box['x']-figure_box['x'];sy=scene_box['y']-figure_box['y']
  full=np.asarray(shot.resize((400,320)),dtype=np.float32)
  arr=np.asarray(shot.crop((sx,sy,sx+scene_box['width'],sy+scene_box['height'])).resize((400,260)),dtype=np.float32)
  scene_deltas.append(0 if previous is None else float(np.abs(arr-previous).mean()))
  ui_deltas.append(0 if previous_ui is None else float(np.abs(full-previous_ui).mean()))
  previous,previous_ui=arr,full
  if i%30==0 or i==360:
   thumb=shot.copy();thumb.thumbnail((400,340));frames.append((t,thumb))
  # All dense frames retained locally, excluded from Git.
  shot.save(OUT/f'motion-{i:03}.png')
 flags=[]
 for i in range(2,360):
  for name,deltas in [('scene',scene_deltas),('whole-figure',ui_deltas)]:
   baseline=max(.06,(deltas[i-1]+deltas[i+1])/2)
   if deltas[i]>3*baseline:flags.append({'time':i/10,'region':name,'delta':deltas[i],'baseline':baseline})
 sheet=Image.new('RGB',(1600,4*380),'#f5f0e5');d=ImageDraw.Draw(sheet)
 for i,(t,img)in enumerate(frames):
  x=(i%4)*400;y=(i//4)*380;sheet.paste(img,(x,y+25));d.text((x+12,y+5),f'{t:.1f} seconds',fill='#283630')
 sheet.save(OUT/'motion-contact-sheet.png')
 report={'samples':361,'interval_seconds':.1,'range':[0,36],'depth_cycles':0,'nonfinite_geometry':0,'flags':flags,'scene_cpu_ms_median':float(np.median(cpu)),'scene_cpu_ms_p95':float(np.percentile(cpu,95)),'bounds_min':np.min(bounds,axis=0).tolist(),'bounds_max':np.max(bounds,axis=0).tolist()}
 (OUT/'motion-results.json').write_text(json.dumps(report,indent=2));print(json.dumps(report,indent=2),flush=True)
 b.close()
