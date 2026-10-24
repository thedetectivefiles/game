/**
 * player.js - Player & Detective Notebook System.
 */

export class DetectiveNotebook {
  constructor() {
    this.entries = [];
  }

  addEntry(category, content) {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    this.entries.push({
      timestamp,
      category: category.toUpperCase(),
      content
    });
  }

  getEntriesByCategory(category = null) {
    if (!category) return this.entries;
    return this.entries.filter(e => e.category === category.toUpperCase());
  }

  toDict() {
    return { entries: this.entries };
  }

  static fromDict(data) {
    const nb = new DetectiveNotebook();
    nb.entries = data.entries || [];
    return nb;
  }
}

export class Player {
  constructor(name = "Detective Vance", title = "Senior Homicide Investigator") {
    this.name = name;
    this.title = title;
    this.cases_solved = 0;
    this.cases_failed = 0;
    this.wrong_accusations = 0;
    this.notebook = new DetectiveNotebook();
  }

  recordCaseResolution(success) {
    if (success) this.cases_solved++;
    else this.cases_failed++;
  }

  recordWrongAccusation() {
    this.wrong_accusations++;
  }

  getAccuracyPercentage() {
    const total = this.cases_solved + this.cases_failed;
    if (total === 0) return 100.0;
    return Math.round((this.cases_solved / total) * 100);
  }

  toDict() {
    return {
      name: this.name,
      title: this.title,
      cases_solved: this.cases_solved,
      cases_failed: this.cases_failed,
      wrong_accusations: this.wrong_accusations,
      notebook: this.notebook.toDict()
    };
  }

  static fromDict(data) {
    const p = new Player(data.name || "Detective Vance", data.title || "Senior Homicide Investigator");
    p.cases_solved = data.cases_solved || 0;
    p.cases_failed = data.cases_failed || 0;
    p.wrong_accusations = data.wrong_accusations || 0;
    p.notebook = DetectiveNotebook.fromDict(data.notebook || {});
    return p;
  }
}
