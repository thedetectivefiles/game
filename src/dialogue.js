/**
 * dialogue.js - Dynamic Interrogation Dialogue Generator.
 */

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export class DialogueGenerator {
  static getGreeting(suspect) {
    if (suspect.aggression > 70) {
      return pickRandom([
        "What do you want from me, Detective? I have important work to do.",
        "Am I under arrest? If not, stop wasting my time.",
        "I've already answered your officers. Why drag this out?"
      ]);
    } else if (suspect.fear_level > 60) {
      return pickRandom([
        "D-Detective... please, I don't know anything! Why am I being questioned?",
        "Is everyone saying I had something to do with this? That's false!",
        "I'm terrified. Someone killed " + suspect.relationship_to_victim + "... could I be next?"
      ]);
    } else if (suspect.trust_level > 65) {
      return pickRandom([
        "Good to see you, Detective. Anything I can do to help catch whoever did this.",
        "Hello Detective. I'm ready to answer whatever questions you have.",
        "Please tell me you have a lead on the killer. What can I clarify?"
      ]);
    } else {
      return `Hello, Detective. How can I assist with the investigation?`;
    }
  }

  static answerAboutVictim(suspect, victim) {
    suspect.recordQuestion("victim");

    if (suspect.is_guilty) {
      if (suspect.trust_level < 40 || suspect.aggression > 50) {
        return pickRandom([
          `Look, ${victim.name} and I had our differences, but I didn't murder them!`,
          `We worked together, that's all. I barely knew what ${victim.name} did in private.`,
          `Everyone knows ${victim.name} could be difficult, but murder? That's shocking.`
        ]);
      } else {
        return `It's a terrible tragedy. ${victim.name} was a ${victim.occupation} with great potential. I can't imagine who would commit such an act.`;
      }
    }

    if (["Bitter Rival", "Debt Collector", "Estranged Spouse"].includes(suspect.relationship_to_victim)) {
      return pickRandom([
        `I won't lie: ${victim.name} and I clashed frequently. But hating someone's guts doesn't make me a murderer!`,
        `Sure, we argued over money. But I was nowhere near the scene when it happened!`,
        `${victim.name} owed people money and made enemies everywhere. Look into their business dealings.`
      ]);
    } else {
      return pickRandom([
        `${victim.name} was my ${suspect.relationship_to_victim.toLowerCase()}. We spoke regularly. I'm still in shock.`,
        `I always knew ${victim.name} as a ${victim.personality.toLowerCase()} person. I never suspected they were in danger.`,
        `We were close. I just hope you catch whoever committed this terrible crime.`
      ]);
    }
  }

  static answerAboutAlibi(suspect) {
    suspect.recordQuestion("alibi");

    if (!suspect.timeline || Object.keys(suspect.timeline).length === 0) {
      return "I don't remember the exact hourly breakdown, Detective. It was a normal day.";
    }

    const lines = [`Here is exactly what I was doing around the time of the crime:`];
    for (const [slot, activity] of Object.entries(suspect.timeline)) {
      lines.push(`- At ${slot}: ${activity}`);
    }

    if (suspect.is_guilty && !suspect.alibi_is_verified) {
      lines.push("\n(They pause slightly, avoiding direct eye contact while explaining.)");
    } else if (suspect.alibi_witness) {
      lines.push(`\n${suspect.alibi_witness} can confirm I was there!`);
    }

    return lines.join("\n");
  }

  static answerAboutMotive(suspect) {
    suspect.recordQuestion("motive");

    if (suspect.possible_motive) {
      if (suspect.trust_level > 60) {
        return `I know people talk about ${suspect.possible_motive.toLowerCase()}. I won't pretend it didn't bother me, but it is NOT why ${suspect.relationship_to_victim} died.`;
      } else if (suspect.aggression > 60) {
        return `That's absurd! Pointing fingers at ${suspect.possible_motive.toLowerCase()} is lazy police work!`;
      } else {
        return `That issue was resolved long ago. Connecting that to the murder is ridiculous.`;
      }
    } else {
      return `Motive? I had zero reason to hurt ${suspect.relationship_to_victim}. We had no serious disputes.`;
    }
  }

  static reactToEvidence(suspect, evidence) {
    suspect.recordEvidenceShown(evidence.id);

    const isTied = (
      evidence.owner.toLowerCase().includes(suspect.name.toLowerCase()) ||
      evidence.description.toLowerCase().includes(suspect.name.toLowerCase()) ||
      evidence.analysis_result.toLowerCase().includes(suspect.name.toLowerCase())
    );

    if (isTied) {
      if (suspect.is_guilty) {
        suspect.adjustMood({ deltaFear: 25, deltaStress: 30, deltaTrust: -20 });
        return pickRandom([
          `(Panics visibly) Where did you get that?! That doesn't prove anything! I was set up!`,
          `(Stammers) That '${evidence.name}'... I lost that days ago! Someone must have planted it!`,
          `(Hands shaking) Alright! I might have been there, but I didn't pull the trigger!`
        ]);
      } else {
        suspect.adjustMood({ deltaStress: 20, deltaFear: 15 });
        return `Wait, that's mine! But I can explain how '${evidence.name}' got there! I left it behind earlier during the week.`;
      }
    } else {
      return `(Examines ${evidence.name}) I've never seen this item before in my life, Detective. It has nothing to do with me.`;
    }
  }

  static reactToPressure(suspect, approach) {
    if (approach === "polite") {
      suspect.adjustMood({ deltaTrust: 15, deltaFear: -10, deltaAggression: -10 });
      return pickRandom([
        "Thank you for treating me with respect, Detective. It makes this easier.",
        "I appreciate your fair approach. I'll tell you whatever I know.",
        "Your professionalism is refreshing. Ask away."
      ]);
    } else if (approach === "pressure") {
      suspect.adjustMood({ deltaStress: 20, deltaFear: 15, deltaTrust: -10 });
      if (suspect.confidence < 50) {
        return "(Sweating profusely) Stop pushing me! I'm trying to think clearly!";
      } else {
        return "Pressuring me won't change the facts, Detective. I stand by my statements.";
      }
    } else if (approach === "threaten") {
      suspect.adjustMood({ deltaAggression: 30, deltaTrust: -30, deltaFear: 20 });
      if (suspect.is_guilty && suspect.fear_level > 65) {
        return "(Breaks down) Fine! Stop threatening me with prison! I'll talk if you talk to the prosecutor!";
      } else if (suspect.aggression > 60) {
        return "Threatening me? That's it! I am NOT answering another question without my lawyer present!";
      } else {
        return "You can threaten all you want, Detective. You have no right to intimidate me.";
      }
    }
    return "The suspect looks at you silently.";
  }
}
