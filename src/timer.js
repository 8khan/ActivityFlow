/**
 * @fileoverview Class to manage the activity timer
 * @author Activity Tracker Team
 * @version 0.0.1
 */

/**
 * Class that handles the functionality of the activity timer
 * @class Timer
 */
class Timer {
  /**
   * Creates an instance of the timer
   * @constructor
   */
  constructor() {
    this.startTime = null;
    this.endTime = null;
    this.duration = 0;
    this.isPaused = false;
  }

  /**
   * Starts or restarts the timer.
   * Sets the start time to the current date and resets the paused state.
   * @returns {void}
   */
  start() {
    this.startTime = new Date().toISOString();
    this.isPaused = false;
  }

  /**
   * Pauses the timer and accumulates the elapsed time so far.
   * Only works if the timer is running and not already paused.
   * @returns {void}
   */
  pause() {
    if (this.startTime && !this.isPaused) {
      this.duration += (new Date() - new Date(this.startTime)) / 1000;
      this.isPaused = true;
    }
  }

  /**
   * Stops the timer and records the end time.
   * Accumulates the elapsed time if the timer is running.
   * @returns {void}
   */
  stop() {
    if (this.startTime && !this.isPaused) {
      this.endTime = new Date().toISOString();
      this.duration += (new Date() - new Date(this.startTime)) / 1000;
    }
  }

  /**
   * Gets the start time of the timer.
   * @returns {string|null} Start date and time in ISO format, or null if not started.
   */
  getStartTime() {
    return this.startTime;
  }

  /**
   * Gets the end time of the timer.
   * If the timer is not stopped, returns the current date and time.
   * @returns {string} End date and time in ISO format.
   */
  getEndTime() {
    return this.endTime || new Date().toISOString();
  }

  /**
   * Gets the accumulated duration of the timer in seconds.
   * @returns {number} Duration in seconds.
   */
  getDuration() {
    return this.duration;
  }
}

module.exports = Timer;
