<div align="left">

# The Detective Files

**A browser-based procedural detective mystery game, built with vanilla JavaScript, HTML, and CSS.**

*Investigate the scene. Collect evidence. Interrogate suspects. Connect the clues. Decide who is guilty.*

---

## Table of contents

- [Overview](#overview)
- [Features](#features)
- [Quick start](#quick-start)
- [Gameplay](#gameplay)
- [Difficulty levels](#difficulty-levels)
- [How a case is generated](#how-a-case-is-generated)
- [Architecture](#architecture)
- [Project structure](#project-structure)
- [Testing](#testing)
- [Known issues and limitations](#known-issues-and-limitations)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

## Overview

**The Detective Files** is a single-player murder-mystery game that runs entirely in the browser. Every new case is assembled from randomized attributes: the victim, the suspect pool, the method, the motive, the crime location, and the evidence trail. The player travels a city map, searches locations, submits evidence to the lab, interrogates suspects, records deductions, and finally names a killer before the deadline expires.

The project is dependency-free: no framework, no bundler, no database, no build step. It uses native ES modules and the browser's `localStorage` for saves.

> **Scope note.** The generator produces *procedurally varied* cases, which is not the same as a fully branching authored narrative. Some clue relationships and deduction beats are fixed in code. See [Known issues and limitations](#known-issues-and-limitations).

## Features

| Area | Implementation | Notes |
| --- | --- | --- |
| Case generation | Procedural | Randomizes victim, suspects, method, motive, crime location, and evidence placement |
| Difficulty | Easy / Normal / Hard | Scales suspect count, evidence count, deadline, lie probability, and lab speed |
| Characters | Generated profiles | Occupation, personality, relationship, secret, motive, timeline, and psychological stats |
| World | 13-location city map | Opening hours, travel times, and per-location clues and occupants |
| Evidence | Collection and lab analysis | Critical clues and red herrings; lab turnaround scales with difficulty |
| Deduction | Rule-based notebook | Deductions unlock when all required evidence is collected |
| Interrogation | Topics and tone | Ask about the victim, alibi, or motive; present evidence; apply pressure |
| Time | In-game clock and deadline | Travel, interrogation, and lab work all consume time |
| Random events | Daily event manager | Weather, tips, media pressure, and witness changes |
| Endings | Four outcomes plus grading | Perfect, weak-evidence, wrong suspect, and timeout |
| Save/load | Browser `localStorage` | Autosave plus three manual slots |

## Quick start

### Requirements

- A modern browser
- Python 3 (only for the bundled `serve.py` helper)
- Node.js 20 or newer (only for running the test suite)

### Run the game

```bash
git clone https://github.com/thedetectivefiles/game.git
cd game
python serve.py        # or: npm start
```

Then open <http://localhost:8080>.

On Windows, if `python` is not recognized, use `py serve.py`.

The game uses ES modules, which browsers will not load over `file://`. Serve the repository root over HTTP. `serve.py` does this, and any static file server will also work.

### Run the tests

```bash
npm test
```

No `npm install` is needed. The suite uses only Node's built-in test runner.

## Gameplay

1. **Choose a difficulty** and start a new case.
2. **Travel** to locations on the city map. Each trip costs time, and some locations close at night.
3. **Search** locations to recover physical evidence.
4. **Submit evidence to the lab** at the Police Station and wait for the analysis to finish.
5. **Interrogate suspects.** Ask about the victim, alibi, or motive, present evidence, and choose your approach.
6. **Review your notebook.** Deductions unlock when you hold every piece of evidence a rule requires.
7. **Make an accusation** before the deadline. A wrong accusation costs points, and a missed deadline ends the case.

## Difficulty levels

Defined in [`src/constants.js`](src/constants.js):

| Difficulty | Suspects | Evidence items | Time limit | Lie probability | Lab multiplier |
| --- | :---: | :---: | :---: | :---: | :---: |
| Easy | 5 | 12 | 7 days | 15% | 0.75x |
| Normal | 8 | 16 | 5 days | 35% | 1.00x |
| Hard | 12 | 22 | 3 days | 60% | 1.50x |

These are configuration values. They are not a guarantee that every mechanic is balanced, and the automated tests validate structure and rules rather than difficulty tuning.

## How a case is generated

The entry point is `CaseGenerator.generateCase(difficulty)` in [`src/caseGenerator.js`](src/caseGenerator.js). A case is assembled in this order:

1. Select the difficulty configuration.
2. Randomize the murder method, motive, and crime location.
3. Generate the victim profile.
4. Generate the guilty suspect and a pool of innocent suspects.
5. Generate evidence items and deduction rules.
6. Build the crime scene and place evidence and suspects on the location map.
7. Return a `Case` object for the game controller.

### What varies

| Dimension | Pool size |
| --- | --- |
| Murder methods | 9 |
| Motive types | 12 |
| Crime locations | 6 |
| Victim and suspect names, ages, occupations, personalities, relationships, secrets | Drawn from shared pools |

These dimensions produce a large number of combinations, but multiplying the pool sizes does not give a meaningful count of distinct storylines. Some values repeat, some combinations are more likely than others, and the evidence structure is partly fixed.

### Current clue structure

Every case contains a small set of fixed core beats:

- **Weapon and fingerprint link** (`EV-001`, `EV-002`) at the crime scene, unlocking `DED-01`.
- **Financial and motive link** (`EV-003`, `EV-004`) at the victim's house and the office, unlocking `DED-02`.

The remaining evidence slots are filled with red herrings tied to innocent suspects. Cases therefore look different at the character level while sharing investigative beats.

## Architecture

The code is organized as small ES modules with single responsibilities. Game logic is kept free of DOM access, which makes it testable headlessly. Only `app.js` touches the page.

| Module | Responsibility |
| --- | --- |
| `src/app.js` | Application controller: DOM events, rendering, and gameplay flow |
| `src/constants.js` | Difficulty settings and data pools (names, motives, methods, locations) |
| `src/caseGenerator.js` | Builds a case and its evidence and deduction relationships |
| `src/victim.js` | Victim model |
| `src/suspect.js` | Suspect model and interrogation-related state |
| `src/evidence.js` | Evidence model and lab-test state |
| `src/inventory.js` | Evidence inventory and deduction rules |
| `src/crimeScene.js` | Crime scene model |
| `src/locations.js` | Location models, map, travel, and search |
| `src/player.js` | Player state and detective notebook |
| `src/interrogation.js` | Interrogation session logic |
| `src/dialogue.js` | Dialogue generation |
| `src/randomEvents.js` | Random event selection and handling |
| `src/timeSystem.js` | In-game clock, deadline, and lab queue |
| `src/report.js` | Newspaper and report rendering |
| `src/ending.js` | Ending and score evaluation |
| `src/saveManager.js` | Save/load serialization over `localStorage` |

### Runtime flow

```text
index.html
   |
   +--> src/app.js  (AppController)
             |
             +--> CaseGenerator.generateCase()
             |       +--> Victim / Suspect / Evidence
             |       +--> CrimeScene / LocationMap
             |
             +--> Player + Inventory + TimeManager
             +--> InterrogationSession + RandomEventManager
             +--> ReportGenerator + EndingEvaluator
             +--> SaveManager (localStorage)
```

## Project structure

```text
.
├── .github/workflows/ci.yml   # Runs the test suite on Node 20 and 22
├── assets/
│   ├── backgrounds/           # Scene backgrounds
│   └── portraits/             # Character portraits
├── src/                       # Game modules (see Architecture)
├── tests/                     # Automated test suite (see Testing)
├── index.html                 # UI markup
├── style.css                  # Styling
├── serve.py                   # Local static file server (port 8080)
├── package.json               # Scripts only; no dependencies
└── README.md
```

## Testing

The suite uses Node's built-in [`node:test`](https://nodejs.org/api/test.html) runner and `node:assert`. It has **no dependencies** and needs no install step. It exercises the game logic headlessly, without a browser, because the logic modules do not touch the DOM.

### Commands

| Command | Description |
| --- | --- |
| `npm test` | Run the full suite |
| `npm run test:coverage` | Run the suite with Node's built-in coverage report |
| `node --test tests/ending.test.js` | Run a single file |

The suite also runs automatically on every push and pull request through [GitHub Actions](.github/workflows/ci.yml), on Node 20 and 22.

### What is covered

| File | Scope |
| --- | --- |
| `caseGenerator.test.js` | Generator invariants, checked over 150 sampled cases per difficulty (see below) |
| `timeSystem.test.js` | Clock arithmetic, midnight rollover, deadline, lab queue, opening-hour windows, serialization |
| `inventory.test.js` | Evidence model, duplicate handling, sorting, deduction unlocking, serialization |
| `locations.test.js` | Travel cost, closed locations, search behavior, map serialization |
| `ending.test.js` | Every ending, score arithmetic, grade boundaries, penalties, timeout |
| `saveManager.test.js` | Slots, legacy key, metadata defaults, corrupted JSON, storage failures (in-memory `localStorage`) |
| `player.test.js` | Accuracy, accusation tracking, notebook, serialization |
| `playthrough.test.js` | Headless end-to-end runs on all three difficulties |

**Generator invariants** asserted for every sampled case:

- Suspect and evidence counts match the difficulty configuration.
- Exactly one suspect is guilty, and that suspect is the declared killer.
- Suspect names are unique and never match the victim.
- Evidence IDs are unique; every deduction and connection references evidence that exists.
- Every piece of evidence is placed at exactly one valid map location, and every suspect is placed on the map.
- Core clues implicate the killer, and red herrings never do.
- The crime scene agrees with the victim record and with the evidence placed there.
- Murder methods and motives come from the configured pools.
- Output varies across samples.
- The generator is **reproducible** when `Math.random` is replaced with a seeded PRNG.

**Playthrough tests** run the same modules the UI controller uses, on every difficulty. They check that searching every location recovers all evidence exactly once, that the case is solvable (all deductions unlock), that accusing the killer with full evidence yields the perfect ending, and that accusing an innocent suspect fails. Additional tests cover the deadline, lab queue, interrogation flow, and a save-and-restore round trip.

### Coverage

The logic modules that drive the rules are covered close to completely: `caseGenerator`, `ending`, `evidence`, `inventory`, `locations`, `player`, `timeSystem`, and `constants` are at or near 100% line coverage. These modules have **partial or no coverage**:

| Module | Status |
| --- | --- |
| `app.js` | Not covered (DOM controller; needs a browser-level test) |
| `dialogue.js`, `suspect.js`, `victim.js`, `crimeScene.js` | Partially covered, mainly through the playthrough tests |
| `randomEvents.js`, `report.js` | Not covered directly |

### Known-issue tests

The suite documents two confirmed defects as `todo` tests. They run and are reported, but do not fail the build, so they can be turned into regular tests once the bugs are fixed.

| Test | Defect |
| --- | --- |
| `restores a game saved exactly at midnight` | `TimeManager.fromDict` uses `data.hour \|\| 8`, so a saved hour of `0` is restored as `8`. |
| `evidence ids use a consistent zero-padded format` | Evidence IDs are built as `` `EV-00${n}` ``, so Normal and Hard cases contain IDs like `EV-0010`. |

### Manual QA checklist

Automated tests do not cover the UI. Before a release, verify by hand:

- [ ] Start a new case on Easy, Normal, and Hard.
- [ ] Confirm suspect and evidence counts match the selected difficulty.
- [ ] Travel to several locations and collect evidence.
- [ ] Submit evidence for lab analysis and wait for it to complete.
- [ ] Interrogate suspects using each topic and tone.
- [ ] Attempt deductions with both complete and incomplete evidence.
- [ ] Make an accusation and review the ending and report.
- [ ] Save, refresh the page, and load the save.
- [ ] Start a second case and verify the state is fully reset.
- [ ] Check the browser console for errors.

## Known issues and limitations

These are current observations, not a claim that every item is broken.

- **Narrative variety.** Character details are randomized, but core evidence and deduction beats are largely fixed.
- **Storyline count.** There is no honest fixed number of distinct storylines without first defining what counts as one.
- **No seed exposed.** Generation is reproducible under a seeded `Math.random` (the tests demonstrate this), but the game does not yet expose a case seed to players.
- **Defects.** The two issues listed under [Known-issue tests](#known-issue-tests).
- **Test scope.** There are no browser, accessibility, or responsive-layout tests yet, and `app.js` is not covered.
- **Debug tooling.** There is no developer panel for inspecting a case or jumping time and endings.
- **Saves are local.** Saves live in the current browser profile's `localStorage` and are lost if site data is cleared.
- **No backend.** `serve.py` only serves static files; the game has no server-side API or persistence.

## Roadmap

- [ ] Fix the two known defects and promote their `todo` tests to regular tests
- [ ] Expose a case seed so cases can be replayed and shared by ID
- [ ] Multiple evidence graphs and motive-specific clue templates
- [ ] Development-only debug panel for time, evidence, and endings
- [ ] Browser end-to-end tests covering the full investigation loop
- [ ] Automated accessibility and responsive-layout checks
- [ ] Unit tests for `dialogue`, `randomEvents`, `crimeScene`, and `report`
- [ ] Screenshots and a short gameplay GIF in this README
- [ ] Add a license

## Contributing

Issues and suggestions are welcome. Please keep gameplay logic modular and DOM-free, and add or update tests when changing case generation, evidence links, save data, or ending evaluation.

1. Fork the repository.
2. Create a feature branch.
3. Make a focused change.
4. Run `npm test` and make sure it passes.
5. Open a pull request with a clear summary and testing notes.

## License

No license is currently specified. Unless a license is added to the repository, reuse and redistribution rights are not granted. Add a `LICENSE` file before inviting external reuse.
