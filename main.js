const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs').promises;

let mainWindow;
const DATA_FILE = path.join(app.getPath('userData'), 'time-entries.json');

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    title: 'ClockNote',
    icon: path.join(__dirname, 'A_flat-style_digital_vector_icon_features_a_stopwa.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// IPC Handlers for CRUD operations
ipcMain.handle('load-entries', async () => {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      // File doesn't exist yet, return empty array
      return [];
    }
    throw error;
  }
});

ipcMain.handle('save-entries', async (event, entries) => {
  try {
    await fs.writeFile(DATA_FILE, JSON.stringify(entries, null, 2), 'utf8');
    return { success: true };
  } catch (error) {
    console.error('Error saving entries:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-data-file-path', () => {
  return DATA_FILE;
});
