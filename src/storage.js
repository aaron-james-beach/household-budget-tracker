// In the desktop app, data is saved to a JSON file via Electron (see electron/preload.cjs).
// In a regular browser (`npm run dev`), it falls back to localStorage.
const storage = window.budgetStore ?? {
  getItem: (key) => localStorage.getItem(key),
  setItem: (key, value) => localStorage.setItem(key, value),
  clear: () => localStorage.clear(),
  revealDataFile: null,
  exportData: null,
  importData: null,
};

export default storage;
