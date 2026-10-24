/**
 * locations.js - City GPS Map & Travel Manager.
 */

import { LOCATIONS_DATA } from './constants.js';

export class Location {
  constructor({ name, description, open_hour = 0, close_hour = 24, travel_minutes = 15, category = "General", icon = "📍", x = 50, y = 50 }) {
    this.name = name;
    this.description = description;
    this.open_hour = open_hour;
    this.close_hour = close_hour;
    this.travel_minutes = travel_minutes;
    this.category = category;
    this.icon = icon;
    this.x = x;
    this.y = y;
    this.occupants = [];        // Suspect names present
    this.clues_present = [];     // Evidence IDs placed here
    this.searched = false;
  }

  isOpen(currentHour) {
    if (this.open_hour === 0 && this.close_hour === 24) return true;
    if (this.open_hour < this.close_hour) {
      return currentHour >= this.open_hour && currentHour < this.close_hour;
    } else {
      return currentHour >= this.open_hour || currentHour < this.close_hour;
    }
  }

  searchLocation() {
    this.searched = true;
    const foundIds = [...this.clues_present];
    this.clues_present = [];

    if (foundIds.length > 0) {
      return { foundIds, narrative: `Detailed sweep of ${this.name} uncovered ${foundIds.length} new evidence clue(s)!` };
    } else {
      return { foundIds: [], narrative: `Searched ${this.name} thoroughly, but no physical evidence was found.` };
    }
  }

  toDict() {
    return { ...this };
  }

  static fromDict(data) {
    const info = LOCATIONS_DATA[data.name] || {};
    const loc = new Location({
      ...data,
      icon: data.icon || info.icon || "📍",
      x: data.x || info.x || 50,
      y: data.y || info.y || 50
    });
    loc.occupants = data.occupants || [];
    loc.clues_present = data.clues_present || [];
    loc.searched = data.searched || false;
    return loc;
  }
}

export class LocationMap {
  constructor() {
    this.locations = {};
    this.currentLocationName = "Police Station";

    for (const [name, info] of Object.entries(LOCATIONS_DATA)) {
      this.locations[name] = new Location({
        name,
        description: info.description,
        open_hour: info.open_hour,
        close_hour: info.close_hour,
        travel_minutes: info.travel_minutes,
        category: info.category,
        icon: info.icon,
        x: info.x,
        y: info.y
      });
    }
  }

  getCurrentLocation() {
    return this.locations[this.currentLocationName];
  }

  travelTo(destinationName, timeMgr) {
    if (!this.locations[destinationName]) {
      return { success: false, message: `Unknown location '${destinationName}'.`, notifications: [] };
    }
    if (destinationName === this.currentLocationName) {
      return { success: false, message: `You are already at ${destinationName}.`, notifications: [] };
    }

    const target = this.locations[destinationName];
    if (!target.isOpen(timeMgr.hour)) {
      const hoursStr = `${String(target.open_hour).padStart(2, '0')}:00 - ${String(target.close_hour).padStart(2, '0')}:00`;
      return { success: false, message: `${target.name} is currently CLOSED. Operating hours: ${hoursStr}.`, notifications: [] };
    }

    const travelTime = target.travel_minutes;
    const notifications = timeMgr.advanceTime(0, travelTime);
    this.currentLocationName = destinationName;

    return {
      success: true,
      message: `Traveled to ${destinationName} (${travelTime} mins).`,
      notifications
    };
  }

  toDict() {
    return {
      currentLocationName: this.currentLocationName,
      locations: Object.fromEntries(Object.entries(this.locations).map(([k, v]) => [k, v.toDict()]))
    };
  }

  static fromDict(data) {
    const lmap = new LocationMap();
    lmap.currentLocationName = data.currentLocationName || "Police Station";
    if (data.locations) {
      for (const [name, locData] of Object.entries(data.locations)) {
        lmap.locations[name] = Location.fromDict(locData);
      }
    }
    return lmap;
  }
}
