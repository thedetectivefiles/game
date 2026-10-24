/**
 * randomEvents.js - Procedural Daily Case Events Engine.
 */

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export class RandomEventManager {
  constructor(eventProbability = 0.35) {
    this.eventProbability = eventProbability;
    this.triggeredEvents = [];
  }

  evaluateDailyEvents(timeMgr, crimeScene, suspectsList, locationMap) {
    const announcements = [];

    // Weather transition
    if (Math.random() < 0.40) {
      const newWeather = pickRandom(["Torrential Rain", "Dense Fog", "Clear Skies", "Thunderstorm"]);
      crimeScene.weather_condition = newWeather;
      if (newWeather.includes("Rain")) {
        announcements.push(`[EVENT - ADVERSE WEATHER] ${newWeather} has swept over the city! Outdoor searching will be hindered.`);
      }
    }

    if (Math.random() <= this.eventProbability) {
      const eventType = pickRandom([
        "ANONYMOUS_TIP",
        "MEDIA_PRESSURE",
        "CHIEF_DEADLINE",
        "FALSE_CONFESSION",
        "WITNESS_DEPARTURE"
      ]);

      if (eventType === "ANONYMOUS_TIP") {
        const locNames = Object.keys(locationMap.locations);
        const targetLoc = pickRandom(locNames);
        announcements.push(`[EVENT - ANONYMOUS TIP] HQ received a scrambled call at 06:00 AM: 'Check ${targetLoc} before it's too late!'`);
        this.triggeredEvents.push("ANONYMOUS_TIP");
      } else if (eventType === "MEDIA_PRESSURE") {
        announcements.push("[EVENT - MEDIA FRENZY] The Morning Gazette published a front-page editorial demanding an arrest within 48 hours!");
        this.triggeredEvents.push("MEDIA_PRESSURE");
      } else if (eventType === "CHIEF_DEADLINE") {
        announcements.push(`[EVENT - CHIEF OF POLICE] Police Chief Blackwood called: 'Detective, City Hall is breathing down my neck. You have ${timeMgr.getDaysRemaining()} day(s) left!'`);
        this.triggeredEvents.push("CHIEF_DEADLINE");
      } else if (eventType === "FALSE_CONFESSION") {
        const falseSuspect = pickRandom(suspectsList);
        if (falseSuspect && !falseSuspect.is_guilty) {
          announcements.push(`[EVENT - FALSE CONFESSION] A publicity seeker claims ${falseSuspect.name} confessed! Cross-examine their alibi to verify.`);
          this.triggeredEvents.push("FALSE_CONFESSION");
        }
      } else if (eventType === "WITNESS_DEPARTURE") {
        const witness = pickRandom(suspectsList);
        if (witness) {
          announcements.push(`[EVENT - WITNESS AT RISK] Informants report that ${witness.name} has booked an evening flight out of the city!`);
          this.triggeredEvents.push("WITNESS_DEPARTURE");
        }
      }
    }

    return announcements;
  }

  toDict() {
    return { ...this };
  }

  static fromDict(data) {
    const mgr = new RandomEventManager(data.eventProbability || 0.35);
    mgr.triggeredEvents = data.triggeredEvents || [];
    return mgr;
  }
}
