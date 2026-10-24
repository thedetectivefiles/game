/**
 * constants.js - Static Configuration Pools for The Detective Files Web App.
 */

export const DifficultyLevel = {
  EASY: 'EASY',
  NORMAL: 'NORMAL',
  HARD: 'HARD'
};

export const MurderMethod = {
  POISON: 'Poisoning',
  KNIFE: 'Stabbing (Knife)',
  GUN: 'Gunshot Wound',
  BLUNT_OBJECT: 'Blunt Force Trauma',
  FIRE: 'Arson / Fire Fatalities',
  DROWNING: 'Drowning',
  FALL: 'Defenestration / Fatal Fall',
  ELECTROCUTION: 'Electrocution',
  STAGED_ACCIDENT: 'Accident Staged as Homicide'
};

export const MotiveType = {
  MONEY: 'Financial Gain / Greed',
  INHERITANCE: 'Disputed Inheritance',
  REVENGE: 'Personal Revenge',
  JEALOUSY: 'Jealousy / Envy',
  LOVE_TRIANGLE: 'Love Triangle',
  BUSINESS_RIVALRY: 'Business Rivalry',
  BLACKMAIL: 'Blackmail / Extortion',
  FAMILY_DISPUTE: 'Family Feud',
  POLITICAL: 'Political Ambition',
  DEBT: 'Gambling / Unpaid Debt',
  SECRET_AFFAIR: 'Cover-up of Secret Affair',
  SELF_DEFENSE: 'Self-Defense Gone Wrong'
};

export const EvidenceImportance = {
  TRIVIAL: 1,
  SECONDARY: 2,
  CRITICAL: 3,
  SMOKING_GUN: 4
};

export const DIFFICULTY_SETTINGS = {
  EASY: {
    suspect_count: 5,
    evidence_count: 12,
    max_days: 7,
    lie_probability: 0.15,
    lab_multiplier: 0.75,
    label: "Easy (5 Suspects, 7 Days)"
  },
  NORMAL: {
    suspect_count: 8,
    evidence_count: 16,
    max_days: 5,
    lie_probability: 0.35,
    lab_multiplier: 1.0,
    label: "Normal (8 Suspects, 5 Days)"
  },
  HARD: {
    suspect_count: 12,
    evidence_count: 22,
    max_days: 3,
    lie_probability: 0.60,
    lab_multiplier: 1.5,
    label: "Hard (12 Suspects, 3 Days)"
  }
};

export const LOCATIONS_DATA = {
  "Police Station": { description: "Metropolitan Police HQ. Home base for lab analysis and evidence locker.", open_hour: 0, close_hour: 24, travel_minutes: 15, category: "Government", icon: "🚨", x: 50, y: 50 },
  "Victim House": { description: "Private residence of the victim. Contains personal diaries and financial ledgers.", open_hour: 0, close_hour: 24, travel_minutes: 20, category: "Residential", icon: "🏡", x: 25, y: 30 },
  "Crime Scene": { description: "The isolated site where the body was discovered. Cordoned off with police tape.", open_hour: 0, close_hour: 24, travel_minutes: 25, category: "Investigative", icon: "⚠️", x: 75, y: 25 },
  "Hospital": { description: "City General Hospital. Medical examiner unit and autopsy reports.", open_hour: 0, close_hour: 24, travel_minutes: 20, category: "Medical", icon: "🏥", x: 65, y: 65 },
  "Cafe": { description: "The Daily Grind Cafe. Neighborhood spot where local gossip travels fast.", open_hour: 6, close_hour: 22, travel_minutes: 10, category: "Commercial", icon: "☕", x: 40, y: 35 },
  "Restaurant": { description: "The Velvet Room. An upscale restaurant frequented by high-society figures.", open_hour: 11, close_hour: 23, travel_minutes: 15, category: "Commercial", icon: "🍽️", x: 30, y: 60 },
  "Office": { description: "Corporate office suite. Contains corporate financial ledgers and memos.", open_hour: 8, close_hour: 19, travel_minutes: 25, category: "Commercial", icon: "🏢", x: 60, y: 35 },
  "Warehouse": { description: "Abandoned industrial warehouse near shipping docks. Secluded and cold.", open_hour: 0, close_hour: 24, travel_minutes: 35, category: "Industrial", icon: "🏭", x: 85, y: 75 },
  "Hotel": { description: "Grand Metropolis Hotel. Guest registries and security video archives.", open_hour: 0, close_hour: 24, travel_minutes: 20, category: "Commercial", icon: "🏨", x: 45, y: 70 },
  "Park": { description: "Blackwood Municipal Park. Sprawling urban park with winding pathways.", open_hour: 5, close_hour: 22, travel_minutes: 15, category: "Public", icon: "🌲", x: 20, y: 75 },
  "Apartment": { description: "Suspect apartment complex. Multi-story building with shared hallways.", open_hour: 6, close_hour: 23, travel_minutes: 20, category: "Residential", icon: "🏬", x: 15, y: 45 },
  "Library": { description: "City Central Library. Quiet archives and historical records.", open_hour: 9, close_hour: 20, travel_minutes: 15, category: "Public", icon: "📚", x: 70, y: 45 },
  "Bank": { description: "First National Trust Bank. Financial records and safety deposit vaults.", open_hour: 9, close_hour: 17, travel_minutes: 25, category: "Financial", icon: "🏦", x: 35, y: 20 }
};

export const FIRST_NAMES_MALE = ["Arthur", "Benjamin", "Charles", "Daniel", "Edward", "Felix", "Gabriel", "Henry", "Isaac", "Julian", "Marcus", "Oliver", "Victor", "William"];
export const FIRST_NAMES_FEMALE = ["Adelaide", "Beatrice", "Catherine", "Diana", "Eleanor", "Florence", "Grace", "Helen", "Irene", "Ophelia", "Rosalind", "Victoria"];
export const LAST_NAMES = ["Blackwood", "Sterling", "Vane", "Sinclair", "Holloway", "Fairfax", "Kensington", "Montgomery", "Thorne", "Davenport", "Harrington", "Kingsley"];
export const OCCUPATIONS = ["Corporate Executive", "Lead Chemist", "Investigative Journalist", "Bank Manager", "Art Collector", "Surgical Specialist", "Software Architect", "Hotel Manager", "Financial Auditor", "Attorney at Law"];
export const PERSONALITY_TRAITS = ["Calm and Calculating", "Nervous and Anxious", "Arrogant and Dismissive", "Charming and Flirtatious", "Aggressive and Defensive", "Secretive and Guarded"];
export const RELATIONSHIPS = ["Business Partner", "Estranged Spouse", "Personal Assistant", "Financial Beneficiary", "Bitter Rival", "Secret Lover", "Former Employee", "Family Attorney"];
