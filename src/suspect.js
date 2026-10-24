/**
 * suspect.js - Suspect and Witness Data Model with Dynamic Psychological Stats & Portraits.
 */

const PORTRAITS_POOL = {
  Male: [
    'assets/portraits/male_1.jpg',
    'assets/portraits/male_2.jpg'
  ],
  Female: [
    'assets/portraits/female_1.jpg',
    'assets/portraits/female_2.jpg'
  ]
};

export class Suspect {
  constructor({
    name,
    age,
    gender,
    occupation,
    relationship_to_victim,
    personality,
    income,
    education,
    backstory,
    secret,
    possible_motive = null,
    is_guilty = false,
    stress_level = 50,
    fear_level = 30,
    honesty_level = 70,
    trust_level = 50,
    aggression = 20,
    confidence = 60,
    memory_quality = 80,
    portrait_url = null
  }) {
    this.name = name;
    this.age = age;
    this.gender = gender;
    this.occupation = occupation;
    this.relationship_to_victim = relationship_to_victim;
    this.personality = personality;
    this.income = income;
    this.education = education;
    this.backstory = backstory;
    this.secret = secret;
    this.possible_motive = possible_motive;
    this.is_guilty = is_guilty;

    // Dynamic Psychological Stats
    this.stress_level = Math.min(100, Math.max(0, stress_level));
    this.fear_level = Math.min(100, Math.max(0, fear_level));
    this.honesty_level = Math.min(100, Math.max(0, honesty_level));
    this.trust_level = Math.min(100, Math.max(0, trust_level));
    this.aggression = Math.min(100, Math.max(0, aggression));
    this.confidence = Math.min(100, Math.max(0, confidence));
    this.memory_quality = Math.min(100, Math.max(0, memory_quality));

    // Assign AI generated portrait image
    if (portrait_url) {
      this.portrait_url = portrait_url;
    } else {
      const pool = PORTRAITS_POOL[this.gender] || PORTRAITS_POOL.Male;
      const charSum = this.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      this.portrait_url = pool[charSum % pool.length];
    }

    this.timeline = {};              // e.g. {"6 PM": "At Cafe", "8 PM": "At Home"}
    this.alibi_is_verified = false;
    this.alibi_witness = null;
    this.questions_asked = [];
    this.evidence_shown = [];
    this.accused_before = false;
  }

  adjustMood({ deltaTrust = 0, deltaFear = 0, deltaStress = 0, deltaAggression = 0 }) {
    this.trust_level = Math.min(100, Math.max(0, this.trust_level + deltaTrust));
    this.fear_level = Math.min(100, Math.max(0, this.fear_level + deltaFear));
    this.stress_level = Math.min(100, Math.max(0, this.stress_level + deltaStress));
    this.aggression = Math.min(100, Math.max(0, this.aggression + deltaAggression));
  }

  getEmotionalStateDescription() {
    if (this.aggression > 75) return "Hostile (Defensive)";
    if (this.fear_level > 70) return "Terrified (Trembling)";
    if (this.stress_level > 70) return "Nervous (Sweating)";
    if (this.trust_level > 70) return "Cooperative & Open";
    if (this.confidence > 75) return "Smug & Composed";
    return "Guarded";
  }

  recordQuestion(category) {
    if (!this.questions_asked.includes(category)) {
      this.questions_asked.push(category);
    }
  }

  recordEvidenceShown(evidenceId) {
    if (!this.evidence_shown.includes(evidenceId)) {
      this.evidence_shown.push(evidenceId);
    }
  }

  toDict() {
    return { ...this };
  }

  static fromDict(data) {
    const s = new Suspect(data);
    s.timeline = data.timeline || {};
    s.alibi_is_verified = data.alibi_is_verified || false;
    s.alibi_witness = data.alibi_witness || null;
    s.questions_asked = data.questions_asked || [];
    s.evidence_shown = data.evidence_shown || [];
    s.accused_before = data.accused_before || false;
    return s;
  }
}
