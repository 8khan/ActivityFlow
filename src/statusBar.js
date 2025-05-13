const vscode = require('vscode');

/**
 * Creates and initializes status bar items for the activity tracker.
 * @param {vscode.ExtensionContext} context - The extension context provided by VS Code.
 * @returns {Object} An object containing the status bar items: startButton, pauseButton, stopButton, and timerDisplay.
 */
function createStatusBarItems(context) {
  const startButton = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
  startButton.command = 'activity-tracker.startTimer';
  startButton.text = '$(play)';
  startButton.tooltip = 'Start Activity Timer';
  startButton.color = '#28a745'; // Green
  context.subscriptions.push(startButton);

  const pauseButton = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 99);
  pauseButton.command = 'activity-tracker.pauseTimer';
  pauseButton.text = '$(pause)';
  pauseButton.tooltip = 'Pause Activity Timer';
  pauseButton.color = '#ffc107'; // Yellow
  context.subscriptions.push(pauseButton);

  const stopButton = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 98);
  stopButton.command = 'activity-tracker.stopTimer';
  stopButton.text = '$(stop)';
  stopButton.tooltip = 'Stop Activity Timer';
  stopButton.color = '#dc3545'; // Red
  context.subscriptions.push(stopButton);

  const timerDisplay = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 97);
  timerDisplay.text = 'Timer: 00:00:00';
  timerDisplay.tooltip = 'Elapsed Time';
  context.subscriptions.push(timerDisplay);

  return { startButton, pauseButton, stopButton, timerDisplay };
}

/**
 * Updates the visibility and state of the status bar items based on the timer's status.
 * @param {boolean} isRunning - Indicates whether the timer is currently running.
 * @param {boolean} isPaused - Indicates whether the timer is currently paused.
 * @param {Object} statusBarItems - An object containing the status bar items to update.
 */
function updateStatusBar(isRunning, isPaused, statusBarItems) {
  const { startButton, pauseButton, stopButton, timerDisplay } = statusBarItems;

  if (isRunning && !isPaused) {
    startButton.hide();
    pauseButton.show();
    stopButton.show();
    timerDisplay.show();
  } else if (isRunning && isPaused) {
    startButton.show();
    pauseButton.hide();
    stopButton.show();
    timerDisplay.show();
  } else {
    startButton.show();
    pauseButton.hide();
    stopButton.hide();
    timerDisplay.hide();
  }
}

module.exports = { createStatusBarItems, updateStatusBar };
