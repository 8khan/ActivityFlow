const vscode = require('vscode');
const Timer = require('./timer');
const ActivityManager = require('./activityManager');
const Diagram = require('./diagram');
const { getLogsWebviewContent, getMermaidWebviewContent } = require('./webviewContent');

const timer = new Timer();
const activityManager = new ActivityManager();
const diagram = new Diagram();

let isRunning = false;
let isPaused = false;
let modifiedFiles = new Set();
let timerInterval = null;

/**
 * Starts the timer interval to update the timer display every second.
 * @param {Function} updateTimerDisplay - Callback function to update the timer display.
 */
function startTimerInterval(updateTimerDisplay) {
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(updateTimerDisplay, 1000);
}

/**
 * Stops the timer interval if it is running.
 */
function stopTimerInterval() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

/**
 * Registers all commands for the activity tracker extension.
 * @param {vscode.ExtensionContext} context - The extension context provided by VS Code.
 * @param {Function} updateStatusBar - Callback function to update the status bar items.
 * @param {Function} updateTimerDisplay - Callback function to update the timer display.
 */
function registerCommands(context, updateStatusBar, updateTimerDisplay) {
  /**
   * Command to start the activity timer.
   * Displays a message and updates the status bar and timer display.
   */
  context.subscriptions.push(vscode.commands.registerCommand('activity-tracker.startTimer', () => {
    if (!isRunning || isPaused) {
      timer.start();
      isRunning = true;
      isPaused = false;
      modifiedFiles.clear();
      vscode.window.showInformationMessage('Timer started.');
      startTimerInterval(updateTimerDisplay);
      updateStatusBar();
    } else {
      vscode.window.showWarningMessage('Timer is already running.');
    }
  }));

  /**
   * Command to pause the activity timer.
   * Displays a message and updates the status bar.
   */
  context.subscriptions.push(vscode.commands.registerCommand('activity-tracker.pauseTimer', () => {
    if (isRunning && !isPaused) {
      timer.pause();
      isPaused = true;
      vscode.window.showInformationMessage('Timer paused.');
      stopTimerInterval();
      updateStatusBar();
    } else {
      vscode.window.showWarningMessage('Timer is not running or already paused.');
    }
  }));

  /**
   * Command to stop the activity timer and log the activity.
   * Prompts the user for a description and whether to include modified files.
   */
  context.subscriptions.push(vscode.commands.registerCommand('activity-tracker.stopTimer', async () => {
    if (isRunning) {
      timer.stop();
      isRunning = false;
      isPaused = false;
      stopTimerInterval();

      const description = await vscode.window.showInputBox({
        prompt: 'Enter a description for this activity',
        placeHolder: 'E.g., Implemented login feature'
      });

      const includeFiles = await vscode.window.showQuickPick(['Yes', 'No'], {
        placeHolder: 'Include modified files in the log?'
      }) === 'Yes';

      const activity = {
        id: Date.now().toString(),
        startTime: timer.getStartTime(),
        endTime: timer.getEndTime(),
        duration: timer.getDuration(),
        description: description || 'No description provided',
        filesModified: includeFiles ? Array.from(modifiedFiles) : [],
      };

      activityManager.addActivity(activity);
      modifiedFiles.clear();
      vscode.window.showInformationMessage('Activity logged.');
      updateStatusBar();
    } else {
      vscode.window.showWarningMessage('Timer is not running.');
    }
  }));

  /**
   * Command to view activity logs in a webview panel.
   * Displays a list of logged activities.
   */
  context.subscriptions.push(vscode.commands.registerCommand('activity-tracker.viewLogs', async () => {
    try {
      const activities = await activityManager.getActivities();
      const panel = vscode.window.createWebviewPanel(
        'activityLogs',
        'Activity Logs',
        vscode.ViewColumn.One,
        {}
      );
      panel.webview.html = getLogsWebviewContent(activities);
    } catch (error) {
      vscode.window.showErrorMessage('Failed to load activity logs.');
    }
  }));

  /**
   * Command to show an activity diagram in a webview panel.
   * Generates a Mermaid.js diagram based on logged activities.
   */
  context.subscriptions.push(vscode.commands.registerCommand('activity-tracker.showDiagram', async () => {
    try {
      const activities = await activityManager.getActivities();
      const mermaidCode = diagram.generateMermaidDiagram(activities);
      const panel = vscode.window.createWebviewPanel(
        'activityDiagram',
        'Activity Diagram',
        vscode.ViewColumn.One,
        { enableScripts: true }
      );
      panel.webview.html = getMermaidWebviewContent(mermaidCode);
    } catch (error) {
      vscode.window.showErrorMessage('Failed to render activity diagram.');
    }
  }));
}

module.exports = { registerCommands };
