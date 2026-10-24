/**
 * inventory.js - Inventory Container & Clue Deduction Solver.
 */

import { Evidence } from './evidence.js';

export class Deduction {
  constructor({ id, required_evidence_ids, title, insight_text, implicated_suspect = null }) {
    this.id = id;
    this.required_evidence_ids = required_evidence_ids;
    this.title = title;
    this.insight_text = insight_text;
    this.implicated_suspect = implicated_suspect;
    this.unlocked = false;
  }

  checkUnlock(collectedIds) {
    if (this.unlocked) return false;
    const hasAll = this.required_evidence_ids.every(id => collectedIds.includes(id));
    if (hasAll) {
      this.unlocked = true;
      return true;
    }
    return false;
  }

  toDict() {
    return { ...this };
  }

  static fromDict(data) {
    const d = new Deduction(data);
    d.unlocked = data.unlocked || false;
    return d;
  }
}

export class Inventory {
  constructor() {
    this.items = {};        // Map of id -> Evidence
    this.deductions = [];   // Array of Deduction
  }

  addEvidence(evidenceItem) {
    if (this.items[evidenceItem.id]) return false;
    this.items[evidenceItem.id] = evidenceItem;
    return true;
  }

  getEvidence(id) {
    return this.items[id] || null;
  }

  listEvidence(sortBy = "importance") {
    const arr = Object.values(this.items);
    if (sortBy === "importance") {
      arr.sort((a, b) => b.importance - a.importance);
    } else if (sortBy === "name") {
      arr.sort((a, b) => a.name.localeCompare(b.name));
    }
    return arr;
  }

  addDeductionRule(deduction) {
    this.deductions.push(deduction);
  }

  evaluateDeductions() {
    const collectedIds = Object.keys(this.items);
    const newlyUnlocked = [];
    this.deductions.forEach(d => {
      if (d.checkUnlock(collectedIds)) {
        newlyUnlocked.push(d);
      }
    });
    return newlyUnlocked;
  }

  getUnlockedDeductions() {
    return this.deductions.filter(d => d.unlocked);
  }

  toDict() {
    return {
      items: Object.fromEntries(Object.entries(this.items).map(([k, v]) => [k, v.toDict()])),
      deductions: this.deductions.map(d => d.toDict())
    };
  }

  static fromDict(data) {
    const inv = new Inventory();
    if (data.items) {
      for (const [id, itemData] of Object.entries(data.items)) {
        inv.items[id] = Evidence.fromDict(itemData);
      }
    }
    if (data.deductions) {
      inv.deductions = data.deductions.map(d => Deduction.fromDict(d));
    }
    return inv;
  }
}
