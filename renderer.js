// Application state
let timeEntries = [];
let editingEntryId = null;

// Timer state
let timerRunning = false;
let timerStartTime = null;
let timerInterval = null;

// DOM elements
const entryForm = document.getElementById('entry-form');
const formTitle = document.getElementById('form-title');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');
const entriesTbody = document.getElementById('entries-tbody');
const totalEntriesSpan = document.getElementById('total-entries');
const totalHoursSpan = document.getElementById('total-hours');
const dataFilePathSpan = document.getElementById('data-file-path');

// Timer DOM elements
const timerBtn = document.getElementById('timer-btn');
const timerDisplay = document.getElementById('timer-display');
const timerStatus = document.getElementById('timer-status');

// Form inputs
const dateInput = document.getElementById('entry-date');
const startTimeInput = document.getElementById('entry-start-time');
const endTimeInput = document.getElementById('entry-end-time');
const durationInput = document.getElementById('entry-duration');
const descriptionInput = document.getElementById('entry-description');

// Initialize the app
async function init() {
  // Set default date to today
  dateInput.valueAsDate = new Date();

  // Load existing entries
  await loadEntries();

  // Load and restore timer state
  await loadTimerState();

  // Display data file path
  const dataPath = await window.electronAPI.getDataFilePath();
  dataFilePathSpan.textContent = dataPath;

  // Set up event listeners
  setupEventListeners();
}

// Set up all event listeners
function setupEventListeners() {
  entryForm.addEventListener('submit', handleFormSubmit);
  cancelBtn.addEventListener('click', cancelEdit);
  timerBtn.addEventListener('click', toggleTimer);

  // Auto-calculate duration when start/end times change
  startTimeInput.addEventListener('change', calculateDuration);
  endTimeInput.addEventListener('change', calculateDuration);

  // Clear auto-calculated duration if user manually enters one
  durationInput.addEventListener('input', () => {
    if (durationInput.value) {
      startTimeInput.removeEventListener('change', calculateDuration);
      endTimeInput.removeEventListener('change', calculateDuration);
    }
  });
}

// Calculate duration from start and end times
function calculateDuration() {
  const startTime = startTimeInput.value;
  const endTime = endTimeInput.value;

  if (startTime && endTime) {
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);

    let diffMs = end - start;

    // Handle case where end time is before start time (crossing midnight)
    if (diffMs < 0) {
      diffMs += 24 * 60 * 60 * 1000; // Add 24 hours
    }

    const diffHours = diffMs / (1000 * 60 * 60);
    durationInput.value = diffHours.toFixed(2);
  }
}

// Load entries from file
async function loadEntries() {
  try {
    timeEntries = await window.electronAPI.loadEntries();
    renderEntries();
    updateStats();
  } catch (error) {
    console.error('Error loading entries:', error);
    alert('Failed to load time entries: ' + error.message);
  }
}

// Save entries to file
async function saveEntries() {
  try {
    const result = await window.electronAPI.saveEntries(timeEntries);
    if (!result.success) {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error('Error saving entries:', error);
    alert('Failed to save time entries: ' + error.message);
  }
}

// Handle form submission (create or update)
async function handleFormSubmit(e) {
  e.preventDefault();

  const entry = {
    id: editingEntryId || Date.now().toString(),
    date: dateInput.value,
    startTime: startTimeInput.value || null,
    endTime: endTimeInput.value || null,
    duration: parseFloat(durationInput.value) || 0,
    description: descriptionInput.value.trim()
  };

  if (editingEntryId) {
    // Update existing entry
    const index = timeEntries.findIndex(e => e.id === editingEntryId);
    if (index !== -1) {
      timeEntries[index] = entry;
    }
  } else {
    // Add new entry
    timeEntries.push(entry);
  }

  // Sort entries by date (newest first)
  timeEntries.sort((a, b) => new Date(b.date) - new Date(a.date));

  await saveEntries();
  renderEntries();
  updateStats();
  resetForm();
}

// Render all entries in the table
function renderEntries() {
  if (timeEntries.length === 0) {
    entriesTbody.innerHTML = `
      <tr class="empty-state">
        <td colspan="6">No time entries yet. Add your first entry above!</td>
      </tr>
    `;
    return;
  }

  entriesTbody.innerHTML = timeEntries.map(entry => `
    <tr>
      <td>${formatDate(entry.date)}</td>
      <td>${entry.startTime || '-'}</td>
      <td>${entry.endTime || '-'}</td>
      <td>${entry.duration.toFixed(2)}</td>
      <td>${escapeHtml(entry.description)}</td>
      <td>
        <div class="action-buttons">
          <button class="btn btn-edit" onclick="editEntry('${entry.id}')">Edit</button>
          <button class="btn btn-delete" onclick="deleteEntry('${entry.id}')">Delete</button>
        </div>
      </td>
    </tr>
  `).join('');
}

// Edit an entry
function editEntry(id) {
  const entry = timeEntries.find(e => e.id === id);
  if (!entry) return;

  editingEntryId = id;

  // Populate form
  dateInput.value = entry.date;
  startTimeInput.value = entry.startTime || '';
  endTimeInput.value = entry.endTime || '';
  durationInput.value = entry.duration;
  descriptionInput.value = entry.description;

  // Update UI
  formTitle.textContent = 'Edit Time Entry';
  submitBtn.textContent = 'Update Entry';
  cancelBtn.style.display = 'inline-block';

  // Scroll to form
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Delete an entry
async function deleteEntry(id) {
  if (!confirm('Are you sure you want to delete this entry?')) {
    return;
  }

  timeEntries = timeEntries.filter(e => e.id !== id);
  await saveEntries();
  renderEntries();
  updateStats();
}

// Cancel editing
function cancelEdit() {
  resetForm();
}

// Reset the form
function resetForm() {
  editingEntryId = null;
  entryForm.reset();
  dateInput.valueAsDate = new Date();
  formTitle.textContent = 'Add Time Entry';
  submitBtn.textContent = 'Add Entry';
  cancelBtn.style.display = 'none';

  // Re-attach duration calculation listeners
  startTimeInput.addEventListener('change', calculateDuration);
  endTimeInput.addEventListener('change', calculateDuration);
}

// Update statistics
function updateStats() {
  const totalHours = timeEntries.reduce((sum, entry) => sum + entry.duration, 0);
  totalEntriesSpan.textContent = `${timeEntries.length} ${timeEntries.length === 1 ? 'entry' : 'entries'}`;
  totalHoursSpan.textContent = `${totalHours.toFixed(2)} hours`;
}

// Utility functions
function formatDate(dateString) {
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ===== TIMER FUNCTIONS =====

// Toggle timer on/off
function toggleTimer() {
  if (timerRunning) {
    stopTimer();
  } else {
    startTimer();
  }
}

// Start the timer
function startTimer() {
  timerRunning = true;
  timerStartTime = Date.now();

  // Update UI
  timerBtn.classList.add('running');
  timerBtn.querySelector('.timer-btn-icon').textContent = '■';
  timerBtn.querySelector('.timer-btn-text').textContent = 'Stop Timer';
  timerStatus.textContent = 'Timer running...';

  // Start updating display
  updateTimerDisplay();
  timerInterval = setInterval(updateTimerDisplay, 1000);

  // Save timer state
  saveTimerState();
}

// Stop the timer
function stopTimer() {
  if (!timerRunning) return;

  const endTime = Date.now();
  const elapsedMs = endTime - timerStartTime;
  const elapsedHours = elapsedMs / (1000 * 60 * 60);

  // Stop timer
  timerRunning = false;
  clearInterval(timerInterval);
  timerInterval = null;

  // Update UI
  timerBtn.classList.remove('running');
  timerBtn.querySelector('.timer-btn-icon').textContent = '▶';
  timerBtn.querySelector('.timer-btn-text').textContent = 'Start Timer';
  timerStatus.textContent = 'Ready to start';
  timerDisplay.textContent = '00:00:00';

  // Populate form with timer data
  populateFormFromTimer(timerStartTime, endTime, elapsedHours);

  // Clear timer state
  timerStartTime = null;
  saveTimerState();

  // Scroll to form
  window.scrollTo({ top: document.querySelector('.form-section').offsetTop - 20, behavior: 'smooth' });
}

// Update timer display
function updateTimerDisplay() {
  if (!timerRunning || !timerStartTime) return;

  const elapsedMs = Date.now() - timerStartTime;
  const hours = Math.floor(elapsedMs / (1000 * 60 * 60));
  const minutes = Math.floor((elapsedMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((elapsedMs % (1000 * 60)) / 1000);

  timerDisplay.textContent =
    `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Update status with start time
  const startTimeFormatted = new Date(timerStartTime).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
  timerStatus.textContent = `Started at ${startTimeFormatted}`;
}

// Populate form with timer data
function populateFormFromTimer(startTimeMs, endTimeMs, elapsedHours) {
  const startDate = new Date(startTimeMs);
  const endDate = new Date(endTimeMs);

  // Set date to the start date
  dateInput.value = startDate.toISOString().split('T')[0];

  // Set start and end times
  startTimeInput.value = startDate.toTimeString().slice(0, 5);
  endTimeInput.value = endDate.toTimeString().slice(0, 5);

  // Set duration
  durationInput.value = elapsedHours.toFixed(2);

  // Focus on description field
  descriptionInput.focus();
}

// Save timer state to localStorage
async function saveTimerState() {
  const timerState = {
    running: timerRunning,
    startTime: timerStartTime
  };

  try {
    // Use localStorage for timer state (persists across app restarts)
    localStorage.setItem('timerState', JSON.stringify(timerState));
  } catch (error) {
    console.error('Error saving timer state:', error);
  }
}

// Load timer state from localStorage
async function loadTimerState() {
  try {
    const savedState = localStorage.getItem('timerState');

    if (savedState) {
      const timerState = JSON.parse(savedState);

      if (timerState.running && timerState.startTime) {
        // Restore running timer
        timerRunning = true;
        timerStartTime = timerState.startTime;

        // Update UI
        timerBtn.classList.add('running');
        timerBtn.querySelector('.timer-btn-icon').textContent = '■';
        timerBtn.querySelector('.timer-btn-text').textContent = 'Stop Timer';

        // Start updating display
        updateTimerDisplay();
        timerInterval = setInterval(updateTimerDisplay, 1000);
      }
    }
  } catch (error) {
    console.error('Error loading timer state:', error);
  }
}

// Make functions globally available for onclick handlers
window.editEntry = editEntry;
window.deleteEntry = deleteEntry;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
