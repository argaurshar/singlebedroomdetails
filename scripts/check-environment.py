"""Check tooling against an upstream example; does not build the room app."""
import functools
import hashlib
import http.server
import json
from pathlib import Path
import shutil
import subprocess
import tempfile
import threading
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]
SKILL = ROOT / '.agents/skills/anatomy'
for name in ('node', 'npm', 'python3', 'chromium', 'ffmpeg', 'ffprobe'):
    assert shutil.which(name), f'Missing tool: {name}'
manifest = json.loads((ROOT / 'docs/skill-files.sha256.json').read_text())
for relative, digest in manifest.items():
    assert hashlib.sha256((ROOT / relative).read_bytes()).hexdigest() == digest, relative
print(f'Skill integrity: {len(manifest)} files verified')
with tempfile.TemporaryDirectory(prefix='room-tool-check-') as temp:
    temp = Path(temp)
    shutil.copytree(SKILL, temp / 'anatomy')
    example = temp / 'anatomy/examples/dial-indicator'
    subprocess.run(['node', str(example / 'build.mjs'), '--light'], check=True)
    class Handler(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *args): pass
    server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Handler, directory=str(example)))
    threading.Thread(target=server.serve_forever, daemon=True).start()
    url = f'http://127.0.0.1:{server.server_port}/dial-indicator-light.html'
    try:
        subprocess.run(['node', str(SKILL / 'scripts/capture.mjs'), url, '--out', str(temp / 'desktop.png'), '--scale', '1', '--wait', '100', '--reduced'], check=True)
        with sync_playwright() as p:
            browser = p.chromium.launch(executable_path=shutil.which('chromium'), headless=True)
            try:
                page = browser.new_page(viewport={'width':390, 'height':844}, reduced_motion='reduce')
                errors = []
                page.on('pageerror', lambda e: errors.append(str(e)))
                assert page.goto(url).status == 200
                assert page.locator('svg').count() > 0
                assert page.evaluate("matchMedia('(prefers-reduced-motion: reduce)').matches")
                slider = page.get_by_role('slider')
                slider.focus()
                page.keyboard.press('End')
                expect(slider).to_have_attribute('aria-valuenow', '10')
                page.keyboard.press('Home')
                expect(slider).to_have_attribute('aria-valuenow', '18')
                assert not errors, errors
                page.screenshot(path=str(temp / 'mobile.png'))
                print('Browser rendering, keyboard interaction and reduced-motion emulation: PASS')
            finally: browser.close()
    finally:
        server.shutdown()
        server.server_close()
    video = temp / 'encoder.mp4'
    subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-f','lavfi','-i','color=c=white:s=320x240:r=60','-t','1','-c:v','libx264','-pix_fmt','yuv420p','-movflags','+faststart',str(video)],check=True)
    probe = json.loads(subprocess.check_output(['ffprobe','-v','error','-count_frames','-select_streams','v:0','-show_entries','stream=codec_name,width,height,pix_fmt,nb_read_frames:format=duration','-of','json',str(video)]))
    s = probe['streams'][0]
    assert (s['codec_name'],s['width'],s['height'],s['pix_fmt'],s['nb_read_frames']) == ('h264',320,240,'yuv420p','60')
    assert float(probe['format']['duration']) == 1
    print('H.264/yuv420p encoding: 60 frames, 1 second: PASS')
print('Tool checks passed. Room application and its acceptance tests remain unimplemented.')
