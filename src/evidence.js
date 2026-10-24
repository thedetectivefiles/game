/**
 * evidence.js - Physical & Digital Clue Model.
 */

import { EvidenceImportance } from './constants.js';

export class Evidence {
  constructor({
    id,
    name,
    evidence_type,
    description,
    location_found,
    importance = EvidenceImportance.SECONDARY,
    owner = "Unknown",
    testable = false,
    analysis_result = "",
    is_red_herring = false,
    connections = []
  }) {
    this.id = id;
    this.name = name;
    this.evidence_type = evidence_type;
    this.description = description;
    this.location_found = location_found;
    this.importance = importance;
    this.owner = owner;
    this.testable = testable;
    this.tested = false;
    this.analysis_result = analysis_result;
    this.is_red_herring = is_red_herring;
    this.connections = connections;
  }

  getImportanceLabel() {
    for (const [key, val] of Object.entries(EvidenceImportance)) {
      if (val === this.importance) return key;
    }
    return 'SECONDARY';
  }

  getSummary() {
    const labStatus = this.tested ? '[TESTED]' : (this.testable ? '[LAB ELIGIBLE]' : '');
    return `[${this.id}] ${this.name} (${this.evidence_type}) - Found at: ${this.location_found} ${labStatus}`;
  }

  toDict() {
    return { ...this };
  }

  static fromDict(data) {
    const ev = new Evidence(data);
    ev.tested = data.tested || false;
    return ev;
  }
}
