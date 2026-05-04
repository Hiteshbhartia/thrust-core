export type KPI = {
  id: string;
  title: string;
  subtitle: string;
  target: number;
  type?: "numeric" | "boolean" | "percent";
};

export type Sprint = {
  number: number;
  time: string;
  title: string;
  subtitle: string;
  items: { time: string; label: string; result: string }[];
  metric: string;
  shield?: boolean;
};

export type CommWindow = {
  label: string;
  channel: string;
  time: string;
};

export type PlaybookContent = {
  roleName: string;
  title: string;
  description: string;
  kpis: KPI[];
  sprints: Sprint[];
  commWindows: CommWindow[];
  rules: { main: string; note: string };
};

export const PLAYBOOK_CONFIGS: Record<string, PlaybookContent> = {
  "POD COMMAND": {
    roleName: "Floor Lead",
    title: "POD COMMAND",
    description: "Own the hub. Every Operator on your pod hits 70 connections, books their tours, and ends the day with a clean CRM.",
    kpis: [
      { id: "connections", title: "Pod avg connections / person", subtitle: "Hub baseline. Below 70 = pipeline starves.", target: 70 },
      { id: "tours", title: "Tours booked from pod", subtitle: "16 booked → 10 done at 60% show-up.", target: 16 },
      { id: "huddle", title: "Morning huddle on time", subtitle: "10:35 sharp. Targets spoken aloud, by name.", target: 1, type: "boolean" },
      { id: "listen_ins", title: "Live calls listened-in", subtitle: "Listen, intervene, score. Not from your desk only.", target: 6 },
      { id: "ride_alongs", title: "Field ride-alongs", subtitle: "2 site visits with Operators today.", target: 2 },
      { id: "crm_ghost", title: "Pod CRM ghost-lead = 0", subtitle: "Every lead has a next-step task by 5 PM.", target: 1, type: "boolean" },
      { id: "c_players", title: "1:1s with C-players", subtitle: "Every C-player gets a written plan today.", target: 100, type: "percent" },
      { id: "kudos", title: "Kudos given (public)", subtitle: "3 named callouts. Energy is a job.", target: 3 },
      { id: "blockers", title: "Blockers closed today", subtitle: "If Operators escalate it, you close it.", target: 5 },
      { id: "eod_signed", title: "Pod EOD report signed", subtitle: "Numbers + 1 hard call + 1 fix for tomorrow.", target: 1, type: "boolean" },
      { id: "owner_checkins", title: "Property-owner check-ins", subtitle: "Inventory health = booking health.", target: 3 },
    ],
    sprints: [
      {
        number: 1, time: "10:30 AM → 12:00 PM", title: "Huddle + CRM Clean", subtitle: "Targets spoken. CRM clean. Pod aligned before first cold call.",
        items: [
          { time: "10:30", label: "Stand-up — every Operator states call + tour target", result: "Targets spoken" },
          { time: "10:45-11:30", label: "CRM audit — assign next-step to ghost leads on the pod", result: "Zero ghosts" },
          { time: "11:30-12:00", label: "Listen-in on 2 cold calls. Coach in real time", result: "2 corrections" }
        ],
        metric: "100% target alignment. CRM ghost-free. 2 live coaching moments."
      },
      {
        number: 2, time: "12:00 PM → 1:15 PM", title: "Field + Owner Pulse", subtitle: "Be where the deals happen. Inventory and trust check.",
        items: [
          { time: "12:00-12:45", label: "1 ride-along with a Mid Operator", result: "Field coaching done" },
          { time: "12:45-1:15", label: "3 owner check-ins — vacancies, complaints, payments", result: "Owner pulse logged" }
        ],
        metric: "1 ride-along + 3 owner calls."
      },
      {
        number: 3, time: "2:30 PM → 4:00 PM", shield: true, title: "Live Coaching Block", subtitle: "Floor coaching at scale. Catch the gap before EOD.",
        items: [
          { time: "2:30-3:30", label: "Listen-in on 4 live calls. Score: ask, objection, close", result: "4 scored" },
          { time: "3:30-4:00", label: "Resolve 5 blockers escalated by Operators", result: "5 closed" }
        ],
        metric: "4 calls scored. 5 blockers closed."
      },
      {
        number: 4, time: "4:00 PM → 5:00 PM", title: "Push to 70", subtitle: "Pull every Operator above 50 connections by 5 PM.",
        items: [
          { time: "4:00-4:30", label: "Public count on the board. Name top 3, name bottom 3", result: "Board updated" },
          { time: "4:30-5:00", label: "Protected sprint for laggards — no comms, calls only", result: "Laggards in sprint" }
        ],
        metric: "All Operators on track for 70+."
      },
      {
        number: 5, time: "5:20 PM → 7:30 PM", title: "1:1s + EOD", subtitle: "Close the day with action plans, not vibes.",
        items: [
          { time: "5:20-6:30", label: "1:1 with every C-player — written plan for tomorrow", result: "Plans signed" },
          { time: "6:30-7:30", label: "Pod EOD report → Nithya & Sneha", result: "Report sent" }
        ],
        metric: "Every C-player has a written plan. EOD signed."
      }
    ],
    commWindows: [
      { label: "Pod Morning Brief", channel: "WhatsApp Group", time: "10:35 AM" },
      { label: "Mid-Day Pod Pulse", channel: "WhatsApp Group", time: "1:00 PM" },
      { label: "Specific Coaching (1:1)", channel: "WhatsApp 1:1", time: "3:30 PM" },
      { label: "Pod EOD", channel: "WhatsApp Group", time: "7:30 PM" }
    ],
    rules: {
      main: "If pod connections < 50% of target by 1:00 PM, OR any Operator below 30 calls by 3 PM → escalate to Nithya at the 1 PM window.",
      note: "If Pod Command fails → Sneha's tours dry up → Jiya's trainees join a broken floor → Nithya's discipline can't save the day."
    }
  },
  "OPERATOR DAY": {
    roleName: "Teammate",
    title: "OPERATOR DAY",
    description: "The heartbeat of the arena. High-velocity connections, precision CRM entries, and 2 booked tours per day.",
    kpis: [
      { id: "connections", title: "Connections (Talk Time > 30s)", subtitle: "The engine. Talk to humans, find the pain.", target: 70 },
      { id: "tours_booked", title: "Tours Booked", subtitle: "2 tours booked per day is the standard.", target: 2 },
      { id: "clean_crm", title: "Clean CRM (0 Ghosts)", subtitle: "No lead left behind. Next-step for everyone.", target: 1, type: "boolean" },
      { id: "huddle_punctual", title: "Huddle Punctuality", subtitle: "On time is late. 10:35 sharp.", target: 1, type: "boolean" },
      { id: "late_followups", title: "Late Follow-ups = 0", subtitle: "Never miss a scheduled callback.", target: 0 },
    ],
    sprints: [
      {
        number: 1, time: "10:35 AM → 1:00 PM", title: "Morning Blitz", subtitle: "Highest energy block. Attack the fresh leads.",
        items: [
          { time: "10:35", label: "Morning huddle — share targets", result: "Target set" },
          { time: "11:00-1:00", label: "40 connections target", result: "40 reached" }
        ],
        metric: "40 connections by 1:00 PM."
      },
      {
        number: 2, time: "2:00 PM → 5:00 PM", title: "Mid-day Blitz", subtitle: "Grind block. Pull the pipeline forward.",
        items: [
          { time: "2:00-5:00", label: "30 connections target + 2 tours", result: "Tours booked" }
        ],
        metric: "70 total connections + 2 tours."
      },
      {
        number: 3, time: "5:00 PM → 6:30 PM", title: "CRM Deep Clean", subtitle: "Zero ghosts. Every lead updated.",
        items: [
          { time: "5:00-6:30", label: "Update all leads from today", result: "CRM Clean" }
        ],
        metric: "0 ghost leads."
      }
    ],
    commWindows: [
      { label: "Morning Huddle", channel: "Floor", time: "10:35 AM" },
      { label: "EOD Update", channel: "WhatsApp Group", time: "6:30 PM" }
    ],
    rules: {
      main: "If connections < 20 by 12:00 PM, flag to Pod Command immediately.",
      note: "Your speed is the hub's oxygen. Slow connections = dead pipeline."
    }
  },
  "LEAD ROUTER": {
    roleName: "Flow Ops",
    title: "LEAD ROUTER",
    description: "Air Traffic Control for every lead. Zero delays, perfect distribution, and absolute CRM integrity.",
    kpis: [
      { id: "response_speed", title: "Inbound Response Speed", subtitle: "Average minutes to first call.", target: 2 },
      { id: "distribution", title: "Lead Distribution", subtitle: "Fair and fast allocation across pods.", target: 100, type: "percent" },
      { id: "sync_status", title: "CRM Sync Status", subtitle: "External sources → CRM sync check.", target: 1, type: "boolean" },
    ],
    sprints: [
      {
        number: 1, time: "10:00 AM → 11:00 AM", title: "Morning Sync", subtitle: "Check all sources. Clear the overnight backlog.",
        items: [
          { time: "10:00", label: "Source audit — check FB, Google, Website", result: "Sources clear" }
        ],
        metric: "0 backlog by 11 AM."
      }
    ],
    commWindows: [
      { label: "Router Sync", channel: "WhatsApp", time: "10:00 AM" }
    ],
    rules: {
      main: "Unassigned leads > 5 for more than 10 mins = Critical Failure.",
      note: "A lead uncalled for 10 mins is a lead lost to the competition."
    }
  }
};

export const DEFAULT_CONFIG: PlaybookContent = {
  roleName: "Operator",
  title: "GENERIC PLAYBOOK",
  description: "Standard operational excellence. Excellence is a habit, not an act.",
  kpis: [
    { id: "task_completion", title: "Tasks Completed", subtitle: "Hit your daily checklist.", target: 10 },
    { id: "attendance", title: "Attendance", subtitle: "Show up, on time.", target: 1, type: "boolean" },
  ],
  sprints: [
    {
      number: 1, time: "10:30 AM → 7:30 PM", title: "Daily Operations", subtitle: "Execute the standard.",
      items: [{ time: "All Day", label: "Operational Excellence", result: "Done" }],
      metric: "Consistency is key."
    }
  ],
  commWindows: [
    { label: "Morning Sync", channel: "WhatsApp", time: "10:30 AM" },
    { label: "Evening Wrap", channel: "WhatsApp", time: "7:30 PM" }
  ],
  rules: {
    main: "Show up. Work hard. Be better than yesterday.",
    note: "Trust is the only currency that matters in the arena."
  }
};
