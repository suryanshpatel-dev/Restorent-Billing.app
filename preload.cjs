const { contextBridge, ipcRenderer } = require("electron");

// Expose safe APIs to React (renderer process)
contextBridge.exposeInMainWorld("electronAPI", {
  loadToken: ()       => ipcRenderer.invoke("load-token"),
  saveToken: (data)   => ipcRenderer.invoke("save-token", data),
});
