/**
 * @fileoverview Activity manager for handling and persisting activity data
 * @author Activity Tracker Team
 * @version 0.0.1
 */

const vscode = require('vscode');
const fs = require('fs').promises;
const path = require('path');

/**
 * Class that manages the storage and manipulation of activities
 * @class ActivityManager
 */
class ActivityManager {
  /**
   * Creates an instance of the activity manager
   * @constructor
   */
  constructor() {
    this.logFilePath = path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, '.vscode', 'activity-log.json');
  }

  /**
   * Retrieves all stored activities from the log file.
   * @async
   * @returns {Promise<Array>} Array of activity objects.
   */
  async getActivities() {
    try {
      const data = await fs.readFile(this.logFilePath, 'utf8');
      if (!data.trim()) {
        return [];
      }
      const parsed = JSON.parse(data);
      return Array.isArray(parsed.activities) ? parsed.activities : [];
    } catch (err) {
      return [];
    }
  }

  /**
   * Adds a new activity to the log file.
   * @async
   * @param {Object} activity - The activity to add.
   * @param {string} activity.id - Unique identifier of the activity.
   * @param {string} activity.startTime - Start time in ISO format.
   * @param {string} activity.endTime - End time in ISO format.
   * @param {number} activity.duration - Duration of the activity in seconds.
   * @param {string} activity.description - Description of the activity.
   * @param {Array<string>} [activity.filesModified] - Files modified during the activity.
   * @param {boolean} [activity.includeFiles] - Indicates whether modified files are included.
   * @returns {Promise<void>} Resolves when the activity is added.
   */
  async addActivity(activity) {
    const activities = await this.getActivities();
    activities.push(activity);
    await this.saveActivities(activities);
  }

  /**
   * Updates an existing activity in the log file.
   * @async
   * @param {Object} updatedActivity - The updated activity object.
   * @param {string} updatedActivity.id - Identifier of the activity to update.
   * @returns {Promise<void>} Resolves when the activity is updated.
   */
  async updateActivity(updatedActivity) {
    const activities = await this.getActivities();
    const index = activities.findIndex((a) => a.id === updatedActivity.id);
    if (index !== -1) {
      activities[index] = updatedActivity;
      await this.saveActivities(activities);
    }
  }

  /**
   * Deletes an activity from the log file after user confirmation.
   * @async
   * @param {string} id - Identifier of the activity to delete.
   * @returns {Promise<void>} Resolves when the activity is deleted.
   */
  async deleteActivity(id) {
    const confirmation = await vscode.window.showWarningMessage(
      'Are you sure you want to delete this activity?',
      { modal: true },
      'Yes'
    );

    if (confirmation === 'Yes') {
      const activities = await this.getActivities();
      const filteredActivities = activities.filter((a) => a.id !== id);
      await this.saveActivities(filteredActivities);
    }
  }

  /**
   * Deletes all activities from the log file after user confirmation.
   * @async
   * @returns {Promise<void>} Resolves when all activities are deleted.
   */
  async deleteAllActivities() {
    const confirmation = await vscode.window.showWarningMessage(
      'Are you sure you want to delete all activities? This action cannot be undone.',
      { modal: true },
      'Yes'
    );

    if (confirmation === 'Yes') {
      await this.saveActivities([]);
    }
  }

  /**
   * Saves the complete list of activities to the log file.
   * @async
   * @param {Array<Object>} activities - List of activities to save.
   * @returns {Promise<void>} Resolves when the activities are saved.
   * @private
   */
  async saveActivities(activities) {
    const dir = path.dirname(this.logFilePath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(this.logFilePath, JSON.stringify({ activities }, null, 2));
  }

  /**
   * Exports all activity logs to a CSV file.
   * @async
   * @returns {Promise<void>} Resolves when the CSV file is created.
   */
  async exportActivitiesToCSV() {
    const activities = await this.getActivities();
    if (activities.length === 0) {
      vscode.window.showInformationMessage('No activities to export.');
      return;
    }

    const csvContent = [
      'ID,Start Time,End Time,Duration (seconds),Description,Files Modified',
      ...activities.map(activity => (
        `${activity.id},"${activity.startTime}","${activity.endTime}",${activity.duration},"${activity.description}","${(activity.filesModified || []).join(';')}"`
      ))
    ].join('\n');

    const workspacePath = vscode.workspace.workspaceFolders[0].uri.fsPath;
    const filePath = path.join(workspacePath, 'activity-log.csv');

    await fs.writeFile(filePath, csvContent);
    vscode.window.showInformationMessage(`Activities exported to ${filePath}`);
  }

  /**
   * Adds a tag to an activity for categorization.
   * @async
   * @param {string} activityId - The ID of the activity to tag.
   * @param {string} tag - The tag to add to the activity.
   * @returns {Promise<void>} Resolves when the tag is added.
   */
  async addTagToActivity(activityId, tag) {
    const activities = await this.getActivities();
    const activity = activities.find((a) => a.id === activityId);
    if (activity) {
      activity.tags = activity.tags || [];
      activity.tags.push(tag);
      await this.saveActivities(activities);
    }
  }

  /**
   * Filters activities by a specific tag.
   * @async
   * @param {string} tag - The tag to filter activities by.
   * @returns {Promise<Array>} Array of activities with the specified tag.
   */
  async filterActivitiesByTag(tag) {
    const activities = await this.getActivities();
    return activities.filter((a) => a.tags && a.tags.includes(tag));
  }
}

module.exports = ActivityManager;