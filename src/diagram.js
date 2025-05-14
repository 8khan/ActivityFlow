/**
 * @fileoverview Mermaid.js diagram generator for activity visualization
 * @author Activity Tracker Team
 * @version 0.0.1
 */

/**
 * Class to generate Gantt diagrams of activities using Mermaid.js
 * @class Diagram
 */
class Diagram {
  /**
   * Generates Mermaid.js diagram code from a list of activities.
   * @param {Array<Object>} activities - List of activities to represent in the diagram.
   * @returns {string} Mermaid.js code to generate a Gantt diagram.
   */
  generateMermaidDiagram(activities) {
    /**
     * Escapes special characters in text to avoid syntax errors in Mermaid.
     * @param {string} text - Text to escape.
     * @returns {string} Escaped text safe for use in Mermaid.
     * @private
     */
    const escapeMermaidText = (text) => {
      if (!text || typeof text !== 'string') return `Activity_${Date.now()}`;
      return text
        .replace(/"/g, '\\"')
        .replace(/:/g, '_')
        .replace(/\\/g, '/')
        .replace(/\n/g, ' ')
        .replace(/#/g, '\\#')
        .replace(/;/g, '\\;')
        .replace(/,/g, '\\,')
        .replace(/\s+/g, '_')
        .trim();
    };

    /**
     * Formats dates to the format required by Mermaid (YYYY-MM-DD HH:mm:ss).
     * @param {string} dateStr - Date in ISO format or timestamp.
     * @returns {string} Formatted date for Mermaid.
     * @private
     */
    const formatDate = (dateStr) => {
      if (!dateStr) {
        return new Date().toISOString().replace('T', ' ').substring(0, 19);
      }
      const date = new Date(dateStr);
      if (isNaN(date)) {
        return new Date().toISOString().replace('T', ' ').substring(0, 19);
      }
      return date.toISOString().replace('T', ' ').substring(0, 19);
    };

    // Validate and generate tasks
    const tasks = (Array.isArray(activities) ? activities : [])
      .map((activity, index) => {
        // Validate activity
        if (!activity || typeof activity !== 'object') {
          return '';
        }

        const startTime = activity.startTime
          ? formatDate(activity.startTime)
          : formatDate(new Date());
        const endTime = activity.endTime
          ? formatDate(activity.endTime)
          : formatDate(new Date());
        const description = escapeMermaidText(
          activity.description || `Activity_${index + 1}`,
        );
        const id = `task${index}`;

        // Ensure dates are not identical
        const startDate = new Date(startTime);
        let endDate = new Date(endTime);
        if (startDate.getTime() >= endDate.getTime()) {
          endDate = new Date(startDate.getTime() + 1000); // Add 1 second
        }

        // Simplify file representation
        let filesLine = '';
        if (
          activity.includeFiles &&
          Array.isArray(activity.filesModified) &&
          activity.filesModified.length > 0
        ) {
          // Use 'Files' as a simple label instead of including full paths
          filesLine = `    Files :f${id}, ${startTime}, ${endDate.toISOString().replace('T', ' ').substring(0, 19)}`;
        }

        // Main task
        const taskLine = `    ${description} :${id}, ${startTime}, ${endDate.toISOString().replace('T', ' ').substring(0, 19)}`;

        return [taskLine, filesLine].filter(Boolean).join('\n');
      })
      .filter(Boolean)
      .join('\n');

    // Complete Mermaid code
    const mermaidCode = `
gantt
    title Activity Timeline
    dateFormat YYYY-MM-DD HH:mm:ss
    axisFormat %H:%M:%S
    section Activities
${tasks || '    No_activities_logged :noact, 2025-01-01 00:00:00, 2025-01-01 00:00:01'}
    `;

    return mermaidCode;
  }
}

module.exports = Diagram;
