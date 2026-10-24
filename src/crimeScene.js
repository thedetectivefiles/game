/**
 * crimeScene.js - Homicide Crime Scene Management Engine.
 */

export class CrimeScene {
  constructor({
    location_name,
    initial_description,
    weather_condition = "Clear",
    hidden_evidence_ids = []
  }) {
    this.location_name = location_name;
    this.initial_description = initial_description;
    this.weather_condition = weather_condition;
    this.search_thoroughness = 0.0; // 0.0 to 1.0
    this.hidden_evidence_ids = hidden_evidence_ids;
    this.found_evidence_ids = [];
    this.is_sealed = true;
    this.notes = [];
  }

  performSearch(boost = 0.40) {
    this.search_thoroughness = Math.min(1.0, this.search_thoroughness + boost);
    const discoveredIds = [];

    if (this.hidden_evidence_ids.length > 0) {
      let numToFind = Math.max(1, Math.round(this.hidden_evidence_ids.length * boost));
      numToFind = Math.min(numToFind, this.hidden_evidence_ids.length);

      for (let i = 0; i < numToFind; i++) {
        if (this.hidden_evidence_ids.length > 0) {
          const itemId = this.hidden_evidence_ids.shift();
          this.found_evidence_ids.push(itemId);
          discoveredIds.push(itemId);
        }
      }
    }

    const pct = Math.round(this.search_thoroughness * 100);
    let narrative = "";
    if (discoveredIds.length > 0) {
      narrative = `Forensic sweep (${pct}% searched). Discovered ${discoveredIds.length} physical clue(s)!`;
    } else if (this.search_thoroughness >= 1.0) {
      narrative = `Forensic sweep complete (${pct}% searched). No additional evidence remains at this crime scene.`;
    } else {
      narrative = `Search sweep finished (${pct}% searched). Nothing new uncovered this turn.`;
    }

    return { discoveredIds, narrative };
  }

  toDict() {
    return { ...this };
  }

  static fromDict(data) {
    const cs = new CrimeScene(data);
    cs.search_thoroughness = data.search_thoroughness || 0.0;
    cs.found_evidence_ids = data.found_evidence_ids || [];
    cs.is_sealed = data.is_sealed ?? true;
    cs.notes = data.notes || [];
    return cs;
  }
}
