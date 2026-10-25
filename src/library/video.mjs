// Render the current study to a local canvas. No screen sharing, microphone or server.
export function videoType() {
  if (!globalThis.MediaRecorder || !HTMLCanvasElement.prototype.captureStream)
    return null;
  return (
    ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/mp4"].find((t) =>
      MediaRecorder.isTypeSupported(t),
    ) || null
  );
}
export async function recordStory({
  name,
  dimensions,
  frame,
  progress,
  signal,
  duration = 36,
}) {
  const mime = videoType();
  if (!mime)
    throw Error(
      "Video recording is unavailable in this browser. SVG and PDF exports remain available.",
    );
  const canvas = document.createElement("canvas");
  canvas.width = 960;
  canvas.height = 800;
  const ctx = canvas.getContext("2d"),
    stream = canvas.captureStream(0),
    track = stream.getVideoTracks()[0],
    chunks = [];
  const recorder = new MediaRecorder(stream, {
    mimeType: mime,
    videoBitsPerSecond: 4500000,
  });
  let failed;
  const stopped = new Promise((resolve, reject) => {
    recorder.ondataavailable = (e) => {
      if (e.data.size) chunks.push(e.data);
    };
    recorder.onstop = resolve;
    recorder.onerror = (e) => {
      failed = e.error || Error("Video encoding failed");
      reject(failed);
    };
  });
  const image = new Image();
  let activeURL;
  async function paint(t) {
    const { svg, chapter } = frame(t);
    activeURL = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
    try {
      image.src = activeURL;
      await image.decode();
      ctx.fillStyle = "#f3f0e6";
      ctx.fillRect(0, 0, 960, 800);
      ctx.drawImage(image, 0, 60, 960, 720);
      ctx.fillStyle = "#274d3b";
      ctx.font = "26px Georgia";
      ctx.fillText(name, 28, 37);
      ctx.font = "13px Arial";
      ctx.fillText(chapter, 28, 65);
      ctx.fillText(dimensions + " · demonstration assumptions", 28, 780);
      ctx.textAlign = "right";
      ctx.fillText(t.toFixed(1) + " / " + duration + " s", 932, 780);
      ctx.textAlign = "left";
      track.requestFrame();
    } finally {
      URL.revokeObjectURL(activeURL);
      activeURL = null;
    }
  }
  try {
    await paint(0);
    if (signal.aborted) throw new DOMException("Cancelled", "AbortError");
    recorder.start(500);
    track.requestFrame();
    const start = performance.now();
    while (!signal.aborted) {
      const elapsed = Math.min(duration, (performance.now() - start) / 1000);
      await paint(elapsed);
      progress(elapsed / duration);
      if (elapsed >= duration) break;
      await new Promise((r) => setTimeout(r, 1000 / 24));
    }
    recorder.stop();
    await stopped;
    if (signal.aborted) throw new DOMException("Cancelled", "AbortError");
    if (failed) throw failed;
    return {
      blob: new Blob(chunks, { type: mime }),
      extension: mime.includes("mp4") ? "mp4" : "webm",
    };
  } finally {
    if (recorder.state !== "inactive") recorder.stop();
    stream.getTracks().forEach((t) => t.stop());
    if (activeURL) URL.revokeObjectURL(activeURL);
  }
}
