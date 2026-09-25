const { app, BrowserWindow, dialog, ipcMain, shell } = require("electron");
const fs = require("fs");
const path = require("path");

// All budget data lives in one JSON file, e.g.
// ~/Library/Application Support/Budget Tracker/budget-data.json on macOS.
const dataFile = () => path.join(app.getPath("userData"), "budget-data.json");

function readData() {
  try {
    return JSON.parse(fs.readFileSync(dataFile(), "utf8"));
  } catch {
    return {};
  }
}

// Write to a temp file then rename, so a crash mid-write can't corrupt the data.
function writeData(data) {
  const file = dataFile();
  const tmp = `${file}.tmp`;
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
  fs.renameSync(tmp, file);
}

ipcMain.on("store:load", (event) => { event.returnValue = readData(); });
ipcMain.on("store:save", (_event, data) => writeData(data));
ipcMain.on("store:clear", (event) => {
  writeData({});
  event.returnValue = true;
});
ipcMain.handle("store:reveal", () => shell.showItemInFolder(dataFile()));

ipcMain.handle("store:export", async (event) => {
  const date = new Date().toISOString().slice(0, 10);
  const { canceled, filePath } = await dialog.showSaveDialog(BrowserWindow.fromWebContents(event.sender), {
    title: "Export Budget Data",
    defaultPath: path.join(app.getPath("documents"), `budget-backup-${date}.json`),
    filters: [{ name: "JSON", extensions: ["json"] }],
  });
  if (canceled || !filePath) return { ok: false };
  fs.writeFileSync(filePath, JSON.stringify(readData(), null, 2));
  return { ok: true };
});

// A valid backup is an object of budget_* keys with string values, as written by the preload store.
function isValidBackup(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) return false;
  const keys = Object.keys(data);
  return keys.length > 0 && keys.every((k) => k.startsWith("budget_") && typeof data[k] === "string");
}

ipcMain.handle("store:import", async (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  const { canceled, filePaths } = await dialog.showOpenDialog(win, {
    title: "Import Budget Data",
    properties: ["openFile"],
    filters: [{ name: "JSON", extensions: ["json"] }],
  });
  if (canceled || !filePaths.length) return { ok: false };
  let data;
  try {
    data = JSON.parse(fs.readFileSync(filePaths[0], "utf8"));
  } catch {
    data = null;
  }
  if (!isValidBackup(data)) {
    await dialog.showMessageBox(win, { type: "error", message: "That file isn't a Budget Tracker backup." });
    return { ok: false };
  }
  const { response } = await dialog.showMessageBox(win, {
    type: "warning",
    buttons: ["Replace", "Cancel"],
    defaultId: 1,
    cancelId: 1,
    message: "Replace your current budget with this backup?",
    detail: "Your current data will be overwritten. Export it first if you want to keep a copy.",
  });
  if (response !== 0) return { ok: false };
  writeData(data);
  return { ok: true };
});

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 850,
    minWidth: 700,
    minHeight: 500,
    title: "Budget Tracker",
    backgroundColor: "#131825",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      sandbox: true,
    },
  });
  win.loadFile(path.join(__dirname, "..", "dist", "index.html"));
}

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
