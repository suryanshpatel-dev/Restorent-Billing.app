const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs   = require("fs");

// ── Data file path: AppData/RoyalKitchen/token_data.json ──
const DATA_DIR  = path.join(app.getPath("userData"), "RoyalKitchen");
const DATA_FILE = path.join(DATA_DIR, "token_data.json");

// Ensure folder exists
function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

// ── IPC: Load token data ──
ipcMain.handle("load-token", () => {
  try {
    ensureDir();
    if (!fs.existsSync(DATA_FILE)) return null;
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    return JSON.parse(raw);
  } catch (e) {
    console.error("load-token error:", e);
    return null;
  }
});

// ── IPC: Save token data ──
ipcMain.handle("save-token", (_, data) => {
  try {
    ensureDir();
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
    return true;
  } catch (e) {
    console.error("save-token error:", e);
    return false;
  }
});

// ── Create Window ──
function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: "Royal Kitchen — Billing Software",
    icon: path.join(__dirname, "assets", "icon.png"),
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Development: load Vite dev server
  // Production: load built index.html
  if (process.env.NODE_ENV === "development") {
    win.loadURL("http://localhost:5173");
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, "dist", "index.html"));
  }

  win.setMenuBarVisibility(false);
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
