/* ============ ALX Internship — shared data + helpers ============ */
const ALX = {
  STORE: "alx-internship-state-v1",
  THEME: "alx-theme",
  STATUSES: [
    { id: "not-started", label: "Not Started" },
    { id: "in-progress", label: "In Progress" },
    { id: "blocked",     label: "Blocked" },
    { id: "completed",   label: "Completed" },
  ],
  PHASES: [
    {
      id: 1, name: "Week 1", theme: "Community Retention via Coffee Time + Game Day",
      days: [
        { id: 1, label: "Tue · Day 1", tag: "Onboarding", title: "Onboarding & Alignment",
          desc: "Hub tour, team introductions, onboarding. First assignment: the events presentation. Pillar roles assigned by interest; research ALX culture and build a clean proposal deck covering planning, budgeting, and asset outlines." },
        { id: 2, label: "Wed · Day 2", tag: "Pitch", title: "The Pitch — 11:00 AM",
          desc: "Formal presentation to Manager/Team for strategic alignment. Afternoon shifts to internal department resource and procurement requests." },
        { id: 3, label: "Thu · Day 3", tag: "Go-Live", title: "Go-Live & Grassroots Activation",
          desc: "Promotional content and posters deployed across channels. On-the-ground campaign launches at the hub with a localized community photo challenge." },
        { id: 4, label: "Fri · Day 4", tag: "QA", title: "Quality Assurance & Dry Run",
          desc: "Full reconciliation of vendor orders, tech layouts, and setup requirements. Complete technical dry-run rehearsal at the venue." },
        { id: 5, label: "Sat · Day 5", tag: "flag", title: "Live Execution — Coffee Time + Game Day",
          desc: "Joint hosting of Coffee Time + Game Day. Focus on high-energy engagement, culture-building, and attendee metrics." },
      ],
    },
    {
      id: 2, name: "Week 2", theme: "Growth & Pipeline Acquisition",
      days: [
        { id: 7, label: "Mon · Day 7", tag: "Retro", title: "Retrospective & Kickoff",
          desc: "Analysis of Week 1 engagement metrics, and the second project kick-off." },
        { id: 8, label: "Tue · Day 8", tag: "Strategy", title: "Acquisition Strategy",
          desc: "Design an engaging presentation deck optimized for converting prospective learners." },
        { id: 9, label: "Wed · Day 9", tag: "Campaign", title: "Targeted Campaign",
          desc: "Marketing assets deployed across networks. Close coordination with Community Ambassadors to source warm pipelines." },
        { id: 10, label: "Thu · Day 10", tag: "Ops", title: "Operational Efficiency",
          desc: "Secure digital signup pathways (QR codes / forms), validate RSVP data, and finalize catering parameters." },
        { id: 11, label: "Fri · Day 11", tag: "Polish", title: "Presentation Polishing",
          desc: "Mock pitch sessions to train public-speaking clarity, delivery pace, and room preparation." },
        { id: 12, label: "Sat · Day 12", tag: "flag", title: "The Grand Finale",
          desc: "Execute the Applicant Info Session to drive real-time registrations, immediately followed by an Ambassador appreciation mixer." },
      ],
    },
  ],
};
ALX.ALLDAYS = ALX.PHASES.flatMap(p => p.days.map(d => ({ ...d, phase: p.id })));
ALX.statusLabel = id => (ALX.STATUSES.find(s => s.id === id) || ALX.STATUSES[0]).label;

/* ---- state ---- */
ALX.load = function () {
  let s;
  try { s = JSON.parse(localStorage.getItem(ALX.STORE)); } catch (e) { s = null; }
  if (!s || typeof s !== "object") s = {};
  s.tasks = s.tasks || {};
  s.log = Array.isArray(s.log) ? s.log : [];
  s.achievements = Array.isArray(s.achievements) ? s.achievements : [];
  ALX.ALLDAYS.forEach(d => { if (!s.tasks[d.id]) s.tasks[d.id] = { status: "not-started", note: "" }; });
  return s;
};
ALX.save = function (s) { try { localStorage.setItem(ALX.STORE, JSON.stringify(s)); } catch (e) {} };

ALX.metrics = function (s) {
  const total = ALX.ALLDAYS.length;
  const by = id => ALX.ALLDAYS.filter(d => s.tasks[d.id].status === id).length;
  const completed = by("completed");
  return {
    total, completed,
    inProgress: by("in-progress"), blocked: by("blocked"),
    notStarted: by("not-started"),
    pending: total - completed,
    pct: Math.round((completed / total) * 100),
  };
};
ALX.phaseMetrics = function (s, phaseId) {
  const days = ALX.PHASES.find(p => p.id === phaseId).days;
  const done = days.filter(d => s.tasks[d.id].status === "completed").length;
  return { done, total: days.length, pct: Math.round((done / days.length) * 100) };
};

/* ---- theme ---- */
ALX.initTheme = function () {
  const root = document.documentElement;
  try {
    const saved = localStorage.getItem(ALX.THEME);
    if (saved) root.setAttribute("data-theme", saved);
    else if (window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches) root.setAttribute("data-theme", "dark");
  } catch (e) {}
};
ALX.wireToggle = function (btn) {
  if (!btn) return;
  btn.addEventListener("click", () => {
    const root = document.documentElement;
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem(ALX.THEME, next); } catch (e) {}
  });
};

/* ---- scroll reveal ---- */
ALX.reveal = function () {
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
  }), { threshold: .12 });
  document.querySelectorAll(".reveal").forEach(el => io.observe(el));
};

/* ---- misc ---- */
ALX.timeAgo = function (ts) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return Math.floor(s / 60) + "m ago";
  if (s < 86400) return Math.floor(s / 3600) + "h ago";
  return Math.floor(s / 86400) + "d ago";
};

ALX.initTheme();
