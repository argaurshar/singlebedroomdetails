"""Targeted camera and replay regression against the packaged library.

Run after npm run build. A passing run captures browser-rendered images; visual
inspection of those files is a separate review step, not inferred from assertions.
"""
from pathlib import Path
import functools
import hashlib
import http.server
import io
import json
import math
import threading

import numpy as np
from PIL import Image, ImageDraw
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / '.test-artifacts' / 'animation-fix'
OUT.mkdir(parents=True, exist_ok=True)
PRESETS = ['bedside', 'console', 'desk', 'coffee', 'bookcase', 'lamp', 'mirror']
TIMES = [14.99, 15, 15.01, 17.49, 17.5, 17.51]


class Handler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


server = http.server.ThreadingHTTPServer(
    ('127.0.0.1', 0), functools.partial(Handler, directory=str(ROOT / 'dist')),
)
threading.Thread(target=server.serve_forever, daemon=True).start()
url = f'http://127.0.0.1:{server.server_port}/library.html'
results = {'buildSHA256': hashlib.sha256((ROOT / 'dist/library.html').read_bytes()).hexdigest(),
           'checks': [], 'captures': [], 'fullPageCaptures': [], 'playback': []}
errors = []


def passed(message):
    results['checks'].append(message)
    print('PASS', message, flush=True)


def capture(page, name):
    path = OUT / name
    payload = page.locator('#scene').screenshot(path=str(path))
    results['captures'].append(name)
    return np.asarray(Image.open(io.BytesIO(payload))).astype(int)


try:
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(
            executable_path='/usr/bin/chromium', args=['--no-sandbox'],
        )
        for width, height, layout in [(1440, 1100, 'desktop'), (390, 844, 'mobile')]:
            page = browser.new_page(viewport={'width': width, 'height': height}, device_scale_factor=1)
            page.on('pageerror', lambda error: errors.append(str(error)))
            page.goto(url + '?render')
            for preset in PRESETS:
                page.evaluate('(id) => libraryAPI.open(id)', preset)
                page.locator('#scene').scroll_into_view_if_needed()
                references = {}
                for instant in TIMES:
                    page.evaluate('(time) => seek(time)', instant)
                    name = f'{layout}-{preset}-{instant:.2f}.png'
                    pixels = capture(page, name)
                    references[instant] = (page.locator('#scene').inner_html(), pixels)
                    if preset in ['bedside', 'coffee', 'lamp'] and instant in [15, 17.5]:
                        name = f'{layout}-{preset}-{instant:.2f}-full.png'
                        page.screenshot(path=str(OUT / name), full_page=True)
                        results['fullPageCaptures'].append(name)
                    state = page.evaluate('libraryState')
                    assert state['stats']['forced'] == 0, (preset, instant, 'forced order')
                    assert state['stats']['unseparated'] == 0, (preset, instant, 'unseparated')
                for instant in [17.51, 15, 14.99, 17.49, 15.01, 17.5]:
                    page.evaluate('(time) => seek(time)', instant)
                    assert page.locator('#scene').inner_html() == references[instant][0], (layout, preset, instant, 'SVG replay differs')
                    pixels = np.asarray(Image.open(io.BytesIO(page.locator('#scene').screenshot()))).astype(int)
                    assert np.max(abs(pixels - references[instant][1])) <= 5, (layout, preset, instant, 'raster replay differs')
            passed(f'{layout}: all seven presets seek deterministically around both camera hand-offs')

            # Real requestAnimationFrame playback: do not use ?render or call seek
            # repeatedly while collecting frames. Keep the scene visible on mobile.
            page.goto(url)
            for preset in PRESETS:
                page.evaluate('(id) => libraryAPI.open(id)', preset)
                page.locator('#scene').scroll_into_view_if_needed()
                samples = page.evaluate('''() => new Promise((resolve, reject) => {
                  seek(14.7);
                  const samples = [], started = performance.now();
                  document.querySelector('#play').click();
                  function observe() {
                    const s = libraryState;
                    if (!samples.length || s.time !== samples.at(-1).time) {
                      samples.push({time:s.time, camera:s.camera.slice(),
                        forced:s.stats.forced, unseparated:s.stats.unseparated});
                    }
                    if (s.time >= 17.8) {
                      document.querySelector('#manual').click();
                      resolve(samples);
                    } else if (performance.now() - started > 45000) {
                      document.querySelector('#manual').click();
                      reject(Error('Actual playback did not cross the camera transitions'));
                    } else requestAnimationFrame(observe);
                  }
                  requestAnimationFrame(observe);
                })''')
                assert len(samples) > 30, (layout, preset, 'insufficient real frames')
                assert all(math.isfinite(v) for sample in samples for v in sample['camera'])
                assert all(not sample['forced'] and not sample['unseparated'] for sample in samples)
                crossings = []
                for boundary in [15, 17.5]:
                    previous, following = next((a, b) for a, b in zip(samples, samples[1:]) if a['time'] <= boundary < b['time'])
                    # Compare in the fixed 960-unit drawing viewport. The former
                    # 318-unit camera-origin jump exceeded this bound by hundreds
                    # of pixels; ordinary continuous movement remains permitted.
                    delta = max(abs(a-b) for a, b in zip(previous['camera'], following['camera']))
                    normalized = delta * 960 / min(previous['camera'][2], following['camera'][2])
                    assert normalized < 20, (layout, preset, boundary, 'camera jump', normalized)
                    crossings.append({'boundary':boundary, 'before':previous, 'after':following,
                                      'maximumNormalizedViewBoxDelta':normalized})
                results['playback'].append({'preset':preset, 'layout':layout, 'frames':len(samples), 'crossings':crossings})
            passed(f'{layout}: actual playback crosses 15s and 17.5s continuously for all seven presets')
            page.close()
        assert not errors, errors
        assert hashlib.sha256((ROOT / 'dist/library.html').read_bytes()).hexdigest() == results['buildSHA256'], 'Packaged app changed during browser validation'
        passed('no browser page errors')
        browser.close()

    # Unmodified screenshot pixels are tiled at a reduced display size for review.
    for layout in ['desktop', 'mobile']:
        cell_width, cell_height = (480, 310) if layout == 'desktop' else (390, 385)
        sheet = Image.new('RGB', (cell_width * 3, cell_height * 14), 'white')
        labels = ImageDraw.Draw(sheet)
        for preset_index, preset in enumerate(PRESETS):
            for handoff, instants in enumerate([TIMES[:3], TIMES[3:]]):
                for col, instant in enumerate(instants):
                    name = f'{layout}-{preset}-{instant:.2f}.png'
                    image = Image.open(OUT/name)
                    image.thumbnail((cell_width, cell_height-28))
                    x, y = col*cell_width, (preset_index*2+handoff)*cell_height
                    sheet.paste(image, (x, y+28))
                    labels.text((x+7,y+7), f'{preset} — {instant:.2f}s', fill='black')
        sheet.save(OUT/f'{layout}-camera-review.png')
finally:
    server.shutdown()
    results['pageErrors'] = errors
    (OUT/'camera-browser-results.json').write_text(json.dumps(results, indent=2))

print(f"{len(results['checks'])} targeted browser groups passed; {len(results['captures'])} screenshots captured.", flush=True)
