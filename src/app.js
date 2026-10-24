/**
 * app.js - Central UI Controller & DOM Event Handler for The Detective Files Web App.
 */

import { DifficultyLevel } from './constants.js';
import { TimeManager } from './timeSystem.js';
import { Inventory } from './inventory.js';
import { CaseGenerator, Case } from './caseGenerator.js';
import { Victim } from './victim.js';
import { Suspect } from './suspect.js';
import { Evidence } from './evidence.js';
import { Deduction } from './inventory.js';
import { CrimeScene } from './crimeScene.js';
import { LocationMap } from './locations.js';
import { Player } from './player.js';
import { InterrogationSession } from './interrogation.js';
import { RandomEventManager } from './randomEvents.js';
import { ReportGenerator } from './report.js';
import { SaveManager } from './saveManager.js';
import { EndingEvaluator } from './ending.js';

class AppController {
  constructor() {
    window.app = this;

    this.player = new Player();
    this.caseObj = null;
    this.timeMgr = null;
    this.inventory = null;
    this.randomEventMgr = new RandomEventManager();
    
    this.activeSuspect = null;
    this.interrogationSession = null;
    this.selectedDeductionIds = new Set();
    this.selectedAccuseSuspect = null;

    // Expose global window helpers for inline HTML onclick compatibility
    window.showStartScreen = (id) => this.showStartScreen(id);
    window.openLoadScreen = () => this.openLoadScreen();
    window.handleStartNewCaseClick = () => this.handleStartNewCaseClick();

    this.initEventListeners();

    // Auto-generate default initial case on boot so game is 100% active immediately
    try {
      this.startNewCase("Detective Vance", "NORMAL", false);
    } catch (err) {
      console.error("Boot case generation error:", err);
    }

    this.openStartModal();
  }

  initEventListeners() {
    // Navigation Tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        const targetTabId = e.currentTarget.dataset.tab;
        this.switchTab(targetTabId);
      });
    });

    // Notebook Subtabs
    document.querySelectorAll('.sub-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        const targetSubId = e.currentTarget.dataset.subtab;
        document.querySelectorAll('.sub-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.subtab-pane').forEach(p => p.classList.remove('active'));
        e.currentTarget.classList.add('active');
        document.getElementById(targetSubId).classList.add('active');
      });
    });

    // Start Game Modal
    document.getElementById('btn-start-game').addEventListener('click', () => {
      const nameInput = document.getElementById('input-detective-name').value.trim() || "Detective Vance";
      const diffVal = document.getElementById('select-difficulty').value;
      this.startNewCase(nameInput, diffVal);
    });

    // Action Buttons
    document.getElementById('btn-do-search').addEventListener('click', () => this.handleSearchLocation());
    document.getElementById('btn-attempt-deduction').addEventListener('click', () => this.handleAttemptDeduction());
    document.getElementById('btn-confirm-accuse').addEventListener('click', () => this.handleConfirmAccuse());

    // Interrogation Controls
    document.getElementById('btn-ask-victim').addEventListener('click', () => this.handleInterrogateTopic('victim'));
    document.getElementById('btn-ask-alibi').addEventListener('click', () => this.handleInterrogateTopic('alibi'));
    document.getElementById('btn-ask-motive').addEventListener('click', () => this.handleInterrogateTopic('motive'));
    document.getElementById('btn-show-evidence').addEventListener('click', () => this.openEvidencePicker());
    document.getElementById('btn-tone-polite').addEventListener('click', () => this.handleInterrogateTone('polite'));
    document.getElementById('btn-tone-pressure').addEventListener('click', () => this.handleInterrogateTone('pressure'));
    document.getElementById('btn-tone-threaten').addEventListener('click', () => this.handleInterrogateTone('threaten'));
    document.getElementById('btn-cancel-picker').addEventListener('click', () => {
      document.getElementById('modal-evidence-picker').classList.add('hidden');
    });

    // Save / Load / New Case Buttons
    document.getElementById('btn-save').addEventListener('click', () => this.handleSaveGame());
    document.getElementById('btn-load').addEventListener('click', () => this.handleLoadGame());
    document.getElementById('btn-new-case').addEventListener('click', () => this.openStartModal());
    document.getElementById('btn-restart-game').addEventListener('click', () => {
      document.getElementById('modal-ending').classList.add('hidden');
      this.openStartModal();
    });
  }

  showToast(message, type = 'gold') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => {
      toast.remove();
    }, 4000);
  }

  openStartModal() {
    document.getElementById('modal-start').classList.remove('hidden');
  }

  startNewCase(playerName, difficultyStr) {
    this.player = new Player(playerName || "Detective Vance");
    const diff = DifficultyLevel[difficultyStr] || DifficultyLevel.NORMAL;

    this.caseObj = CaseGenerator.generateCase(diff);
    this.timeMgr = new TimeManager(8, 1, this.caseObj.difficulty === 'EASY' ? 7 : (this.caseObj.difficulty === 'HARD' ? 3 : 5));
    this.inventory = new Inventory();
    this.caseObj.deductions.forEach(d => this.inventory.addDeductionRule(d));
    this.randomEventMgr = new RandomEventManager();

    this.player.notebook.addEntry("SYSTEM", `Assigned to ${this.caseObj.title} (${this.caseObj.case_id}).`);
    this.player.notebook.addEntry("VICTIM", `Victim: ${this.caseObj.victim.name}. Cause of Death: ${this.caseObj.victim.cause_of_death}.`);

    document.getElementById('modal-start').classList.add('hidden');
    document.getElementById('case-subtitle').textContent = `${this.caseObj.title} [${this.caseObj.case_id}]`;

    this.showToast(`New case assigned: ${this.caseObj.title}`);
    this.refreshUI();
    this.switchTab('tab-map');
  }

  switchTab(tabId) {
    document.body.dataset.tab = tabId;
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));

    const tabBtn = document.querySelector(`.nav-tab[data-tab="${tabId}"]`);
    const pane = document.getElementById(tabId);
    if (tabBtn && pane) {
      tabBtn.classList.add('active');
      pane.classList.add('active');
    }
  }

  refreshUI() {
    if (!this.caseObj) return;

    try { this.updateHUD(); } catch (e) { console.error("HUD error:", e); }
    try { this.renderMap(); } catch (e) { console.error("Map error:", e); }
    try { this.renderSearchPane(); } catch (e) { console.error("Search error:", e); }
    try { this.renderInterrogationPane(); } catch (e) { console.error("Interrogation error:", e); }
    try { this.renderLabPane(); } catch (e) { console.error("Lab error:", e); }
    try { this.renderDeductionsPane(); } catch (e) { console.error("Deductions error:", e); }
    try { this.renderNotebookPane(); } catch (e) { console.error("Notebook error:", e); }
    try { this.renderNewspaperPane(); } catch (e) { console.error("Newspaper error:", e); }
    try { this.renderAccusePane(); } catch (e) { console.error("Accuse error:", e); }
  }

  updateHUD() {
    if (!this.caseObj) return;
    const currLoc = this.caseObj.location_map.getCurrentLocation();
    const hudLoc = document.getElementById('hud-location');
    if (hudLoc && currLoc) hudLoc.textContent = currLoc.name;
    const hudTime = document.getElementById('hud-time');
    if (hudTime && this.timeMgr) hudTime.textContent = this.timeMgr.getFormattedTime();
    const hudDead = document.getElementById('hud-deadline');
    if (hudDead && this.timeMgr) hudDead.textContent = `${this.timeMgr.getDaysRemaining()} Days Left`;
    const hudInv = document.getElementById('hud-inventory');
    if (hudInv && this.inventory) hudInv.textContent = `${Object.keys(this.inventory.items).length} Items`;

    // Badges
    if (this.timeMgr) {
      const labCount = this.timeMgr.labQueue.length;
      const labBadge = document.getElementById('badge-lab-count');
      if (labBadge) {
        if (labCount > 0) {
          labBadge.textContent = labCount;
          labBadge.classList.remove('hidden');
        } else {
          labBadge.classList.add('hidden');
        }
      }
    }

    if (this.inventory) {
      const unlockedCount = this.inventory.getUnlockedDeductions().length;
      const dedBadge = document.getElementById('badge-deduction-count');
      if (dedBadge) {
        if (unlockedCount > 0) {
          dedBadge.textContent = unlockedCount;
          dedBadge.classList.remove('hidden');
        } else {
          dedBadge.classList.add('hidden');
        }
      }
    }
  }

  // MAP RENDER & TRAVEL
  renderMap() {
    const board = document.getElementById('gps-city-board');
    if (board) {
      board.querySelectorAll('.gps-pin').forEach(el => el.remove());
      const currentLocName = this.caseObj.location_map.currentLocationName;
      for (const [name, loc] of Object.entries(this.caseObj.location_map.locations)) {
        const isOpen = loc.isOpen(this.timeMgr.hour);
        const isCurrent = (name === currentLocName);
        const pin = document.createElement('div');
        pin.className = `gps-pin ${isCurrent ? 'current' : ''} ${!isOpen ? 'closed' : ''}`;
        pin.style.left = `${loc.x || 50}%`;
        pin.style.top = `${loc.y || 50}%`;
        pin.innerHTML = `
          ${isCurrent ? '<div class="gps-you-are-here-badge">📍 YOU ARE HERE</div>' : ''}
          <div class="gps-pin-icon">${loc.icon || "📍"}</div>
          <div class="gps-pin-label">${name}</div>
        `;
        pin.addEventListener('click', () => {
          this.openLocationPopup(loc);
        });
        board.appendChild(pin);
      }
      return;
    }

    const grid = document.getElementById('location-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const currentLocName = this.caseObj.location_map.currentLocationName;

    for (const [name, loc] of Object.entries(this.caseObj.location_map.locations)) {
      const isOpen = loc.isOpen(this.timeMgr.hour);
      const isCurrent = (name === currentLocName);

      const card = document.createElement('div');
      card.className = `location-card ${isCurrent ? 'current' : ''}`;
      card.innerHTML = `
        <div>
          <div class="location-card-header">
            <h3>${name}</h3>
            <span class="${isOpen ? 'location-badge-open' : 'location-badge-closed'}">${isOpen ? 'OPEN' : 'CLOSED'}</span>
          </div>
          <p class="text-sub">${loc.description}</p>
          <div class="location-info-row">
            📍 ${loc.category} | ⏱️ ${loc.travel_minutes} mins travel
          </div>
          <div class="location-info-row">
            👥 Occupants: ${loc.occupants.length} person(s)
          </div>
        </div>
        <div style="margin-top: 1rem;">
          ${isCurrent ? '<button class="btn btn-secondary btn-sm btn-block" disabled>==> Current Location</button>' : `<button class="btn btn-primary btn-sm btn-block btn-travel" data-name="${name}" ${!isOpen ? 'disabled' : ''}>Travel Here (${loc.travel_minutes}m)</button>`}
        </div>
      `;

      grid.appendChild(card);
    }

    grid.querySelectorAll('.btn-travel').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const destName = e.currentTarget.dataset.name;
        const res = this.caseObj.location_map.travelTo(destName, this.timeMgr);
        if (res.success) {
          this.showToast(res.message);
          this.processNotifications(res.notifications);
          this.refreshUI();
        } else {
          this.showToast(res.message, 'danger');
        }
      });
    });
  }

  openLocationPopup(loc) {
    const popup = document.getElementById('gps-location-popup');
    if (!popup) return;

    const currentLocName = this.caseObj.location_map.currentLocationName;
    const isCurrent = (loc.name === currentLocName);
    const isOpen = loc.isOpen(this.timeMgr.hour);

    const iconEl = document.getElementById('gps-popup-icon');
    if (iconEl) iconEl.textContent = loc.icon || '📍';

    const titleEl = document.getElementById('gps-popup-title');
    if (titleEl) titleEl.textContent = loc.name;

    const catEl = document.getElementById('gps-popup-category');
    if (catEl) catEl.textContent = `District Category: ${loc.category}`;

    const badgeEl = document.getElementById('gps-popup-badge');
    if (badgeEl) {
      badgeEl.textContent = isOpen ? 'OPEN' : 'CLOSED';
      badgeEl.className = isOpen ? 'location-badge-open' : 'location-badge-closed';
    }

    const descEl = document.getElementById('gps-popup-desc');
    if (descEl) descEl.textContent = loc.description;

    const travelEl = document.getElementById('gps-popup-travel');
    if (travelEl) travelEl.textContent = `${loc.travel_minutes} mins`;

    const occCountEl = document.getElementById('gps-popup-occupants-count');
    if (occCountEl) occCountEl.textContent = `${loc.occupants.length} person(s)`;

    const occListEl = document.getElementById('gps-popup-occupants-list');
    if (occListEl) {
      occListEl.textContent = loc.occupants.length > 0 
        ? `Suspects Present: ${loc.occupants.join(', ')}` 
        : 'No suspects currently spotted at this location.';
    }

    const btnTravel = document.getElementById('btn-gps-travel');
    if (btnTravel) {
      if (isCurrent) {
        btnTravel.textContent = '📍 You Are Currently Here';
        btnTravel.disabled = true;
      } else if (!isOpen) {
        btnTravel.textContent = '🔒 Venue Closed';
        btnTravel.disabled = true;
      } else {
        btnTravel.textContent = `🚗 Travel Here (${loc.travel_minutes} mins)`;
        btnTravel.disabled = false;
        btnTravel.onclick = () => {
          const res = this.caseObj.location_map.travelTo(loc.name, this.timeMgr);
          if (res.success) {
            this.showToast(res.message);
            this.processNotifications(res.notifications);
            popup.classList.add('hidden');
            this.refreshUI();
          } else {
            this.showToast(res.message, 'danger');
          }
        };
      }
    }

    const btnClose = document.getElementById('gps-popup-close');
    if (btnClose) {
      btnClose.onclick = () => {
        popup.classList.add('hidden');
      };
    }

    popup.classList.remove('hidden');
  }

  // SEARCH SCENE
  renderSearchPane() {
    const currLoc = this.caseObj.location_map.getCurrentLocation();
    document.getElementById('search-location-title').textContent = `Sweep Location: ${currLoc.name}`;
    document.getElementById('search-weather-badge').textContent = `Weather: ${this.caseObj.crime_scene.weather_condition}`;

    let pct = 0;
    if (currLoc.name === this.caseObj.crime_scene.location_name) {
      pct = Math.round(this.caseObj.crime_scene.search_thoroughness * 100);
    } else {
      pct = currLoc.searched ? 100 : 0;
    }

    document.getElementById('search-progress-fill').style.width = `${pct}%`;
    document.getElementById('search-progress-text').textContent = `${pct}% Searched`;
  }

  handleSearchLocation() {
    const currLoc = this.caseObj.location_map.getCurrentLocation();
    const notifications = this.timeMgr.advanceTime(1);

    let foundIds = [];
    let narrative = "";

    if (currLoc.name === this.caseObj.crime_scene.location_name) {
      const res = this.caseObj.crime_scene.performSearch(0.40);
      foundIds = res.discoveredIds;
      narrative = res.narrative;
    } else {
      const res = currLoc.searchLocation();
      foundIds = res.foundIds;
      narrative = res.narrative;
    }

    this.showToast(narrative);

    if (foundIds.length > 0) {
      foundIds.forEach(id => {
        const evMatch = this.caseObj.evidence_list.find(e => e.id === id);
        if (evMatch) {
          this.inventory.addEvidence(evMatch);
          this.player.notebook.addEntry("EVIDENCE", `Found ${evMatch.name} at ${currLoc.name}.`);
        }
      });

      const newlyUnlocked = this.inventory.evaluateDeductions();
      newlyUnlocked.forEach(d => {
        this.showToast(`BREAKTHROUGH: ${d.title}`);
        this.player.notebook.addEntry("DEDUCTION", `Unlocked deduction: ${d.title}`);
      });
    }

    const resultsList = document.getElementById('search-results-list');
    if (foundIds.length > 0) {
      resultsList.innerHTML = foundIds.map(id => {
        const ev = this.inventory.getEvidence(id);
        return `<div class="evidence-mini-card"><strong>[${ev.id}] ${ev.name}</strong><br><span class="text-sub">${ev.description}</span></div>`;
      }).join('');
    } else {
      resultsList.innerHTML = `<p class="text-muted">${narrative}</p>`;
    }

    this.processNotifications(notifications);
    this.refreshUI();
  }

  // INTERROGATION PANE
  renderInterrogationPane() {
    const currLoc = this.caseObj.location_map.getCurrentLocation();
    let presentSuspects = this.caseObj.suspects.filter(s => currLoc.occupants.includes(s.name));

    if (currLoc.name === "Police Station") {
      presentSuspects = this.caseObj.suspects;
    }

    const listContainer = document.getElementById('interrogation-suspect-list');
    listContainer.innerHTML = '';

    if (presentSuspects.length === 0) {
      listContainer.innerHTML = `<p class="text-muted">No suspects present at ${currLoc.name}.</p>`;
      return;
    }

    presentSuspects.forEach(s => {
      const card = document.createElement('div');
      card.className = `suspect-selector-card ${this.activeSuspect === s ? 'active' : ''}`;
      card.innerHTML = `
        <img src="${s.portrait_url}" class="suspect-portrait-img" alt="${s.name}">
        <div>
          <strong>${s.name}</strong>
          <div class="text-sub">${s.relationship_to_victim}</div>
          <div class="text-muted" style="font-size: 0.75rem;">Posture: ${s.getEmotionalStateDescription()}</div>
        </div>
      `;
      card.addEventListener('click', () => {
        const isNewSuspect = (this.activeSuspect !== s);
        this.activeSuspect = s;
        this.interrogationSession = new InterrogationSession(s, this.caseObj.victim, this.inventory, this.timeMgr);
        this.renderActiveInterrogation(isNewSuspect);
        this.renderInterrogationPane();
      });
      listContainer.appendChild(card);
    });
  }

  renderActiveInterrogation(resetDialogue = false) {
    const activeView = document.getElementById('interrogation-active-view');
    const placeholder = document.getElementById('interrogation-placeholder');

    if (!this.activeSuspect || !this.interrogationSession) {
      activeView.classList.add('hidden');
      placeholder.classList.remove('hidden');
      return;
    }

    activeView.classList.remove('hidden');
    placeholder.classList.add('hidden');

    const s = this.activeSuspect;
    document.getElementById('suspect-avatar').innerHTML = `<img src="${s.portrait_url}" class="suspect-portrait-lg" alt="${s.name}">`;
    document.getElementById('interrogate-name').textContent = s.name;
    document.getElementById('interrogate-details').textContent = `${s.occupation} | ${s.relationship_to_victim}`;
    document.getElementById('interrogate-posture').textContent = s.getEmotionalStateDescription();

    // Meters
    document.getElementById('meter-trust').style.width = `${s.trust_level}%`;
    document.getElementById('val-trust').textContent = `${s.trust_level}/100`;

    document.getElementById('meter-fear').style.width = `${s.fear_level}%`;
    document.getElementById('val-fear').textContent = `${s.fear_level}/100`;

    document.getElementById('meter-stress').style.width = `${s.stress_level}%`;
    document.getElementById('val-stress').textContent = `${s.stress_level}/100`;

    document.getElementById('meter-aggression').style.width = `${s.aggression}%`;
    document.getElementById('val-aggression').textContent = `${s.aggression}/100`;

    // Dialogue Box
    if (resetDialogue) {
      const dBox = document.getElementById('dialogue-box');
      dBox.innerHTML = `<p class="dialogue-line System">Started questioning ${s.name}.</p>`;
    }
  }

  appendDialogueLine(speaker, text) {
    const dBox = document.getElementById('dialogue-box');
    const p = document.createElement('p');
    p.className = `dialogue-line ${speaker}`;
    let avatarHTML = "";
    if (speaker === 'Suspect' && this.activeSuspect) {
      avatarHTML = `<img src="${this.activeSuspect.portrait_url}" class="suspect-portrait-thumb" alt="${this.activeSuspect.name}">`;
    }
    p.innerHTML = `${avatarHTML}<strong>${speaker}:</strong> ${text}`;
    dBox.appendChild(p);
    dBox.scrollTop = dBox.scrollHeight;
  }

  handleInterrogateTopic(topic) {
    if (!this.interrogationSession) return;

    let resp = "";
    if (topic === 'victim') {
      resp = this.interrogationSession.askAboutVictim();
      this.appendDialogueLine('Detective', `What was your relationship with ${this.caseObj.victim.name}?`);
    } else if (topic === 'alibi') {
      resp = this.interrogationSession.askAboutAlibi();
      this.appendDialogueLine('Detective', `Where were you during the time of the murder?`);
    } else if (topic === 'motive') {
      resp = this.interrogationSession.askAboutMotive();
      this.appendDialogueLine('Detective', `Did you have any reason to want ${this.caseObj.victim.name} dead?`);
    }

    this.appendDialogueLine('Suspect', resp);
    this.renderActiveInterrogation(false);
  }

  handleInterrogateTone(tone) {
    if (!this.interrogationSession) return;

    const resp = this.interrogationSession.applyToneApproach(tone);
    this.appendDialogueLine('Detective', `[Applied Tactic: ${tone.toUpperCase()}]`);
    this.appendDialogueLine('Suspect', resp);
    this.renderActiveInterrogation(false);
  }

  openEvidencePicker() {
    const list = document.getElementById('evidence-picker-list');
    list.innerHTML = '';

    const items = this.inventory.listEvidence();
    if (items.length === 0) {
      this.showToast("No evidence in inventory.", "danger");
      return;
    }

    items.forEach(ev => {
      const card = document.createElement('div');
      card.className = 'evidence-mini-card';
      card.style.cursor = 'pointer';
      card.innerHTML = `<strong>${ev.name}</strong><br><span class="text-sub">${ev.evidence_type}</span>`;
      card.addEventListener('click', () => {
        document.getElementById('modal-evidence-picker').classList.add('hidden');
        const res = this.interrogationSession.showEvidence(ev.id);
        this.appendDialogueLine('Detective', `[Presented Evidence: ${ev.name}]`);
        this.appendDialogueLine('Suspect', res.text);
        this.renderActiveInterrogation();
      });
      list.appendChild(card);
    });

    document.getElementById('modal-evidence-picker').classList.remove('hidden');
  }

  // LAB PANE
  renderLabPane() {
    const subList = document.getElementById('lab-submission-list');
    subList.innerHTML = '';

    const testableItems = Object.values(this.inventory.items).filter(e => e.testable && !e.tested);
    if (testableItems.length === 0) {
      subList.innerHTML = `<p class="text-muted">No untested, lab-eligible evidence in inventory.</p>`;
    } else {
      testableItems.forEach(ev => {
        const card = document.createElement('div');
        card.className = 'evidence-mini-card';
        card.innerHTML = `
          <strong>[${ev.id}] ${ev.name}</strong> (${ev.evidence_type})
          <button class="btn btn-primary btn-sm mt-2 btn-submit-lab" data-id="${ev.id}">Submit to Lab (3 Hours)</button>
        `;
        subList.appendChild(card);
      });

      subList.querySelectorAll('.btn-submit-lab').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = e.currentTarget.dataset.id;
          const ev = this.inventory.getEvidence(id);
          const waitHrs = this.timeMgr.addToLabQueue(ev.id, ev.name, 3);
          ev.tested = true;
          this.showToast(`Submitted '${ev.name}' to lab. Ready in ${waitHrs} hrs.`);
          this.refreshUI();
        });
      });
    }

    const queueList = document.getElementById('lab-queue-list');
    if (this.timeMgr.labQueue.length === 0) {
      queueList.innerHTML = `<p class="text-muted">No items currently processing in lab.</p>`;
    } else {
      queueList.innerHTML = this.timeMgr.labQueue.map(item => `
        <div class="evidence-mini-card">
          <strong>🔬 ${item.evidenceName}</strong>
          <div class="text-sub">Wait Time Remaining: ${item.remainingHours} in-game hour(s)</div>
        </div>
      `).join('');
    }
  }

  // DEDUCTIONS PANE
  renderDeductionsPane() {
    const selector = document.getElementById('deduction-evidence-selector');
    selector.innerHTML = '';

    const items = this.inventory.listEvidence();
    if (items.length === 0) {
      selector.innerHTML = `<p class="text-muted">No evidence collected yet.</p>`;
    } else {
      items.forEach(ev => {
        const card = document.createElement('div');
        card.className = `evidence-mini-card ${this.selectedDeductionIds.has(ev.id) ? 'tested' : ''}`;
        card.style.cursor = 'pointer';
        card.innerHTML = `
          <input type="checkbox" ${this.selectedDeductionIds.has(ev.id) ? 'checked' : ''}>
          <strong>[${ev.id}] ${ev.name}</strong> (${ev.evidence_type})
        `;
        card.addEventListener('click', () => {
          if (this.selectedDeductionIds.has(ev.id)) {
            this.selectedDeductionIds.delete(ev.id);
          } else {
            this.selectedDeductionIds.add(ev.id);
          }
          this.renderDeductionsPane();
        });
        selector.appendChild(card);
      });
    }

    const unlockedList = document.getElementById('unlocked-deductions-list');
    const unlocked = this.inventory.getUnlockedDeductions();
    if (unlocked.length === 0) {
      unlockedList.innerHTML = `<p class="text-muted">No breakthrough deductions unlocked yet.</p>`;
    } else {
      unlockedList.innerHTML = unlocked.map(d => `
        <div class="evidence-mini-card tested">
          <strong class="text-gold">★ ${d.title}</strong>
          <p class="text-sub mt-1">${d.insight_text}</p>
        </div>
      `).join('');
    }
  }

  handleAttemptDeduction() {
    const newlyUnlocked = this.inventory.evaluateDeductions();
    if (newlyUnlocked.length > 0) {
      newlyUnlocked.forEach(d => {
        this.showToast(`DEDUCTION UNLOCKED: ${d.title}`);
        this.player.notebook.addEntry("DEDUCTION", `Unlocked: ${d.title}`);
      });
    } else {
      this.showToast("Selected clues do not unlock a new deduction.", "danger");
    }
    this.selectedDeductionIds.clear();
    this.refreshUI();
  }

  // NOTEBOOK PANE
  renderNotebookPane() {
    const logsList = document.getElementById('notebook-entries-list');
    logsList.innerHTML = this.player.notebook.entries.map(e => `
      <div style="margin-bottom: 0.75rem; padding-bottom: 0.5rem; border-bottom: 1px rgba(255,255,255,0.05) solid;">
        <span class="text-gold">[${e.timestamp}]</span> <span class="badge-posture">${e.category}</span>
        <div class="text-main mt-1">${e.content}</div>
      </div>
    `).join('');

    document.getElementById('victim-dossier-content').innerHTML = this.caseObj.victim.getAutopsyReportHTML();

    const suspectsContent = document.getElementById('suspects-dossiers-content');
    suspectsContent.innerHTML = this.caseObj.suspects.map(s => `
      <div class="card mb-3" style="display: flex; gap: 1rem; align-items: flex-start;">
        <img src="${s.portrait_url}" class="suspect-portrait-lg" alt="${s.name}">
        <div style="flex-grow: 1;">
          <h3>${s.name} (${s.gender}, Age ${s.age})</h3>
          <p class="text-sub">Occupation: ${s.occupation} | Relation: ${s.relationship_to_victim}</p>
          <p class="text-main mt-2"><strong>Backstory:</strong> ${s.backstory}</p>
          <div class="mt-2 text-gold"><strong>Alibi Timeline:</strong></div>
          <ul style="padding-left: 1.2rem; font-size: 0.85rem;">
            ${Object.entries(s.timeline).map(([t, act]) => `<li><strong>${t}:</strong> ${act}</li>`).join('')}
          </ul>
        </div>
      </div>
    `).join('');
  }

  // NEWSPAPER PANE
  renderNewspaperPane() {
    const container = document.getElementById('newspaper-container');
    container.innerHTML = ReportGenerator.generateNewspaperHTML(this.timeMgr.day, this.caseObj.victim, []);
  }

  // ACCUSE PANE
  renderAccusePane() {
    const grid = document.getElementById('accuse-suspect-list');
    grid.innerHTML = '';

    this.caseObj.suspects.forEach(s => {
      const card = document.createElement('div');
      card.className = `suspect-selector-card ${this.selectedAccuseSuspect === s ? 'active' : ''}`;
      card.innerHTML = `
        <img src="${s.portrait_url}" class="suspect-portrait-img" alt="${s.name}">
        <div>
          <strong>⚖️ ${s.name}</strong>
          <div class="text-sub">${s.relationship_to_victim}</div>
        </div>
      `;
      card.addEventListener('click', () => {
        this.selectedAccuseSuspect = s;
        document.getElementById('btn-confirm-accuse').disabled = false;
        this.renderAccusePane();
      });
      grid.appendChild(card);
    });
  }

  handleConfirmAccuse() {
    if (!this.selectedAccuseSuspect) return;

    const res = EndingEvaluator.evaluateAccusation(
      this.selectedAccuseSuspect,
      this.caseObj.killer,
      this.inventory,
      this.timeMgr,
      this.player.wrong_accusations
    );

    this.displayEndingModal(res);
  }

  displayEndingModal(res) {
    document.getElementById('ending-title').textContent = res.endingType;
    document.getElementById('ending-grade-badge').textContent = res.grade;

    document.getElementById('ending-narrative').innerHTML = `
      <h3>VERDICT SUMMARY</h3>
      ${res.narrative.map(n => `<p>${n}</p>`).join('')}
      <hr style="margin: 1rem 0; border-color: var(--border-color);">
      <p><strong>Actual Killer:</strong> ${this.caseObj.killer.name}</p>
      <p><strong>Murder Weapon:</strong> ${this.caseObj.victim.weapon}</p>
    `;

    document.getElementById('ending-stats').innerHTML = `
      <div class="hud-stat-box"><span class="stat-label">FINAL SCORE</span><span class="stat-value text-gold">${res.score} PTS</span></div>
      <div class="hud-stat-box"><span class="stat-label">DAYS TAKEN</span><span class="stat-value">${this.timeMgr.day} Days</span></div>
    `;

    document.getElementById('modal-ending').classList.remove('hidden');
  }

  processNotifications(notifications) {
    if (notifications && notifications.length > 0) {
      notifications.forEach(n => this.showToast(n));
    }
  }

  triggerAutosave() {
    if (!this.caseObj) return;
    const data = this.serializeFullState();
    SaveManager.saveGame('autosave', data);
  }

  serializeFullState() {
    return {
      player: this.player.toDict(),
      timeMgr: this.timeMgr.toDict(),
      inventory: this.inventory.toDict(),
      caseObj: {
        case_id: this.caseObj.case_id,
        title: this.caseObj.title,
        difficulty: this.caseObj.difficulty,
        victim: this.caseObj.victim.toDict(),
        killer_name: this.caseObj.killer.name,
        suspects: this.caseObj.suspects.map(s => s.toDict()),
        evidence_list: this.caseObj.evidence_list.map(e => e.toDict()),
        deductions: this.caseObj.deductions.map(d => d.toDict()),
        crime_scene: this.caseObj.crime_scene.toDict(),
        location_map: this.caseObj.location_map.toDict()
      },
      randomEventMgr: this.randomEventMgr.toDict()
    };
  }

  handleSaveGame(slotKey = 'slot_1') {
    if (!this.caseObj) {
      this.showToast("No active case to save.", "danger");
      return;
    }
    const data = this.serializeFullState();
    const res = SaveManager.saveGame(slotKey, data);
    this.showToast(res.message);
  }

  handleLoadGame(slotKey = 'slot_1') {
    const res = SaveManager.loadGame(slotKey);
    if (res.success && res.data) {
      try {
        const d = res.data;
        this.player = Player.fromDict(d.player || {});
        this.timeMgr = TimeManager.fromDict(d.timeMgr || {});
        this.inventory = Inventory.fromDict(d.inventory || {});

        const cData = d.caseObj || {};
        const victimObj = Victim.fromDict(cData.victim || {});
        const suspectsList = (cData.suspects || []).map(s => Suspect.fromDict(s));
        const killerObj = suspectsList.find(s => s.name === cData.killer_name) || suspectsList[0];
        const evidenceList = (cData.evidence_list || []).map(e => Evidence.fromDict(e));
        const deductionsList = (cData.deductions || []).map(d => Deduction.fromDict(d));
        const crimeSceneObj = CrimeScene.fromDict(cData.crime_scene || {});
        const locationMapObj = LocationMap.fromDict(cData.location_map || {});

        this.caseObj = new Case({
          case_id: cData.case_id || "CASE-0000",
          title: cData.title || "Restored Case",
          difficulty: cData.difficulty || "NORMAL",
          victim: victimObj,
          killer: killerObj,
          suspects: suspectsList,
          evidence_list: evidenceList,
          deductions: deductionsList,
          crime_scene: crimeSceneObj,
          location_map: locationMapObj
        });

        if (d.randomEventMgr) {
          this.randomEventMgr = RandomEventManager.fromDict(d.randomEventMgr);
        }

        document.getElementById('modal-start').classList.add('hidden');
        document.getElementById('case-subtitle').textContent = `${this.caseObj.title} [${this.caseObj.case_id}]`;
        this.showToast(`Loaded ${this.caseObj.title}!`);
        this.refreshUI();
        this.switchTab('tab-map');
      } catch (err) {
        this.showToast(`Error restoring save state: ${err.message}`, 'danger');
      }
    } else {
      this.showToast(res.message, 'danger');
    }
  }
}

// Instantiate on boot with document.readyState check
function bootApp() {
  if (!window.app) {
    console.log("🕵️ Booting The Detective Files AppController...");
    window.app = new AppController();
  }
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', bootApp);
} else {
  bootApp();
}
