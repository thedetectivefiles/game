/**
 * victim.js - Homicide Victim Model & Autopsy Report.
 */

export class Victim {
  constructor({
    name,
    age,
    occupation,
    personality,
    cause_of_death,
    time_of_death,
    location_of_death,
    weapon,
    relationships = {},
    motives = [],
    secrets = [],
    diary_entries = [],
    financial_info = {},
    phone_records = []
  }) {
    this.name = name;
    this.age = age;
    this.occupation = occupation;
    this.personality = personality;
    this.cause_of_death = cause_of_death;
    this.time_of_death = time_of_death;
    this.location_of_death = location_of_death;
    this.weapon = weapon;
    this.relationships = relationships;
    this.motives = motives;
    this.secrets = secrets;
    this.diary_entries = diary_entries;
    this.financial_info = financial_info;
    this.phone_records = phone_records;
  }

  getAutopsyReportHTML() {
    return `
      <div class="autopsy-report">
        <h3>OFFICIAL MEDICAL EXAMINER REPORT</h3>
        <p><strong>SUBJECT:</strong> ${this.name} (Age ${this.age})</p>
        <p><strong>OCCUPATION:</strong> ${this.occupation}</p>
        <p><strong>CAUSE OF DEATH:</strong> ${this.cause_of_death}</p>
        <p><strong>WEAPON IDENTIFIED:</strong> ${this.weapon}</p>
        <p><strong>ESTIMATED TOD:</strong> ${this.time_of_death}</p>
        <p><strong>DISCOVERY SITE:</strong> ${this.location_of_death}</p>
        <hr style="margin: 1rem 0; border-color: var(--border-color);">
        <h4>PATHOLOGIST FINDINGS:</h4>
        <p>The body of ${this.name} was discovered at ${this.location_of_death}. Toxicology and trauma analysis confirm mortality caused by ${this.cause_of_death.toLowerCase()}. Physical marks match the usage of: ${this.weapon}.</p>
      </div>
    `;
  }

  toDict() {
    return { ...this };
  }

  static fromDict(data) {
    return new Victim(data);
  }
}
