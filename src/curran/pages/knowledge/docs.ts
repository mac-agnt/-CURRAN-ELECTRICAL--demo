/* Knowledge library for Joe Curran Electrical: internal documents, procedures, videos and job examples.
   Mock content, written to read like real internal field notes. */
import type { SystemKind } from "../../index";

export type Category = "Security Systems" | "Fire Systems" | "Electrical" | "Networking";
export type DocKind = "Procedure" | "Guide" | "Video" | "PDF" | "Technical note" | "Manufacturer" | "Job example" | "Troubleshooting";
export interface KDoc {
  id: string; title: string; cat: Category; sub: string; kind: DocKind; body: string[]; steps?: string[]; updated: string; by: string;
  apprentice?: boolean; duration?: string; pages?: number; jobs?: string[]; sites?: string[]; kinds?: SystemKind[]; keywords: string[]; caveat?: boolean;
}
export const CATS: { id: Category; subs: string[] }[] = [
  { id: "Security Systems", subs: ["Hikvision", "Intruder systems", "CCTV"] },
  { id: "Fire Systems", subs: ["Fire alarm panels", "Commissioning", "Maintenance"] },
  { id: "Electrical", subs: ["Distribution", "Emergency lighting", "EV charging", "Home automation", "Handover"] },
  { id: "Networking", subs: ["Fibre", "Structured cabling", "Wi-Fi"] },
];
export const KIND_ORDER: DocKind[] = ["Procedure", "Guide", "Technical note", "Troubleshooting", "Manufacturer", "PDF", "Video", "Job example"];
export const CAVEAT = "Follow the manufacturer's documentation. This note covers how Joe Curran Electrical does the job, it does not replace it.";

const d = (o: Omit<KDoc, "keywords"> & { keywords?: string[] }): KDoc => ({ keywords: [], ...o });

export const DOCS: KDoc[] = [
  /* ---------------- Security Systems ---------------- */
  d({ id: "d-hik-setup", title: "Hikvision CCTV setup guide", cat: "Security Systems", sub: "Hikvision", kind: "Guide", updated: "2026-09-12", by: "darragh", apprentice: true, pages: 6, kinds: ["CCTV"],
    sites: ["s-park", "s-murphy", "s-cnh", "s-dunloe", "s-golf"],
    keywords: ["hikvision", "cctv", "nvr", "camera", "setup", "ip address", "poe", "install"],
    body: ["Start with the network, not the camera. Agree an IP range with the customer's IT contact, reserve addresses for the NVR and every camera, and keep cameras on their own VLAN or PoE switch where the site has one.",
      "Activate the NVR first and set a strong admin password that goes in the site record, never on a sticky label. Add cameras by their reserved addresses, then set recording to continuous with motion highlighting on reception and car park views.",
      "Aim and focus each camera on site with the monitor in hand. Check night view before leaving, label every cable at both ends and photograph the finished rack for the site record."] }),
  d({ id: "d-hik-nvr", title: "Hikvision NVR quick start", cat: "Security Systems", sub: "Hikvision", kind: "Manufacturer", updated: "2025-05-20", by: "darragh", pages: 24, kinds: ["CCTV"], apprentice: true,
    keywords: ["hikvision", "nvr", "quick start", "ds-7608", "ds-7616", "activation", "manual"],
    body: ["Manufacturer quick start for the DS-7600 NVR range. Covers activation, adding IP cameras, storage initialisation, remote access and the reset button location.", "Our copy has the page numbers we use most flagged: storage initialisation on page 9 and the password reset procedure on page 21. The full PDF is stored with each site record."] }),
  d({ id: "d-hik-cloud", title: "Hik-Connect cloud setup", cat: "Security Systems", sub: "Hikvision", kind: "Technical note", updated: "2026-08-04", by: "seamus", kinds: ["CCTV"], sites: ["s-murphy", "s-dunloe"], jobs: ["J-2652", "J-2674"],
    keywords: ["hik-connect", "cloud", "remote", "subscription", "renewal", "rebill", "4g", "storage"],
    body: ["Cloud storage and remote access are paid to the platform per camera each year. Record the platform cost on the service contract when the site is set up, because it is the number Pulse uses to work out the rebill and the margin.",
      "Register the device under the Joe Curran Electrical installer account, then share it to the customer by email so they own their login. Never register a customer's NVR to a personal account.",
      "Renewal notices arrive from the platform about 45 days out. The Contracts Agent matches them to the contract and drafts the customer invoice."] }),
  d({ id: "v-hik-cam", title: "Aiming and focusing a bullet camera", cat: "Security Systems", sub: "Hikvision", kind: "Video", duration: "9:40", updated: "2026-03-18", by: "darragh", apprentice: true, kinds: ["CCTV"],
    keywords: ["camera", "aim", "focus", "bullet", "lens"], body: ["A two person walkthrough on a live site: setting the field of view, checking the horizon, adjusting the varifocal lens and confirming night view with the IR on."] }),
  d({ id: "d-hik-cam9", title: "Camera drops out in heavy rain", cat: "Security Systems", sub: "Hikvision", kind: "Troubleshooting", updated: "2026-02-03", by: "darragh", kinds: ["CCTV"], sites: ["s-park"],
    keywords: ["camera 9", "drops out", "rain", "poe", "park hotel", "dropout", "water", "termination", "offline"],
    body: ["Symptom: a camera shows offline in heavy rain and returns when it dries. At Park Hotel camera 9 (rear car park) did exactly this.",
      "Cause found on 3 February 2026: moisture in the RJ45 termination inside the junction box, which dropped PoE negotiation. Fix: cut back and re-terminate the run, fit a sealed gland and a drip loop, pack the box with a dielectric gel sleeve.",
      "If it returns, test the cable with the certifier before replacing the camera. Check the PoE port log on the switch for repeated power cycles."] }),
  d({ id: "d-pyr-manual", title: "Pyronix Enforcer engineer manual", cat: "Security Systems", sub: "Intruder systems", kind: "Manufacturer", updated: "2025-02-10", by: "darragh", pages: 72, apprentice: false, kinds: ["Intruder"],
    keywords: ["pyronix", "enforcer", "intruder", "alarm", "keypad", "engineer code", "manual"],
    body: ["Manufacturer engineer manual for the Enforcer 32-WE control panel. The sections we use on site are zone programming, the keypad bus wiring table and the engineer reset procedure.", "Bookmarked pages are listed at the front of our stored copy."] }),
  d({ id: "d-intr-service", title: "Intruder alarm annual service procedure", cat: "Security Systems", sub: "Intruder systems", kind: "Procedure", updated: "2026-06-02", by: "darragh", kinds: ["Intruder"], caveat: true,
    keywords: ["intruder", "service", "pyronix", "annual", "alarm", "walk test", "battery"],
    body: ["Annual service for monitored and unmonitored intruder alarms. Allow about 90 minutes for a small shop."],
    steps: ["Tell the customer and the monitoring station (if monitored) that a test is starting", "Read the event log and note any repeated faults or tamper events", "Walk test every detector and note any weak signals on wireless devices", "Test door contacts, panic buttons and the sounders", "Check the standby battery voltage under load and note the manufacture date", "Test the communicator path, including cloud or monitoring station signalling", "Clear the log, restore the system and confirm the customer's user codes", "Update the site record and photograph the panel label"] }),
  d({ id: "d-pyr-bus", title: "Keypad bus fault finding", cat: "Security Systems", sub: "Intruder systems", kind: "Troubleshooting", updated: "2026-11-03", by: "ciara", kinds: ["Intruder"], sites: ["s-golf"], jobs: ["S-0419"],
    keywords: ["keypad", "bus", "fault", "intruder", "waterville golf", "terminal", "comms", "pyronix"],
    body: ["Symptom: keypad shows a bus comms fault or goes blank intermittently. Check the voltage at the panel and at the keypad first, a drop of more than a volt points to cable length or a poor joint.",
      "At Waterville Golf Links on 3 November the fault was a loose terminal on the bus. Re-seat every terminal on the run before swapping parts, and tighten with the correct screwdriver, not a power tool.",
      "Log the callout against the contract so the visit is billed or covered correctly."] }),
  d({ id: "v-intr-zone", title: "Programming zones and user codes", cat: "Security Systems", sub: "Intruder systems", kind: "Video", duration: "12:15", updated: "2026-01-22", by: "darragh", kinds: ["Intruder"], keywords: ["zones", "user codes", "programming", "intruder"],
    body: ["Step by step programming of zones, entry delays and user codes on an Enforcer panel, with the common mistakes called out."] }),
  d({ id: "d-cctv-design", title: "Camera positioning and signage", cat: "Security Systems", sub: "CCTV", kind: "Technical note", updated: "2026-04-14", by: "darragh", apprentice: true, kinds: ["CCTV"],
    keywords: ["cctv", "positioning", "gdpr", "signage", "privacy", "data protection", "camera"],
    body: ["Cameras must cover what the customer needs to protect and no more. Avoid public footpaths and neighbouring property, and use privacy masking where a view cannot be avoided.",
      "Customers must display clear CCTV signage that names the data controller and a contact. Hand over the signage template and note it on the handover sheet.",
      "Mount at least 2.8 metres up for tamper resistance, aim away from direct sun and keep a service loop of cable behind every camera."] }),
  d({ id: "d-cnh-cctv", title: "Cahersiveen Nursing Home CCTV upgrade", cat: "Security Systems", sub: "CCTV", kind: "Job example", updated: "2026-11-05", by: "ciara", kinds: ["CCTV", "Structured cabling"], sites: ["s-cnh"], jobs: ["J-2671"],
    keywords: ["nursing home", "cahersiveen", "cctv", "access windows", "ceiling void", "infection control"],
    body: ["Eight camera upgrade with first floor cabling. Residents' floors were only accessible from 10:00 to 15:00, which pushed labour about 8 percent over budget.", "Lesson for future care home quotes: allow a restricted access allowance in the labour line and book the infection control method statement before the survey."] }),

  /* ---------------- Fire Systems ---------------- */
  d({ id: "d-kentec-install", title: "Kentec Syncro AS installation guide", cat: "Fire Systems", sub: "Fire alarm panels", kind: "Manufacturer", updated: "2026-10-05", by: "darragh", pages: 48, kinds: ["Fire alarm"], sites: ["s-murphy"],
    keywords: ["kentec", "syncro", "installation", "fire panel", "loop", "manual"],
    body: ["Manufacturer guide for the Syncro AS addressable panel: mounting, loop wiring, power supply and battery sizing, and the commissioning menu map.", "Murphy Retail's panel was installed from this guide, with the loop calculation and battery sizing attached to the commissioning pack."] }),
  d({ id: "d-kentec-reset", title: "Resetting a Kentec Syncro AS panel", cat: "Fire Systems", sub: "Fire alarm panels", kind: "Procedure", updated: "2026-11-06", by: "darragh", kinds: ["Fire alarm"], sites: ["s-murphy"], jobs: ["J-2652"], caveat: true,
    keywords: ["reset", "kentec", "syncro", "panel", "fire alarm", "silence", "fault", "murphy", "restore", "controls"],
    body: ["Use this when a panel has gone into alarm or fault and the cause has been found and made safe. A reset must never be used to clear an alarm that has not been investigated."],
    steps: ["Confirm with the responsible person that it is safe to reset and that the area has been checked", "Identify the cause from the display: note the zone, device address and event time", "Silence the sounders using the Silence Alarms control (access level 2 code needed if the keyswitch is locked)", "Mute the panel buzzer", "Find and clear the cause: smoke, heat, damaged call point, wiring fault or device removed", "Press Reset and wait for the panel to restart the loop, about 30 seconds", "Confirm the display returns to Normal and that no new faults appear", "Record the event in the fire alarm logbook with cause, time and your name", "If the same zone alarms again within an hour, stop and call the office"] }),
  d({ id: "d-mxpro-hb", title: "MxPro 5 Engineer Handbook", cat: "Fire Systems", sub: "Fire alarm panels", kind: "Manufacturer", updated: "2025-11-14", by: "eoin", pages: 96, kinds: ["Fire alarm"], sites: ["s-park", "s-atl"],
    keywords: ["mxpro", "advanced", "handbook", "engineer", "fire panel", "manual", "loop", "zone"],
    body: ["Manufacturer handbook for the Advanced MxPro 5. We use it on Park Hotel and Atlantic Lodge. Key chapters: loop setup and device addressing, zone configuration, event log and fault diagnostics.", "Print the zone chart from the site record before going to the panel."] }),
  d({ id: "d-mxpro-reset", title: "Resetting an Advanced MxPro 5 panel", cat: "Fire Systems", sub: "Fire alarm panels", kind: "Procedure", updated: "2026-09-20", by: "eoin", kinds: ["Fire alarm"], sites: ["s-park", "s-atl"], caveat: true,
    keywords: ["reset", "mxpro", "advanced", "panel", "fire alarm", "park hotel", "silence", "fault"],
    body: ["Reset routine for an MxPro 5 once the cause is found and made safe. Hotels need the duty manager informed before and after."],
    steps: ["Tell the duty manager and agree it is safe to reset", "Read the first event on the display and note zone, device and time", "Silence sounders, then mute the buzzer", "Clear the cause. Check the zone chart for the device location", "Press Reset and wait for loop restart", "Check for new faults and confirm the display shows System Normal", "Enter the event in the logbook", "Hand the logbook back to the duty manager"] }),
  d({ id: "d-gent", title: "Gent Vigilon engineer guide", cat: "Fire Systems", sub: "Fire alarm panels", kind: "Manufacturer", updated: "2024-06-12", by: "darragh", pages: 60, kinds: ["Fire alarm"], sites: ["s-kmc"],
    keywords: ["gent", "vigilon", "legacy", "fire panel", "kerry medical", "obsolete"],
    body: ["Engineer guide for the legacy Gent Vigilon Compact at Kerry Medical Centre. The panel is obsolete and is being replaced under J-2658, but the guide is kept for the transition period and for spares matching."] }),
  d({ id: "d-panel-service", title: "Fire panel service procedure", cat: "Fire Systems", sub: "Maintenance", kind: "Procedure", updated: "2026-07-01", by: "darragh", kinds: ["Fire alarm"], caveat: true,
    keywords: ["fire", "service", "panel", "quarterly", "maintenance", "test", "logbook", "detector", "call point", "is 3218"],
    body: ["Quarterly or six monthly service visit for an addressable fire alarm system, written to follow the intent of IS 3218. Allow half a day for a hotel."],
    steps: ["Agree access and arrange for the alarm receiving centre to be told, if monitored", "Read the logbook and the panel event log since the last visit", "Check the panel for faults, disablements and the supply and battery status", "Test a representative sample of devices so every device is tested across the year", "Test every call point in the sampled zones and the sounder circuits", "Check battery condition and note the manufacture date", "Record all findings in the logbook and give the responsible person a copy", "Tell the customer about any defects with a quote for repair", "Update the site record, set the next service date and photograph the panel front"] }),
  d({ id: "v-panel-walk", title: "Fire panel walkthrough", cat: "Fire Systems", sub: "Fire alarm panels", kind: "Video", duration: "14:20", updated: "2026-05-27", by: "darragh", apprentice: true, kinds: ["Fire alarm"],
    keywords: ["panel", "walkthrough", "display", "controls", "fire"], body: ["A guided look at the front of an addressable panel: what each indicator means, which buttons are safe to press and which need a code."] }),
  d({ id: "d-zone7", title: "Zone 7 kitchen false alarms at Park Hotel", cat: "Fire Systems", sub: "Maintenance", kind: "Troubleshooting", updated: "2026-10-02", by: "darragh", kinds: ["Fire alarm"], sites: ["s-park"],
    keywords: ["zone 7", "false alarm", "kitchen", "extract", "park hotel", "optical", "heat detector", "steam"],
    body: ["Symptom: unwanted alarms from zone 7, the kitchen extract area, mostly during breakfast and dinner service.",
      "Cause: the optical smoke detector was reacting to cooking steam and grease vapour. On 2 October 2026 the optical detector was replaced with a heat detector, which is the correct type for a kitchen. The event log shows no repeat since.",
      "If it returns, check the extract fan is running, check the detector head for grease, and discuss a kitchen specific detector layout with the facilities manager."] }),
  d({ id: "d-comm-proc", title: "Fire alarm commissioning and certification", cat: "Fire Systems", sub: "Commissioning", kind: "Procedure", updated: "2026-10-18", by: "darragh", kinds: ["Fire alarm"], jobs: ["J-2652", "J-2667"], caveat: true,
    keywords: ["commissioning", "certification", "certificate", "handover", "cause and effect", "is 3218", "fire alarm"],
    body: ["Commissioning steps for a new or refitted addressable system, ending in the certificate that goes in the customer's logbook."],
    steps: ["Check every device is installed, addressed and labelled against the schematic", "Verify the loop circuit tests and record readings", "Power up and check the panel configuration against the cause and effect matrix", "Test every device and sounder, and record the sound levels where specified", "Test the cause and effect matrix with the real inputs, including door releases and shutdown relays", "Test fault conditions: open circuit, short circuit and mains failure", "Train the responsible person and complete the logbook", "Issue the commissioning certificate and as-fitted drawings", "Upload the pack to the job and the site record"] }),
  d({ id: "d-murphy-job", title: "Murphy Retail Fit-Out fire alarm", cat: "Fire Systems", sub: "Commissioning", kind: "Job example", updated: "2026-11-09", by: "darragh", kinds: ["Fire alarm"], sites: ["s-murphy"], jobs: ["J-2652"],
    keywords: ["murphy", "retail", "killorglin", "kentec", "fire alarm", "fit-out", "handover"],
    body: ["Two loop Kentec Syncro AS installed during a retail fit-out in Killorglin. Commissioned and certified on 6 November 2026, handed over on 9 November.", "What worked: pre-fabricated loop cables cut the first fix by a day. What to repeat: ask the shopfitter for the ceiling grid layout before the detector plan is drawn."] }),
  d({ id: "d-ce-matrix", title: "Cause and effect matrix template", cat: "Fire Systems", sub: "Commissioning", kind: "PDF", updated: "2025-09-30", by: "darragh", pages: 3, kinds: ["Fire alarm"], keywords: ["cause and effect", "matrix", "template", "commissioning"],
    body: ["Spreadsheet template for the cause and effect matrix. One row per input zone and one column per output. Fill it before commissioning and sign it off with the fire engineer."] }),
  d({ id: "d-fire-log", title: "Fire alarm logbook entries", cat: "Fire Systems", sub: "Maintenance", kind: "Technical note", updated: "2026-03-09", by: "eoin", apprentice: true, kinds: ["Fire alarm"],
    keywords: ["logbook", "fire", "record", "false alarm", "entry"],
    body: ["Every event is written in the logbook: date, time, zone, cause, action taken and who attended. Use plain words, no abbreviations the customer will not understand.", "Entries are legal records. Never leave a gap and never overwrite. If a mistake is made, strike it through with one line and initial it."] }),
  d({ id: "d-kmc-job", title: "Kerry Medical Centre panel replacement", cat: "Fire Systems", sub: "Maintenance", kind: "Job example", updated: "2026-11-10", by: "darragh", kinds: ["Fire alarm"], sites: ["s-kmc"], jobs: ["J-2658"],
    keywords: ["kerry medical", "panel", "replacement", "plant room", "access", "landlord", "upgrade"],
    body: ["Replacement of an obsolete Gent panel with an MxPro in an occupied medical centre. The plant room key is held by the landlord's representative and needs 24 hours notice.", "Lesson: confirm plant room access in writing before the crew is booked, and keep a half day float in the programme for it."] }),

  /* ---------------- Electrical ---------------- */
  d({ id: "d-db-changeover", title: "Distribution board changeover method", cat: "Electrical", sub: "Distribution", kind: "Procedure", updated: "2026-11-03", by: "eoin", jobs: ["J-2641"], sites: ["s-park"], caveat: true,
    keywords: ["distribution", "board", "changeover", "outage", "isolate", "lock off", "db", "hotel"],
    body: ["Method for replacing a live distribution board in an occupied building within an agreed outage window."],
    steps: ["Agree the outage window in writing with the facilities manager and issue the notice to guests or staff", "Prepare the new board, label every way and pre-wire tails where possible", "Isolate at the source, lock off and tag, and prove dead with the voltage indicator", "Disconnect and label the existing circuits one by one", "Fit the new board and connect circuits in the labelled order", "Carry out dead tests: continuity, insulation resistance and polarity on every circuit", "Re-energise in stages and test the RCDs", "Complete the schedule of circuits and the test certificate", "Walk the customer through the restored supplies and remove all locks and tags"] }),
  d({ id: "d-ir-testing", title: "Inspection and testing, certificates", cat: "Electrical", sub: "Distribution", kind: "Technical note", updated: "2026-06-18", by: "ciara", kinds: [],
    keywords: ["inspection", "testing", "certificate", "insulation", "earth fault loop", "rcd", "c&g 2391", "reci"],
    body: ["Every new installation or alteration ends with tested results on the correct certificate. Record insulation resistance, continuity of protective conductors, earth fault loop impedance and RCD trip times for each circuit.",
      "Use the certified test instrument assigned to your van and check its calibration date before use. If a result is marginal, fix it, do not note it.",
      "Certificates are uploaded to the job on the day and sent to the customer with the handover pack."] }),
  d({ id: "d-park-job", title: "Park Hotel Electrical Upgrade", cat: "Electrical", sub: "Distribution", kind: "Job example", updated: "2026-11-09", by: "eoin", jobs: ["J-2641"], sites: ["s-park"],
    keywords: ["park hotel", "kenmare", "upgrade", "distribution", "materials", "variation", "cable prices"],
    body: ["Multi level electrical upgrade in an operating hotel, working floor by floor around guests. Materials ran 11 percent over at 72 percent complete after cable and containment prices rose between quote and order.", "Lesson: put a price validity date on every quote and re-price cable at order stage. A variation for the extra level 3 emergency lighting is drafted to recover most of the gap."] }),
  d({ id: "d-el-inspect", title: "Emergency lighting inspection", cat: "Electrical", sub: "Emergency lighting", kind: "Procedure", updated: "2026-10-30", by: "ciara", kinds: ["Emergency lighting"], sites: ["s-caher", "s-park", "s-kmc"], apprentice: false, caveat: true,
    keywords: ["emergency lighting", "inspection", "test", "flick test", "duration", "register", "certificate", "caherdaniel", "battery"],
    body: ["Six monthly flick test and annual full duration test, recorded in the test register and certificated."],
    steps: ["Tell the premises manager and make sure the building is unoccupied or has a safe alternative", "Check the central or self test controller for logged faults", "Simulate a mains failure for each circuit and walk the building to check every fitting lights", "Annual visit: run the full three hour duration test and check each fitting at the end", "Replace failed lamps or batteries and note the fitting number", "Restore mains and check every charge indicator comes back on", "Update the test register and issue the certificate", "Photograph any fitting that has been moved or blocked and tell the customer"] }),
  d({ id: "d-el-register", title: "Emergency lighting test register", cat: "Electrical", sub: "Emergency lighting", kind: "PDF", updated: "2026-10-30", by: "ciara", pages: 4, kinds: ["Emergency lighting"], sites: ["s-caher", "s-park", "s-kmc", "s-atl"],
    keywords: ["register", "test register", "emergency lighting", "log", "caherdaniel", "fittings", "template"],
    body: ["The register is kept per site. Each row is a fitting number, location, type, test date and result. The Caherdaniel Bay Hotel register covers 74 fittings, last tested 30 October 2026 with four fittings replaced."] }),
  d({ id: "d-el-battery", title: "Battery fault on self test fittings", cat: "Electrical", sub: "Emergency lighting", kind: "Troubleshooting", updated: "2026-06-23", by: "ciara", kinds: ["Emergency lighting"], sites: ["s-park"],
    keywords: ["battery", "fault", "self test", "level 2", "corridor", "fitting 14", "fitting 15", "cold"],
    body: ["Symptom: a self test fitting reports a battery fault, usually in winter. At Park Hotel fittings 14 and 15 on the level 2 corridor flag each year.",
      "Check the battery age first: most are life limited to four years. Replace the pack, reset the self test and confirm the status LED. If the same fitting fails again within a month, check the charging supply and the cable for damage."] }),
  d({ id: "d-ev-comm", title: "EV charger commissioning checklist", cat: "Electrical", sub: "EV charging", kind: "Procedure", updated: "2026-10-28", by: "sean", kinds: ["EV charging"], sites: ["s-dunloe", "s-derr"], jobs: ["J-2674"], caveat: true,
    keywords: ["ev", "charger", "commissioning", "dunloe", "load management", "earth", "rcd", "zappi", "esb"],
    body: ["Commissioning checks for a commercial or domestic EV charge point. Do not energise until the connection agreement from ESB Networks is confirmed."],
    steps: ["Check the connection offer and the approved capacity with ESB Networks", "Verify the supply, earthing arrangement and protective device type", "Test the final circuit: insulation resistance, continuity, earth fault loop impedance and RCD", "Check the charger mounting, glands and cable management", "Configure the charger, set the current limit and enable load management for multiple units", "Energise and run a live charge test with a test vehicle or tester", "Verify tethered cable length and signage", "Register the charger and complete the commissioning certificate", "Hand over the user guide and add the charger to the site record with its serial number"] }),
  d({ id: "v-ev-load", title: "Load management for multiple chargers", cat: "Electrical", sub: "EV charging", kind: "Video", duration: "11:05", updated: "2026-08-19", by: "sean", kinds: ["EV charging"], keywords: ["load management", "ev", "chargers", "current limit"],
    body: ["Walkthrough of balancing four 22 kW chargers on a limited supply, using the CT clamp method, with the app configuration shown on screen."] }),
  d({ id: "d-dunloe-ev", title: "Dunloe Foods EV chargers", cat: "Electrical", sub: "EV charging", kind: "Job example", updated: "2026-11-04", by: "sean", kinds: ["EV charging"], sites: ["s-dunloe"], jobs: ["J-2674"],
    keywords: ["dunloe", "foods", "ev", "chargers", "esb", "connection", "commissioning", "refrigeration"],
    body: ["Four 22 kW chargers on a food production site. Chargers 1 and 2 are mounted. Commissioning of 3 and 4 waits on the ESB Networks connection date.", "Lesson: request the connection offer as soon as the quote is accepted. It is the longest lead item on the job."] }),
  d({ id: "d-knx", title: "KNX ETS project file", cat: "Electrical", sub: "Home automation", kind: "Technical note", updated: "2026-10-20", by: "sean", sites: ["s-hennessy"], jobs: ["J-2663"],
    keywords: ["knx", "ets", "project file", "home automation", "scenes", "hennessy", "programming", "backup"],
    body: ["The ETS project file is the only record of how a KNX installation is programmed. Save a dated copy to the job at the end of every programming day and export a PDF of the group address list.",
      "Keep the customer's scenes in a signed schedule, as at Hennessy Residence, so later changes can be checked against what was agreed."] }),
  d({ id: "d-handover", title: "Site handover checklist", cat: "Electrical", sub: "Handover", kind: "Procedure", updated: "2026-11-09", by: "seamus", apprentice: true, caveat: false,
    keywords: ["handover", "checklist", "completion", "snagging", "certificates", "customer sign off", "as-fitted", "invoice"],
    body: ["Every job ends the same way. Completing the checklist in Pulse is what triggers the Invoice Agent, so do not skip it."],
    steps: ["Walk the site with the customer and clear the snagging list", "Check every circuit and device is labelled", "Upload test certificates and commissioning certificates to the job", "Upload as-fitted drawings and photograph final panels and boards", "Hand over manuals, logbooks and user guides", "Show the customer how to use and reset the system", "Remove all waste and leave the site clean", "Get the signed handover sheet", "Mark the job complete and add a voice note on any open items"] }),

  /* ---------------- Networking ---------------- */
  d({ id: "d-fibre-term", title: "Fibre termination and OTDR testing", cat: "Networking", sub: "Fibre", kind: "Technical note", updated: "2026-02-11", by: "sean", kinds: ["Structured cabling"], sites: ["s-park"],
    keywords: ["fibre", "termination", "otdr", "splice", "loss", "backbone", "om4", "test"],
    body: ["Clean every connector before inspection and never look into a live fibre. Test every link with a power meter and record the loss against the budget, and use an OTDR on any run over 100 metres.",
      "Record results in the cabling schedule on the site record. Park Hotel's OM4 backbone results are the reference for what good looks like."] }),
  d({ id: "v-fibre", title: "Fusion splicing basics", cat: "Networking", sub: "Fibre", kind: "Video", duration: "18:30", updated: "2025-11-05", by: "sean", apprentice: true, kinds: ["Structured cabling"], keywords: ["fusion", "splice", "fibre", "cleave"],
    body: ["Preparing, cleaving and splicing a single mode fibre, and checking the loss estimate on the splicer."] }),
  d({ id: "d-cab-std", title: "Structured cabling standards", cat: "Networking", sub: "Structured cabling", kind: "Technical note", updated: "2026-09-02", by: "sean", apprentice: true, kinds: ["Structured cabling"],
    keywords: ["structured cabling", "cat6", "cat6a", "patch panel", "labelling", "bend radius", "testing", "certifier", "standards"],
    body: ["Our standard is Cat6A for new commercial work and Cat6 for care and domestic. Permanent link maximum 90 metres, patch leads 5 metres each end.",
      "Keep power and data separated, never exceed the bend radius, never untwist more than 13 millimetres at the termination and label both ends of every cable with the outlet ID.",
      "Test every link with the certifier and save the report. The patch panel schedule and the reports go in the site record before handover."] }),
  d({ id: "d-patch", title: "Patch panel schedule", cat: "Networking", sub: "Structured cabling", kind: "PDF", updated: "2026-09-22", by: "ciara", pages: 2, kinds: ["Structured cabling"], keywords: ["patch panel", "schedule", "template", "outlet", "labelling"],
    body: ["Template listing each outlet ID, room, patch panel port, switch port and test result. Fill in as you terminate and hand a copy to the customer's IT contact."] }),
  d({ id: "d-cnh-net", title: "Nurse call and data cabling on residents' floors", cat: "Networking", sub: "Structured cabling", kind: "Job example", updated: "2026-11-05", by: "ciara", kinds: ["Structured cabling"], sites: ["s-cnh"], jobs: ["J-2671"],
    keywords: ["nurse call", "data", "residents", "ceiling void", "cahersiveen", "second floor", "cabling"],
    body: ["First floor terminated, second floor next. Cable routes were agreed with the Director of Nursing so no work happens in residents' rooms outside the 10:00 to 15:00 window.", "Reuse: the cable route drawing and infection control statement are on the job record."] }),
  d({ id: "d-unifi", title: "UniFi controller notes", cat: "Networking", sub: "Wi-Fi", kind: "Technical note", updated: "2026-10-05", by: "sean", sites: ["s-hennessy"], jobs: ["J-2663"], kinds: ["Wi-Fi"],
    keywords: ["unifi", "controller", "wifi", "access point", "ubiquiti", "adoption", "hennessy", "firmware"],
    body: ["Set the controller up under the Joe Curran Electrical site account, adopt the access points, set channel plans manually in dense areas and lock firmware to the tested release.", "Give the customer a local admin login and keep a copy of the backup in the site record. Hennessy Residence runs five access points."] }),
  d({ id: "d-wifi-survey", title: "Whole home Wi-Fi survey and placement", cat: "Networking", sub: "Wi-Fi", kind: "Guide", updated: "2026-09-10", by: "sean", apprentice: true, kinds: ["Wi-Fi"], sites: ["s-hennessy"],
    keywords: ["wifi", "survey", "access point", "placement", "coverage", "thick walls", "stone", "ceiling"],
    body: ["Walk the house with a laptop and note signal strength per room. Stone walls and floors absorb signal, so plan one access point per floor zone, ceiling mounted and cabled, not wireless mesh.", "Keep access points away from metal and out of cupboards. Mark every position on the plan before drilling."] }),
];

export const docById = (id: string) => DOCS.find((x) => x.id === id);
/** Exact title lookup, used to link manuals on a site record to the library. */
export const docByTitle = (t: string) => DOCS.find((x) => x.title.toLowerCase() === t.toLowerCase());
export const PROCEDURES = DOCS.filter((x) => x.kind === "Procedure" && x.steps && x.steps.length);
export const VIDEOS = DOCS.filter((x) => x.kind === "Video");
export const KIND_LABEL: Record<DocKind, string> = {
  Procedure: "Procedure", Guide: "Guide", Video: "Video", PDF: "PDF", "Technical note": "Technical note", Manufacturer: "Manufacturer doc", "Job example": "Previous job", Troubleshooting: "Troubleshooting",
};
/** The best procedure for resetting or servicing a given installed system. */
export function procedureFor(systemId: string, kind: string, make: string): KDoc | undefined {
  if (systemId === "SYS-2001") return docById("d-kentec-reset");
  if (kind === "Fire alarm") return make === "Advanced" ? docById("d-mxpro-reset") : docById("d-panel-service");
  if (kind === "Emergency lighting") return docById("d-el-inspect");
  if (kind === "EV charging") return docById("d-ev-comm");
  if (kind === "Intruder") return docById("d-intr-service");
  if (kind === "CCTV") return docById("d-hik-setup");
  if (kind === "Structured cabling" || kind === "Wi-Fi") return docById("d-cab-std");
  return undefined;
}
