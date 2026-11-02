import { Job, TODAY, addDays } from "../index";

export const SCOPE: Record<string, string[]> = {
  "J-2641": ["Second fix, level 3 rooms", "Prepare board for changeover on Friday night", "Label every circuit as you go"],
  "J-2652": ["Final walk-round with Brian Murphy", "Hand over commissioning certificate and as-fitted drawings"],
  "J-2658": ["Test and label first floor corridor detectors", "Plant room: fit new panel and loop wiring, needs the key", "Update the zone chart"],
  "J-2663": ["Programme heating zones in ETS", "Test lighting scenes with Fiona", "Label KNX actuators in the utility room"],
  "J-2667": ["Fit loop 2 and loop 3 devices", "Prepare for loop testing on Thursday", "Emergency lighting second fix, bedroom wing"],
  "J-2671": ["Second floor cabling and terminations", "Residents' rooms only open 10:00 to 15:00", "Infection control method statement applies"],
  "J-2674": ["Mount chargers 3 and 4", "Run supply containment to the refrigeration plant", "Chase ESB Networks for the connection date"],
};

export function checklistFor(j: Job): string[] {
  const t = j.type.toLowerCase();
  if (t.includes("fire")) return ["Zone chart updated", "All devices addressed and tested", "Sounder levels checked", "Panel fault log cleared", "Photos of panel and devices"];
  if (t.includes("automation")) return ["Lighting scenes tested", "Heating zones tested", "Actuators labelled", "Customer shown the app", "Photos taken"];
  if (t.includes("security") || t.includes("data")) return ["Terminations tested", "Patch panel labelled", "Cable test results saved", "Cameras aimed and checked", "Photos taken"];
  return ["Isolation and lock-off checked", "Circuits labelled", "Test results recorded", "Site tidy, waste removed", "Photos taken"];
}

export interface VoiceScript { transcript: string; from: number; to: number; update: string; task?: { text: string; owner: string; due: string }; issue?: { text: string; owner: string; impact: string } }
export const VOICE: Record<string, VoiceScript> = {
  "J-2658": { transcript: "Corridor detectors are fitted and tested on the first floor, so that's the first floor done. I can't start the plant room because I haven't got the key. The landlord's rep is not back until Thursday. Darragh, can you chase him?", from: 44, to: 48, update: "First floor corridor detectors fitted and tested. Plant room not started, key unavailable.", task: { text: "Chase landlord's rep for the plant room key", owner: "darragh", due: "Wed 11 Nov" }, issue: { text: "Plant room access unavailable", owner: "seamus", impact: "Possible 1 day delay to completion" } },
  "J-2641": { transcript: "Second fix is done on level 3. Board changeover is Friday night and the hotel has agreed four hours. I need Maeve to confirm that in writing.", from: 70, to: 72, update: "Level 3 second fix complete. Board changeover agreed for Friday night, 4 hour window.", task: { text: "Confirm the Friday outage in writing with Maeve Sheehy", owner: "eoin", due: "Wed 11 Nov" } },
  "J-2652": { transcript: "Snagging is cleared and the customer has signed the handover sheet. The panel is commissioned and the certificate is on the system.", from: 97, to: 100, update: "Snagging cleared, handover signed, panel commissioned.", task: { text: "Approve the draft invoice for Murphy Retail", owner: "seamus", due: "Today" } },
  "J-2663": { transcript: "Ground floor lighting scenes are programmed and Fiona is happy with them. Heating zones are next.", from: 82, to: 85, update: "Ground floor lighting scenes programmed and approved by the customer.", task: { text: "Send Fiona the heating scene sign-off sheet", owner: "seamus", due: "Fri 13 Nov" } },
  "J-2667": { transcript: "Loop 2 and loop 3 devices are all fitted. Loop testing starts Thursday. I'm short six detector bases.", from: 52, to: 55, update: "Loop 2 and loop 3 devices fitted. Loop testing starts Thursday.", task: { text: "Order 6 detector bases from Southwest Fire and Security", owner: "liam", due: "Wed 11 Nov" } },
  "J-2671": { transcript: "Ceiling voids on the first floor took longer than planned. The rooms are only open ten to three. Second floor is next.", from: 58, to: 60, update: "First floor ceiling voids finished. Working within 10:00 to 15:00 access windows.", issue: { text: "Restricted access windows slowing labour", owner: "seamus", impact: "Labour running over budget" } },
  "J-2674": { transcript: "Chargers one and two are mounted. I'm still waiting on ESB Networks for a connection date.", from: 28, to: 30, update: "Chargers 1 and 2 mounted. Waiting on ESB connection date.", task: { text: "Chase ESB Networks for the connection date", owner: "sean", due: "Fri 13 Nov" }, issue: { text: "ESB connection date not confirmed", owner: "sean", impact: "Could affect December commissioning" } },
};

export const MATERIALS = ["Cat6 cable, 305 m box", "3 core 2.5 mm cable, 100 m", "Detector head", "Call point", "20 A MCB", "Cable clips, bag of 100", "Back box, 35 mm", "Fire rated cable, 100 m"];
export const ISSUE_KINDS = ["Access problem", "Missing materials", "Safety concern", "Customer request", "Fault found", "Drawing is wrong"];
export const CONSTRAINT_KINDS = ["Access unavailable", "Waiting on another trade", "Waiting on customer", "Weather", "Waiting on supplier"];
export const START_TIME = "07:30";
export const NOW_TIME = "09:24";
export const tomorrow = () => addDays(TODAY, 1);
