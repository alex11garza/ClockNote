const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  loadEntries: () => ipcRenderer.invoke('load-entries'),
  saveEntries: (entries) => ipcRenderer.invoke('save-entries', entries),
  getDataFilePath: () => ipcRenderer.invoke('get-data-file-path')
});
