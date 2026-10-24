/**
 * timeSystem.js - In-game Clock and Day Progression Engine.
 */

export class TimeManager {
  constructor(startHour = 8, startDay = 1, maxDays = 5, labMultiplier = 1.0) {
    this.hour = startHour;        // 0-23
    this.minute = 0;              // 0-59
    this.day = startDay;          // 1, 2, 3...
    this.maxDays = maxDays;
    this.labMultiplier = labMultiplier;
    this.labQueue = [];           // Array of { evidenceId, evidenceName, remainingHours }
  }

  advanceTime(hours = 0, minutes = 0) {
    const notifications = [];
    const totalMinutes = this.minute + minutes;
    this.minute = totalMinutes % 60;
    const addedHours = hours + Math.floor(totalMinutes / 60);

    for (let i = 0; i < addedHours; i++) {
      this.hour++;
      this._updateLabQueue(notifications);

      if (this.hour >= 24) {
        this.hour = 0;
        this.day++;
        notifications.push(`[TIME] Midnight has passed. Welcome to DAY ${this.day} of the investigation.`);
        notifications.push(`[NEWSPAPER] A fresh edition of the City Morning Gazette has arrived at HQ.`);
      }
    }
    return notifications;
  }

  _updateLabQueue(notifications) {
    const completedIndices = [];
    this.labQueue.forEach((item, index) => {
      item.remainingHours--;
      if (item.remainingHours <= 0) {
        completedIndices.push(index);
        notifications.push(`[LAB ANALYSIS COMPLETE] Forensics finished analyzing '${item.evidenceName}'!`);
      }
    });

    for (let i = completedIndices.length - 1; i >= 0; i--) {
      this.labQueue.splice(completedIndices[i], 1);
    }
  }

  addToLabQueue(evidenceId, evidenceName, baseHours = 3) {
    const totalHours = Math.max(1, Math.round(baseHours * this.labMultiplier));
    this.labQueue.push({
      evidenceId,
      evidenceName,
      remainingHours: totalHours
    });
    return totalHours;
  }

  isLocationOpen(openHour, closeHour) {
    if (openHour === 0 && closeHour === 24) return true;
    if (openHour < closeHour) {
      return this.hour >= openHour && this.hour < closeHour;
    } else {
      return this.hour >= openHour || this.hour < closeHour;
    }
  }

  getFormattedTime() {
    const period = this.hour < 12 ? 'AM' : 'PM';
    let displayHour = this.hour % 12;
    if (displayHour === 0) displayHour = 12;
    const padMin = String(this.minute).padStart(2, '0');
    return `Day ${this.day} - ${String(displayHour).padStart(2, '0')}:${padMin} ${period}`;
  }

  getDaysRemaining() {
    return Math.max(0, this.maxDays - this.day + 1);
  }

  hasDeadlineExpired() {
    return this.day > this.maxDays;
  }

  toDict() {
    return {
      hour: this.hour,
      minute: this.minute,
      day: this.day,
      maxDays: this.maxDays,
      labMultiplier: this.labMultiplier,
      labQueue: this.labQueue
    };
  }

  static fromDict(data) {
    const tm = new TimeManager(data.hour || 8, data.day || 1, data.maxDays || 5, data.labMultiplier || 1.0);
    tm.minute = data.minute || 0;
    tm.labQueue = data.labQueue || [];
    return tm;
  }
}
