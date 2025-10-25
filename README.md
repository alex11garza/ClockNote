# ClockNote - Time Tracker

A lightweight, offline time tracking application built with Electron. Track your work hours with a simple, modern interface - no account required, no internet needed.

## Features

- **Live Timer** - Start/stop a timer with one button click to track time in real-time
- **Timer Persistence** - Running timer survives app restarts
- **Auto-fill Form** - Timer automatically fills the form with times and duration
- **Create, Read, Update, Delete** time entries
- **Automatic duration calculation** from start and end times
- **Manual duration entry** for flexible time tracking
- **Persistent local storage** using JSON file
- **Modern, clean UI** with responsive design
- **Offline-first** - no internet connection required
- **Windows executable** - standalone application, no installation required

## Download & Installation

### For End Users (Just Want to Use the App)

1. Go to the [Releases](../../releases) page
2. Download **one** of the following files from the latest release:
   - **`ClockNote Setup X.X.X.exe`** - Installer version (recommended for most users)
     - Double-click to install the app on your computer
     - Creates a desktop shortcut and start menu entry
   - **`ClockNote X.X.X.exe`** - Portable version (no installation needed)
     - Just download and double-click to run
     - Perfect for running from a USB drive or without admin rights

3. **Windows may show a security warning** (this is normal for new applications):
   - Click "More info" → "Run anyway" to proceed

4. That's it! Your time tracking data is saved locally on your computer.

**Note:** This app works completely offline. Your data never leaves your computer.

## How to Use

### Using the Live Timer (Recommended)

1. Click the **"Start Timer"** button when you begin working
2. The timer will count up in real-time (HH:MM:SS format)
3. Work on your task
4. Click **"Stop Timer"** when finished
5. The form will automatically populate with:
   - Date and times (start/end)
   - Calculated duration
6. Add a description and click "Add Entry"

**Timer Features:**
- Timer continues running even if you close and reopen the app
- Live display updates every second
- Shows when the timer started
- Button changes color while running (red = active)

### Adding a Time Entry Manually

1. Select a date (defaults to today)
2. Enter a description of your work
3. **Option 1**: Enter start and end times - duration will be auto-calculated
4. **Option 2**: Manually enter duration in hours
5. Click "Add Entry"

### Editing an Entry

1. Click the "Edit" button on any entry in the table
2. Modify the fields as needed
3. Click "Update Entry"
4. Or click "Cancel" to discard changes

### Deleting an Entry

1. Click the "Delete" button on any entry
2. Confirm the deletion

### Time Tracking Tips

- Leave start/end times blank and just enter duration for flexible tracking
- Use decimal hours (e.g., 1.5 for 1 hour 30 minutes)
- Duration auto-calculates from times, but you can override it manually
- Entries are automatically sorted by date (newest first)

## Data Storage

All time entries are saved locally to:
- **Windows**: `%APPDATA%/time-tracker/time-entries.json`
- **macOS**: `~/Library/Application Support/time-tracker/time-entries.json`
- **Linux**: `~/.config/time-tracker/time-entries.json`

The exact path is displayed in the app footer.

## Frequently Asked Questions

**Q: Do I need an internet connection?**
A: No! ClockNote works completely offline. Your data is stored locally on your computer.

**Q: Do I need to create an account?**
A: No account needed. Just download and run the app.

**Q: Where is my data stored?**
A: All your time entries are saved in a JSON file on your local computer. The exact location is shown in the app footer.

**Q: Will my data sync across devices?**
A: No, this is a local-only app. Each device stores its own data. If you need to transfer data, you can manually copy the JSON file from the data storage location.

**Q: Why does Windows show a security warning?**
A: Windows SmartScreen shows warnings for new applications that haven't been widely downloaded yet. This is normal. Click "More info" → "Run anyway" to proceed.

**Q: Is my data safe?**
A: Yes! Your data never leaves your computer. It's stored locally in a JSON file that only you have access to.

**Q: Can I export my time entries?**
A: Currently, the app stores data in a JSON file. You can find this file in your app data directory (path shown in the app footer) and use it with other tools.

## For Developers

Want to build from source or contribute? Here's how:

### Prerequisites

- Node.js (v16 or higher)
- npm

### Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/TimeTracker.git
   cd TimeTracker
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Running in Development Mode

```bash
npm start
```

### Building Windows Executable

To build a Windows executable:
```bash
npm run build
```

This will create:
- An installer (`.exe`) in the `dist` folder
- A portable version that requires no installation

The executable will be found in `dist/ClockNote Setup X.X.X.exe`

#### Build Options

- **Windows only**: `npm run build`
- **All platforms**: `npm run build:all` (builds for Windows, Mac, and Linux)

### Project Structure

```
├── main.js         # Electron main process
├── preload.js      # Preload script for secure IPC
├── renderer.js     # Application logic
├── index.html      # UI structure
├── styles.css      # Styling
└── package.json    # Dependencies and build config
```

### Technical Stack

- **Framework**: Electron 28+
- **Storage**: Local JSON file
- **UI**: HTML5, CSS3, Vanilla JavaScript
- **Architecture**: Main process + Renderer process with IPC communication
- **Security**: Context isolation enabled, no node integration in renderer

## License

MIT
