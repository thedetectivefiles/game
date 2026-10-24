/**
 * caseGenerator.js - Procedural Mystery Generation Core Engine in JavaScript.
 */

import {
  DifficultyLevel, DIFFICULTY_SETTINGS, MurderMethod, MotiveType,
  EvidenceImportance, FIRST_NAMES_MALE, FIRST_NAMES_FEMALE, LAST_NAMES,
  OCCUPATIONS, PERSONALITY_TRAITS, RELATIONSHIPS
} from './constants.js';
import { Victim } from './victim.js';
import { Suspect } from './suspect.js';
import { Evidence } from './evidence.js';
import { Deduction } from './inventory.js';
import { CrimeScene } from './crimeScene.js';
import { LocationMap } from './locations.js';

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export class Case {
  constructor({ case_id, title, difficulty, victim, killer, suspects, evidence_list, deductions, crime_scene, location_map }) {
    this.case_id = case_id;
    this.title = title;
    this.difficulty = difficulty;
    this.victim = victim;
    this.killer = killer;
    this.suspects = suspects;
    this.evidence_list = evidence_list;
    this.deductions = deductions;
    this.crime_scene = crime_scene;
    this.location_map = location_map;
  }
}

export class CaseGenerator {
  static generateCase(difficulty = DifficultyLevel.NORMAL) {
    const config = DIFFICULTY_SETTINGS[difficulty] || DIFFICULTY_SETTINGS.NORMAL;
    const case_id = `CASE-${getRandomInt(10000, 99999)}`;

    // 1. Randomize Core Murder Details
    const murderMethods = Object.values(MurderMethod);
    const murder_method = pickRandom(murderMethods);
    const motives = Object.values(MotiveType);
    const motive_type = pickRandom(motives);

    const crime_location_name = pickRandom(["Crime Scene", "Warehouse", "Park", "Hotel", "Office", "Apartment"]);
    const time_of_death_str = `Between ${getRandomInt(7, 10)}:00 PM and ${getRandomInt(10, 11)}:30 PM, Night of Discovery`;

    // 2. Generate Victim
    const v_gender = Math.random() < 0.5 ? "Male" : "Female";
    const v_first = pickRandom(v_gender === "Male" ? FIRST_NAMES_MALE : FIRST_NAMES_FEMALE);
    const v_last = pickRandom(LAST_NAMES);
    const v_name = `${v_first} ${v_last}`;
    const v_age = getRandomInt(28, 68);
    const v_occ = pickRandom(OCCUPATIONS);
    const v_personality = pickRandom(PERSONALITY_TRAITS);

    const weapon_desc = this._generateWeaponDescription(murder_method);

    const victim = new Victim({
      name: v_name,
      age: v_age,
      occupation: v_occ,
      personality: v_personality,
      cause_of_death: murder_method,
      time_of_death: time_of_death_str,
      location_of_death: crime_location_name,
      weapon: weapon_desc,
      relationships: {},
      motives: [motive_type],
      secrets: [
        `Maintained an undisclosed offshore bank account holding $150,000.`,
        `Was engaged in a heated dispute regarding corporate shares.`
      ],
      diary_entries: [
        `Oct 12: I feel like someone is watching me whenever I leave the office...`,
        `Oct 14: Met with my associate. Things got tense when money was brought up.`
      ],
      financial_info: {
        bank_balance: `$${getRandomInt(15, 850)}000`,
        debt: `$${getRandomInt(0, 120)}000`,
        insurance_policy: `$${getRandomInt(100, 500)}000 payout`
      },
      phone_records: [
        { time: "06:15 PM", contact: "Unknown Caller", duration: "4 mins" },
        { time: "07:30 PM", contact: "Suspect Hotline", duration: "2 mins" }
      ]
    });

    // 3. Generate Suspect Pool
    const num_suspects = config.suspect_count;
    const suspects = [];
    const used_names = new Set([v_name]);

    // Designate Killer
    const k_gender = Math.random() < 0.5 ? "Male" : "Female";
    const k_first = pickRandom(k_gender === "Male" ? FIRST_NAMES_MALE : FIRST_NAMES_FEMALE);
    const k_last = pickRandom(LAST_NAMES.filter(l => l !== v_last));
    const k_name = `${k_first} ${k_last}`;
    used_names.add(k_name);

    const killer = new Suspect({
      name: k_name,
      age: getRandomInt(25, 65),
      gender: k_gender,
      occupation: pickRandom(OCCUPATIONS),
      relationship_to_victim: pickRandom(RELATIONSHIPS),
      personality: pickRandom(PERSONALITY_TRAITS),
      income: `$${getRandomInt(40, 200)},000 / year`,
      education: pickRandom(["Bachelor of Science", "Master of Business", "Law Degree"]),
      backstory: `Had extensive business dealings with ${v_name}. Recently suffered heavy financial losses.`,
      secret: `In severe debt and stood to benefit directly from ${v_name}'s death.`,
      possible_motive: motive_type,
      is_guilty: true,
      stress_level: 75,
      fear_level: 55,
      honesty_level: 30,
      trust_level: 40,
      aggression: 40,
      confidence: 65
    });

    killer.timeline = {
      "6:00 PM": `Dining alone at Restaurant`,
      "8:00 PM": `Claimed to be driving home alone (NO WITNESS)`,
      "9:30 PM": `Present near ${crime_location_name} (SEEN BY WITNESS)`,
      "11:00 PM": `Returned home`
    };
    suspects.push(killer);
    victim.relationships[killer.name] = killer.relationship_to_victim;

    // Generate Innocent Suspects
    for (let i = 0; i < num_suspects - 1; i++) {
      const s_gender = Math.random() < 0.5 ? "Male" : "Female";
      const s_first = pickRandom(s_gender === "Male" ? FIRST_NAMES_MALE : FIRST_NAMES_FEMALE);
      const available_lasts = LAST_NAMES.filter(l => !used_names.has(`${s_first} ${l}`));
      const s_last = pickRandom(available_lasts.length > 0 ? available_lasts : LAST_NAMES);
      const s_name = `${s_first} ${s_last}`;
      used_names.add(s_name);

      const rel = pickRandom(RELATIONSHIPS);
      victim.relationships[s_name] = rel;

      const innocent = new Suspect({
        name: s_name,
        age: getRandomInt(22, 70),
        gender: s_gender,
        occupation: pickRandom(OCCUPATIONS),
        relationship_to_victim: rel,
        personality: pickRandom(PERSONALITY_TRAITS),
        income: `$${getRandomInt(30, 150)},000 / year`,
        education: pickRandom(["Bachelor of Arts", "Master of Science", "Doctorate"]),
        backstory: `Longtime acquaintance of ${v_name}. Was seen talking with victim days before the crime.`,
        secret: pickRandom([
          "Hiding an embarrassing gambling debt.",
          "Falsified credentials on corporate resume.",
          "Was having a quiet romantic affair."
        ]),
        possible_motive: pickRandom(motives.filter(m => m !== motive_type)),
        is_guilty: false,
        stress_level: getRandomInt(30, 60),
        fear_level: getRandomInt(20, 50),
        honesty_level: getRandomInt(60, 90),
        trust_level: getRandomInt(50, 80)
      });

      innocent.timeline = {
        "6:00 PM": "Working late at Office",
        "8:00 PM": `Having coffee at Cafe (VERIFIED)`,
        "9:30 PM": "At home watching TV with family",
        "11:00 PM": "Asleep"
      };
      innocent.alibi_is_verified = true;
      innocent.alibi_witness = "Cafe Manager & CCTV";
      suspects.push(innocent);
    }

    // Shuffle Suspects
    suspects.sort(() => Math.random() - 0.5);

    // 4. Generate Evidence & Deductions
    const { evidence_list, deductions } = this._generateEvidenceAndDeductions(victim, killer, suspects, config, crime_location_name);

    // 5. Initialize Crime Scene & Map Locations
    const crime_scene = new CrimeScene({
      location_name: crime_location_name,
      initial_description: `The body of ${v_name} was discovered lying near central area of ${crime_location_name}. Medical tape marks the perimeter.`,
      weather_condition: "Overcast",
      hidden_evidence_ids: evidence_list.filter(ev => ev.location_found === crime_location_name).map(ev => ev.id)
    });

    const location_map = new LocationMap();
    evidence_list.forEach(ev => {
      if (location_map.locations[ev.location_found]) {
        location_map.locations[ev.location_found].clues_present.push(ev.id);
      }
    });

    suspects.forEach(s => {
      const locKeys = Object.keys(location_map.locations);
      const favLoc = pickRandom(locKeys);
      location_map.locations[favLoc].occupants.push(s.name);
    });

    return new Case({
      case_id,
      title: `The ${v_last} Murder Mystery`,
      difficulty,
      victim,
      killer,
      suspects,
      evidence_list,
      deductions,
      crime_scene,
      location_map
    });
  }

  static _generateWeaponDescription(method) {
    const map = {
      [MurderMethod.POISON]: "Custom Glass Vial containing Cyanide Residue",
      [MurderMethod.KNIFE]: "Heavy Steel Hunting Knife with Serrated Edge",
      [MurderMethod.GUN]: ".38 Caliber Revolver with Expended Shell Casing",
      [MurderMethod.BLUNT_OBJECT]: "Heavy Brass Candlestick with Bloodstains",
      [MurderMethod.FIRE]: "Accelerant Canister & Melted Lighter",
      [MurderMethod.DROWNING]: "Waterlogged Rope & Heavy Weights",
      [MurderMethod.FALL]: "Tampered Window Latch & Broken Railing",
      [MurderMethod.ELECTROCUTION]: "Stripped Electrical Cable & Moisture Meter",
      [MurderMethod.STAGED_ACCIDENT]: "Severed Brake Line Assembly"
    };
    return map[method] || "Unknown Murder Weapon";
  }

  static _generateEvidenceAndDeductions(victim, killer, suspects, config, crime_location_name) {
    const evidence_list = [];
    const deductions = [];

    // Smoking Gun
    const ev1 = new Evidence({
      id: "EV-001",
      name: `Murder Weapon: ${victim.weapon}`,
      evidence_type: "Weapon",
      description: `Recovered near ${crime_location_name}. Contains bloodstains.`,
      location_found: crime_location_name,
      importance: EvidenceImportance.SMOKING_GUN,
      owner: killer.name,
      testable: true,
      analysis_result: `Forensic lab matching confirms partial fingerprints belonging to ${killer.name} on the handle!`,
      connections: ["EV-002"]
    });
    evidence_list.push(ev1);

    // Fingerprint
    const ev2 = new Evidence({
      id: "EV-002",
      name: "Latent Print on Entry Door",
      evidence_type: "Fingerprint",
      description: `Lifted from entry door of ${crime_location_name}.`,
      location_found: crime_location_name,
      importance: EvidenceImportance.CRITICAL,
      owner: killer.name,
      testable: true,
      analysis_result: `Fingerprint scan confirms 99.8% match with suspect ${killer.name}.`,
      connections: ["EV-001"]
    });
    evidence_list.push(ev2);

    deductions.push(new Deduction({
      id: "DED-01",
      required_evidence_ids: ["EV-001", "EV-002"],
      title: `Direct Link: ${killer.name} handled the murder weapon at the scene!`,
      insight_text: `By combining the fingerprint scan on the entry door with forensic traces on the ${victim.weapon}, you conclusively prove that ${killer.name} was physically present and handled the fatal weapon.`,
      implicated_suspect: killer.name
    }));

    // Financial Paper Trail
    const ev3 = new Evidence({
      id: "EV-003",
      name: "Bank Deposit Slip & Promissory Note",
      evidence_type: "Receipt",
      description: `Found inside victim's safe at ${victim.name}'s house.`,
      location_found: "Victim House",
      importance: EvidenceImportance.CRITICAL,
      owner: killer.name,
      testable: true,
      analysis_result: `Document shows a large unpaid debt owed by ${killer.name} to ${victim.name}.`,
      connections: ["EV-004"]
    });
    evidence_list.push(ev3);

    // Encrypted USB
    const ev4 = new Evidence({
      id: "EV-004",
      name: "Encrypted USB Drive",
      evidence_type: "USB",
      description: "Found tucked behind desk drawer at Corporate Office.",
      location_found: "Office",
      importance: EvidenceImportance.SECONDARY,
      owner: victim.name,
      testable: true,
      analysis_result: `Decrypted logs reveal threatening messages sent from ${killer.name} hours before the murder.`,
      connections: ["EV-003"]
    });
    evidence_list.push(ev4);

    deductions.push(new Deduction({
      id: "DED-02",
      required_evidence_ids: ["EV-003", "EV-004"],
      title: `Motive Unlocked: ${killer.name} killed ${victim.name} over financial debt!`,
      insight_text: `The promissory note and decrypted USB messages establish clear financial extortion and pre-meditated motive by ${killer.name}.`,
      implicated_suspect: killer.name
    }));

    // Red Herrings
    const innocentSuspects = suspects.filter(s => !s.is_guilty);
    const locations = ["Cafe", "Hotel", "Park", "Warehouse", "Apartment", "Library", "Bank"];

    for (let i = 0; i < (config.evidence_count - 4); i++) {
      const innocent = innocentSuspects[i % innocentSuspects.length];
      const loc = locations[i % locations.length];
      evidence_list.push(new Evidence({
        id: `EV-00${i + 5}`,
        name: `Personal Belonging (${innocent.name}'s Handkerchief)`,
        evidence_type: "Clothing",
        description: `Item dropped near ${loc}. Appears to belong to ${innocent.name}.`,
        location_found: loc,
        importance: EvidenceImportance.TRIVIAL,
        owner: innocent.name,
        testable: true,
        analysis_result: `Lab testing reveals no blood or DNA tied to the crime scene. Red herring.`,
        is_red_herring: true
      }));
    }

    return { evidence_list, deductions };
  }
}
