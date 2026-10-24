/**
 * saveManager.js - LocalStorage Multi-Slot Save/Load Manager with Backward Compatibility.
 */

const PREFIX = "detective_save_";
const LEGACY_KEY = "detective_files_save_slot";

export class SaveManager {
  static saveGame(slotKey = "slot_1", gameStateData) {
    try {
      const fullKey = PREFIX + slotKey;
      const metadata = {
        savedAt: new Date().toLocaleString(),
        detectiveName: gameStateData.player?.name || "Detective Vance",
        caseTitle: gameStateData.caseObj?.title || "Active Case",
        caseId: gameStateData.caseObj?.case_id || "CASE-0000",
        difficulty: gameStateData.caseObj?.difficulty || "NORMAL",
        day: gameStateData.timeMgr?.day || 1,
        timeStr: gameStateData.timeMgr?.timeStr || "Day 1 - 08:00 AM",
        inventoryCount: Object.keys(gameStateData.inventory?.items || {}).length,
        stateData: gameStateData
      };
      const jsonStr = JSON.stringify(metadata);
      localStorage.setItem(fullKey, jsonStr);
      localStorage.setItem(LEGACY_KEY, jsonStr);
      return { success: true, message: `Game saved to ${slotKey.replace('_', ' ').toUpperCase()}.` };
    } catch (e) {
      return { success: false, message: `Save failed: ${e.message}` };
    }
  }

  static loadGame(slotKey = null) {
    try {
      if (slotKey === "legacy") {
        const legacyStr = localStorage.getItem(LEGACY_KEY);
        if (legacyStr) {
          const parsed = JSON.parse(legacyStr);
          return { success: true, data: parsed.stateData || parsed, message: "Loaded previous saved case." };
        }
      }

      if (slotKey) {
        const jsonStr = localStorage.getItem(PREFIX + slotKey);
        if (jsonStr) {
          const parsed = JSON.parse(jsonStr);
          return { success: true, data: parsed.stateData || parsed, message: `Loaded ${parsed.caseTitle || 'saved case'}.` };
        }
      }

      // Check legacy single key
      const legacyStr = localStorage.getItem(LEGACY_KEY);
      if (legacyStr) {
        const parsed = JSON.parse(legacyStr);
        return { success: true, data: parsed.stateData || parsed, message: "Loaded saved case." };
      }

      // Default: find first existing save slot
      const saves = this.listSaves();
      const firstExisting = saves.find(s => s.exists);
      if (firstExisting && firstExisting.key !== 'legacy') {
        return this.loadGame(firstExisting.key);
      }

      return { success: false, data: null, message: "No save files found in storage." };
    } catch (e) {
      return { success: false, data: null, message: `Load failed: ${e.message}` };
    }
  }

  static listSaves() {
    const slots = [
      { key: 'autosave', name: '⚡ Autosave' },
      { key: 'slot_1', name: '💾 Save Slot 1' },
      { key: 'slot_2', name: '💾 Save Slot 2' },
      { key: 'slot_3', name: '💾 Save Slot 3' }
    ];

    const results = [];
    slots.forEach(slot => {
      const jsonStr = localStorage.getItem(PREFIX + slot.key);
      if (jsonStr) {
        try {
          const parsed = JSON.parse(jsonStr);
          results.push({
            key: slot.key,
            name: slot.name,
            exists: true,
            savedAt: parsed.savedAt || "Unknown date",
            detectiveName: parsed.detectiveName || "Detective Vance",
            caseTitle: parsed.caseTitle || "Active Case",
            difficulty: parsed.difficulty || "NORMAL",
            day: parsed.day || 1,
            inventoryCount: parsed.inventoryCount || 0
          });
        } catch (e) {
          results.push({ key: slot.key, name: slot.name, exists: false });
        }
      } else {
        results.push({ key: slot.key, name: slot.name, exists: false });
      }
    });

    // Check legacy key
    const legacyStr = localStorage.getItem(LEGACY_KEY);
    if (legacyStr) {
      try {
        const parsedLegacy = JSON.parse(legacyStr);
        const legacyTitle = parsedLegacy.caseTitle || parsedLegacy.caseObj?.title || "Active Saved Case";
        results.unshift({
          key: 'legacy',
          name: '💾 Previous Session Case',
          exists: true,
          savedAt: parsedLegacy.savedAt || "Recent Session",
          detectiveName: parsedLegacy.detectiveName || parsedLegacy.player?.name || "Detective Vance",
          caseTitle: legacyTitle,
          difficulty: parsedLegacy.difficulty || parsedLegacy.caseObj?.difficulty || "NORMAL",
          day: parsedLegacy.day || parsedLegacy.timeMgr?.day || 1,
          inventoryCount: parsedLegacy.inventoryCount || 0
        });
      } catch (e) {}
    }

    return results;
  }
}
