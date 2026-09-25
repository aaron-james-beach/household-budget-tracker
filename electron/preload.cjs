const { contextBridge, ipcRenderer } = require("electron");

// Load once, synchronously, so the React app can read saved values during its first render.
let cache = ipcRenderer.sendSync("store:load");

contextBridge.exposeInMainWorld("budgetStore", {
  getItem: (key) => (key in cache ? cache[key] : null),
  setItem: (key, value) => {
    cache = { ...cache, [key]: String(value) };
    ipcRenderer.send("store:save", cache);
  },
  clear: () => {
    cache = {};
    ipcRenderer.sendSync("store:clear");
  },
  revealDataFile: () => ipcRenderer.invoke("store:reveal"),
  exportData: () => ipcRenderer.invoke("store:export"),
  // Resolves { ok: true } after the data file has been replaced; the page should reload.
  importData: () => ipcRenderer.invoke("store:import"),
});
