const vscode = require('vscode');

/**
 * Generates the HTML content for the activity logs webview.
 * @param {Array<Object>} activities - List of activity objects to display in the logs.
 * @returns {string} HTML content for the activity logs webview.
 */
function getLogsWebviewContent(activities) {
  return `
    <html>
      <body>
        <h1>Activity Logs</h1>
        ${
          activities.length === 0
            ? '<p>No activities logged yet.</p>'
            : `
              <ul>
                ${activities
                  .map(
                    (a) => `
                      <li>
                        <strong>ID:</strong> ${a.id}<br>
                        <strong>Start:</strong> ${a.startTime}<br>
                        <strong>End:</strong> ${a.endTime}<br>
                        <strong>Duration:</strong> ${(a.duration / 3600).toFixed(2)} hours<br>
                        <strong>Description:</strong> ${a.description}<br>
                        <strong>Files:</strong> ${a.filesModified.join(', ') || 'None'}
                      </li>
                    `
                  )
                  .join('')}
              </ul>
            `
        }
      </body>
    </html>
  `;
}

/**
 * Generates the HTML content for the Mermaid.js diagram webview.
 * Escapes special characters in the Mermaid code to ensure proper rendering.
 * @param {string} mermaidCode - Mermaid.js code to render the diagram.
 * @returns {string} HTML content for the Mermaid.js diagram webview.
 */
function getMermaidWebviewContent(mermaidCode) {
  const escapedMermaidCode = mermaidCode.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return `
    <html>
      <head>
        <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
        <style>
          body { margin: 20px; font-family: Arial, sans-serif; }
          .mermaid { max-width: 100%; overflow-x: auto; }
          .error { color: red; }
          .mermaid-code { background: #f5f5f5; padding: 10px; white-space: pre-wrap; }
        </style>
      </head>
      <body>
        <h1>Activity Timeline</h1>
        <div class="mermaid">
          ${mermaidCode}
        </div>
        <div id="error" class="error"></div>
        <h3>Generated Mermaid Code</h3>
        <pre class="mermaid-code">${escapedMermaidCode}</pre>
        <script>
          mermaid.initialize({ startOnLoad: false, theme: 'default', securityLevel: 'loose' });
          mermaid.run().catch((err) => {
            console.error('Mermaid rendering error:', err);
            document.getElementById('error').innerText = 'Error rendering diagram: ' + err.message;
          });
        </script>
      </body>
    </html>
  `;
}

/**
 * Retrieves the configuration settings for the activity tracker extension.
 * @returns {Object} Configuration object containing user preferences.
 */
function getConfiguration() {
  const config = vscode.workspace.getConfiguration('activity-tracker');
  return {
    buttonAlignment: config.get('buttonAlignment', 'Left'), // Default to 'Left'
  };
}

/**
 * Updates the alignment of the status bar items based on user configuration.
 * @param {Object} statusBarItems - Object containing the status bar items to update.
 */
function updateButtonAlignment(statusBarItems) {
  const { buttonAlignment } = getConfiguration();
  const alignment = buttonAlignment === 'Right' ? vscode.StatusBarAlignment.Right : vscode.StatusBarAlignment.Left;

  statusBarItems.startButton.alignment = alignment;
  statusBarItems.pauseButton.alignment = alignment;
  statusBarItems.stopButton.alignment = alignment;
  statusBarItems.timerDisplay.alignment = alignment;
}

module.exports = { getLogsWebviewContent, getMermaidWebviewContent, getConfiguration, updateButtonAlignment };
