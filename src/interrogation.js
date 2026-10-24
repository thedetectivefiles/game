/**
 * interrogation.js - Interrogation Session State Controller.
 */

import { DialogueGenerator } from './dialogue.js';

export class InterrogationSession {
  constructor(suspect, victim, inventory, timeMgr) {
    this.suspect = suspect;
    this.victim = victim;
    this.inventory = inventory;
    this.timeMgr = timeMgr;
    this.turnsTaken = 0;
    this.sessionActive = true;

    // Opening interrogation session consumes 1 hour
    this.timeMgr.advanceTime(1);
  }

  askAboutVictim() {
    this.turnsTaken++;
    return DialogueGenerator.answerAboutVictim(this.suspect, this.victim);
  }

  askAboutAlibi() {
    this.turnsTaken++;
    return DialogueGenerator.answerAboutAlibi(this.suspect);
  }

  askAboutMotive() {
    this.turnsTaken++;
    return DialogueGenerator.answerAboutMotive(this.suspect);
  }

  showEvidence(evidenceId) {
    const item = this.inventory.getEvidence(evidenceId);
    if (!item) return { success: false, text: "Item not in inventory." };

    this.turnsTaken++;
    const text = DialogueGenerator.reactToEvidence(this.suspect, item);
    return { success: true, text };
  }

  applyToneApproach(approach) {
    this.turnsTaken++;
    let text = DialogueGenerator.reactToPressure(this.suspect, approach);

    if (this.suspect.aggression >= 90) {
      this.sessionActive = false;
      text += "\n\n[!] SUSPECT TERMINATED INTERROGATION! They refuse to speak further without legal counsel.";
    }

    return text;
  }
}
