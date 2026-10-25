import { compilePreset } from "./geometry.mjs";
self.onmessage = ({ data }) => {
  try {
    self.postMessage({
      request: data.request,
      result: compilePreset(data.id, data.config),
    });
  } catch (e) {
    self.postMessage({ request: data.request, error: e.message });
  }
};
