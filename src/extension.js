/**
 * @fileoverview Main entry point for the Activity Tracker extension
 * @author Activity Tracker Team
 * @version 0.0.1
 */

const vscode = require('vscode');
const Timer = require('./timer');
const ActivityManager = require('./activityManager');
const Diagram = require('./diagram');
const { registerCommands, isRunning, isPaused } = require('./commands');
const { createStatusBarItems, updateStatusBar } = require('./statusBar');

/**
 * Retrieves advanced configuration settings for the extension.
 * @returns {Object} Configuration object containing user preferences.
 */
function getAdvancedConfiguration() {
  const config = vscode.workspace.getConfiguration('activity-tracker');
  return {
    timerUpdateInterval: config.get('timerUpdateInterval', 15), // Default: 15 minutes
    timeFormat: config.get('timeFormat', '24h'), // Default: 24-hour format
    language: config.get('language', 'en'), // Default: English
  };
}

/**
 * Sends periodic notifications to remind the user that the timer is active.
 */
function startNotificationReminder() {
  const { timerUpdateInterval } = getAdvancedConfiguration();
  setInterval(
    () => {
      if (isRunning && !isPaused) {
        vscode.window.showInformationMessage(
          'The timer is still running. Keep up the good work!',
        );
      }
    },
    timerUpdateInterval * 60 * 1000,
  );
}

/**
 * Activation function called when the extension is activated
 * @param {vscode.ExtensionContext} context - The extension context provided by VS Code
 * @returns {void}
 */
function activate(context) {
  // Check if a workspace is open
  if (!vscode.workspace.workspaceFolders) {
    vscode.window.showWarningMessage(
      'Activity Tracker requires an open workspace.',
    );
    return;
  }

  const timer = new Timer();
  const activityManager = new ActivityManager();
  const diagram = new Diagram();

  // Create status bar items
  const statusBarItems = createStatusBarItems(context);

  /**
   * Updates the timer display in the status bar.
   * Calculates the elapsed time and formats it as HH:mm:ss.
   */
  function updateTimerDisplay() {
    if (isRunning && !isPaused) {
      const elapsed =
        timer.getDuration() +
        (new Date() - new Date(timer.getStartTime())) / 1000;
      const hours = Math.floor(elapsed / 3600);
      const minutes = Math.floor((elapsed % 3600) / 60);
      const seconds = Math.floor(elapsed % 60);
      statusBarItems.timerDisplay.text = `Timer: ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
  }

  // Register commands
  registerCommands(
    context,
    () => updateStatusBar(isRunning, isPaused, statusBarItems),
    updateTimerDisplay,
  );

  // Initialize button visibility
  updateStatusBar(isRunning, isPaused, statusBarItems);

  // Start notification reminders
  startNotificationReminder();
}

module.exports = {
  activate,
};
