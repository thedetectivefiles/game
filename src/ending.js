/**
 * ending.js - Multiple Endings & Score Evaluator.
 */

export const EndingType = {
  PERFECT_DETECTIVE: "Perfect Detective - Master Class Conviction",
  CORRECT_WEAK_EVIDENCE: "Correct Accusation with Weak Evidence",
  WRONG_SUSPECT: "Wrong Suspect Arrested - Real Killer Escapes",
  TIME_RAN_OUT: "Deadline Expired - Department Intervened"
};

export class EndingEvaluator {
  static evaluateAccusation(accusedSuspect, killer, inventory, timeMgr, wrongAccusations) {
    const isCorrect = (accusedSuspect.name.toLowerCase() === killer.name.toLowerCase());
    const unlockedDeductions = inventory.getUnlockedDeductions().length;
    const evidenceFound = Object.keys(inventory.items).length;

    let score = 0;
    const narrative = [];
    let endingType = EndingType.WRONG_SUSPECT;

    if (isCorrect) {
      const hasSmokingGun = Boolean(inventory.items["EV-001"] || inventory.items["EV-002"]);
      if (hasSmokingGun && unlockedDeductions >= 2) {
        endingType = EndingType.PERFECT_DETECTIVE;
        score += 1500;
        narrative.push(`PERFECT CONVICTION! You presented undeniable forensic evidence and tight deduction logic.`);
        narrative.push(`${accusedSuspect.name} confessed under interrogation when faced with the smoking gun!`);
        narrative.push(`The District Attorney formally charged ${accusedSuspect.name} with First-Degree Murder.`);
      } else {
        endingType = EndingType.CORRECT_WEAK_EVIDENCE;
        score += 800;
        narrative.push(`CONVICTION WITH WEAK EVIDENCE.`);
        narrative.push(`You named the true murderer, ${accusedSuspect.name}, but lacked conclusive smoking gun forensic proof.`);
        narrative.push(`Defense attorneys will contest the case in court, but justice was partially served.`);
      }
    } else {
      endingType = EndingType.WRONG_SUSPECT;
      score += 100;
      narrative.push(`TRAGIC MISCARRIAGE OF JUSTICE! You arrested ${accusedSuspect.name}, who was entirely innocent.`);
      narrative.push(`Meanwhile, the true killer, ${killer.name}, quietly packed their bags and escaped the city.`);
      narrative.push(`Your detective credentials face severe department scrutiny.`);
    }

    score += unlockedDeductions * 200;
    score += evidenceFound * 50;
    score += timeMgr.getDaysRemaining() * 150;
    score -= wrongAccusations * 300;
    score = Math.max(0, score);

    const grade = this._calculateGrade(score, isCorrect);
    return { endingType, score, grade, narrative, isCorrect };
  }

  static evaluateTimeout(killer) {
    return {
      endingType: EndingType.TIME_RAN_OUT,
      score: 50,
      grade: "F",
      narrative: [
        "CASE DEADLINE EXPIRED!",
        "Police Chief Blackwood relieved you of duty and transferred the case file.",
        `The killer, ${killer.name}, erased their tracks while time slipped away. The case has officially gone cold.`
      ],
      isCorrect: false
    };
  }

  static _calculateGrade(score, isCorrect) {
    if (!isCorrect) return "GRADE F";
    if (score >= 2200) return "GRADE S (Master Detective)";
    if (score >= 1600) return "GRADE A (Senior Investigator)";
    if (score >= 1100) return "GRADE B (Competent Detective)";
    if (score >= 700) return "GRADE C (Junior Agent)";
    return "GRADE D (Probationary)";
  }
}
