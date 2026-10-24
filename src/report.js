/**
 * report.js - Morning Newspaper Renderer & Warrant Generator.
 */

export class ReportGenerator {
  static generateNewspaperHTML(day, victim, announcements = []) {
    let announcementsHTML = "";
    if (announcements.length > 0) {
      announcementsHTML = `
        <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px dashed #000;">
          <h4>LATEST BREAKING DEVELOPMENTS:</h4>
          <ul>
            ${announcements.map(a => `<li>${a}</li>`).join('')}
          </ul>
        </div>
      `;
    }

    return `
      <h1>THE CITY MORNING GAZETTE</h1>
      <p style="text-align: center; font-size: 0.85rem; margin-bottom: 1rem; font-family: sans-serif;">
        Edition No. ${1040 + day} | Morning Press | Price $1.50 | Day ${day} Investigation
      </p>
      <hr style="border-color: #000;">
      <h2 style="color: #000; text-align: center; font-size: 1.4rem; margin: 1rem 0;">
        HEADLINE: POLICE INTENSIFY HUNT FOR ${victim.name.toUpperCase()}'S KILLER!
      </h2>
      <p><strong>CITY HALL</strong> - The tragic homicide of ${victim.name}, a prominent ${victim.occupation}, has sent shockwaves across the district. Detectives were seen at ${victim.location_of_death} gathering physical evidence and reviewing local CCTV security feeds.</p>
      ${announcementsHTML}
      <hr style="border-color: #000; margin-top: 1.5rem;">
      <p style="font-size: 0.8rem; font-style: italic; font-family: sans-serif;">CITIZEN WARNING: Homicide detectives urge anyone with relevant information to contact Police HQ immediately.</p>
    `;
  }
}
