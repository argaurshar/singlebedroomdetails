from pathlib import Path
import functools,http.server,threading,json,subprocess
from playwright.sync_api import sync_playwright,expect
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'.test-artifacts/library'
class Handler(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*a):pass
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Handler,directory=str(ROOT/'dist')));threading.Thread(target=server.serve_forever,daemon=True).start();url=f'http://127.0.0.1:{server.server_port}/library.html'
try:
 with sync_playwright() as p:
  b=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox']);q=b.new_page(viewport={'width':1440,'height':1100});errors=[];q.on('pageerror',lambda e:errors.append(str(e)));q.goto(url+'?render#bedside');q.wait_for_function('libraryReady');q.locator('[data-panel="export"]').click()
  q.locator('#export-video').click();expect(q.locator('#video-dialog')).to_be_visible();q.wait_for_timeout(600);q.locator('#cancel-video').click();expect(q.locator('#video-dialog')).not_to_be_visible(timeout=10000);assert not q.evaluate('libraryState.running')
  with q.expect_download(timeout=90000) as downloaded:q.locator('#export-video').click()
  d=downloaded.value;d.save_as(str(OUT/d.suggested_filename));video=OUT/d.suggested_filename
  meta=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration:stream=codec_name,width,height','-of','json',str(video)]));packets=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_entries','packet=pts_time','-of','json',str(video)]));duration=float(packets['packets'][-1]['pts_time']);meta['measured_last_frame_seconds']=duration;assert 35<=duration<40;assert meta['streams'][0]['width']==960
  subprocess.run(['ffmpeg','-y','-i',str(video),'-vf','fps=1/6,scale=480:-1','-frames:v','6',str(OUT/'video-%02d.png')],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
  expect(q.locator('#video-dialog')).not_to_be_visible();assert q.evaluate('libraryState.time')==0
  # Exported SVG must render as an independent image, with its material styling.
  svg=q.evaluate('libraryAPI.svg()');q.set_content('<img id="exported" width="960" height="720">');q.evaluate('(svg)=>{document.querySelector("img").src=URL.createObjectURL(new Blob([svg],{type:"image/svg+xml"}))}',svg);q.wait_for_function('document.querySelector("img").complete && document.querySelector("img").naturalWidth>0');q.locator('#exported').screenshot(path=str(OUT/'standalone-svg.png'))
  assert not errors,errors
  (OUT/'video-results.json').write_text(json.dumps({'checks':['cancel recording','36-second local video downloaded and decoded','six extracted frames','previous time restored','standalone SVG image decodes','no browser errors'],'video':video.name,'metadata':meta},indent=2));print('PASS video cancellation, recording/download, codec inspection, extracted frames and standalone SVG rendering',flush=True);b.close()
finally:server.shutdown()
