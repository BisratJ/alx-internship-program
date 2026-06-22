/* ============ ALX Intern Manager - data layer + store API ============ */
/* Free, client-side (localStorage). Structured so it can later swap to a
   free Supabase tier without changing the UI: all access goes through `Store`. */

const IM = {
  KEY: "alx-im-state-v3",
  SESSION: "alx-im-session",
  THEME: "alx-theme",
  STATUSES: [
    { id: "not_started", label: "Not Started" },
    { id: "in_progress", label: "In Progress" },
    { id: "blocked",     label: "Blocked" },
    { id: "completed",   label: "Completed" },
  ],
  PHASES: [
    { id: 1, name: "Week 1", theme: "Community Retention via Coffee Time + Game Day",
      days: [
        { id: 1, label: "Tue · Day 1", title: "Onboarding & Alignment", tag: "Onboarding", desc: "Hub tour, team intros, onboarding. First assignment: the events presentation. Research ALX culture and build a clean proposal deck (planning, budgeting, asset outlines)." },
        { id: 2, label: "Wed · Day 2", title: "The Pitch (11:00 AM)", tag: "Pitch", desc: "Formal presentation to Manager/Team for strategic alignment. Afternoon: internal resource and procurement requests." },
        { id: 3, label: "Thu · Day 3", title: "Go-Live & Grassroots Activation", tag: "Go-Live", desc: "Promotional content and posters deployed across channels. On-the-ground campaign launches at the hub with a community photo challenge." },
        { id: 4, label: "Fri · Day 4", title: "Quality Assurance & Dry Run", tag: "QA", desc: "Reconcile vendor orders, tech layouts, setup. Full technical dry-run rehearsal at the venue." },
        { id: 5, label: "Sat · Day 5", title: "Live Execution: Coffee Time + Game Day", tag: "Flagship", flag: true, desc: "Joint hosting of Coffee Time + Game Day. High-energy engagement, culture-building, attendee metrics." },
      ] },
    { id: 2, name: "Week 2", theme: "Growth & Pipeline Acquisition",
      days: [
        { id: 6, label: "Tue · Day 6", title: "Retrospective & Kickoff", tag: "Retro", desc: "Analyze Week 1 engagement metrics; kick off the second project." },
        { id: 7, label: "Wed · Day 7", title: "Acquisition Strategy", tag: "Strategy", desc: "Design a presentation deck optimized for converting prospective learners." },
        { id: 8, label: "Thu · Day 8", title: "Targeted Campaign", tag: "Campaign", desc: "Deploy marketing assets across networks; coordinate with Community Ambassadors for warm pipelines." },
        { id: 9, label: "Fri · Day 9", title: "Operational Efficiency & Polishing", tag: "Ops", desc: "Secure signup pathways (QR/forms), validate RSVP data, finalize catering, and run mock pitch sessions for delivery and room prep." },
        { id: 10, label: "Sat · Day 10", title: "The Grand Finale", tag: "Flagship", flag: true, desc: "Applicant Info Session driving real-time registrations, followed by an Ambassador appreciation mixer." },
      ] },
  ],
};
IM.ALLDAYS = IM.PHASES.flatMap(p => p.days.map(d => ({ ...d, phase: p.id })));
IM.statusLabel = id => (IM.STATUSES.find(s => s.id === id) || IM.STATUSES[0]).label;

IM.USERS = [
  { id: "u-admin",    name: "Admin",          email: "admin@alxinternship.app", role: "admin",  pillar: "Program Manager" },
  { id: "u-bitania",  name: "Bitania Dereje", email: "biti.dereje@gmail.com",   role: "intern", pillar: "Event Details Lead" },
  { id: "u-yosabeth", name: "Yosabeth Yared", email: "yosabethyared@gmail.com", role: "intern", pillar: "Marketing & Content" },
  { id: "u-juliana",  name: "Juliana Mussie", email: "julianamussie@gmail.com", role: "intern", pillar: "Outreach & Leads" },
  { id: "u-mariam",   name: "Mariam Sami",    email: "mariam2010sami@gmail.com",role: "intern", pillar: "Ops & Budget Control" },
];
IM.COHORT = { name: "Addis Sprint · Jun 2026" };

/* ---------- clean production seed (no demo data) ---------- */
function seedState() {
  const s = { progress: {}, logs: {}, journal: {}, deliverables: {}, achievements: {}, feedback: {} };
  IM.USERS.filter(u => u.role === "intern").forEach(u => {
    s.progress[u.id] = {};     // all tasks start "not_started"
    s.logs[u.id] = [];
    s.journal[u.id] = [];
    s.deliverables[u.id] = [];
    s.achievements[u.id] = [];
    s.feedback[u.id] = [];
  });
  return s;
}

/* ---------- Store: the only thing the UI talks to ---------- */
const Store = {
  _state: null,
  init() {
    let s; try { s = JSON.parse(localStorage.getItem(IM.KEY)); } catch (e) { s = null; }
    if (!s || !s.progress) s = seedState();
    this._state = s; this._save();
    return this;
  },
  _save() { try { localStorage.setItem(IM.KEY, JSON.stringify(this._state)); } catch (e) {} },

  /* session / auth (demo: pick a profile; swap for OAuth later) */
  login(userId) { try { localStorage.setItem(IM.SESSION, userId); } catch (e) {} },
  logout() { try { localStorage.removeItem(IM.SESSION); } catch (e) {} },
  currentUser() {
    let id; try { id = localStorage.getItem(IM.SESSION); } catch (e) {}
    return IM.USERS.find(u => u.id === id) || null;
  },

  users: () => IM.USERS,
  user: id => IM.USERS.find(u => u.id === id),
  interns: () => IM.USERS.filter(u => u.role === "intern"),

  progress(internId) {
    const p = this._state ? this._state.progress[internId] : Store._state.progress[internId];
    return p || {};
  },
  setStatus(internId, taskId, status, note) {
    const st = Store._state; st.progress[internId] = st.progress[internId] || {};
    st.progress[internId][taskId] = { status, note: note || (st.progress[internId][taskId]||{}).note || "", updatedAt: Date.now() };
    st.logs[internId] = st.logs[internId] || [];
    st.logs[internId].unshift({ id: "l" + Date.now(), taskId, status, note: note || "", ts: Date.now() });
    st.logs[internId] = st.logs[internId].slice(0, 60);
    Store._save();
  },
  setNote(internId, taskId, note) {
    const st = Store._state; st.progress[internId][taskId] = st.progress[internId][taskId] || { status: "not_started", updatedAt: Date.now() };
    st.progress[internId][taskId].note = note; Store._save();
  },

  list(kind, internId) { return (Store._state[kind] && Store._state[kind][internId]) || []; },
  add(kind, internId, obj) {
    const st = Store._state; st[kind][internId] = st[kind][internId] || [];
    st[kind][internId].unshift({ id: kind[0] + Date.now(), ts: Date.now(), ...obj });
    Store._save();
  },
  remove(kind, internId, id) {
    const st = Store._state; st[kind][internId] = (st[kind][internId] || []).filter(x => x.id !== id); Store._save();
  },
  setDeliverableStatus(internId, id, status) {
    const arr = Store._state.deliverables[internId] || [];
    const d = arr.find(x => x.id === id); if (d) { d.status = status; Store._save(); }
  },

  /* metrics */
  metrics(internId) {
    const prog = Store.progress(internId);
    const total = IM.ALLDAYS.length;
    const by = s => IM.ALLDAYS.filter(d => (prog[d.id] || {}).status === s).length;
    const completed = by("completed");
    return { total, completed, inProgress: by("in_progress"), blocked: by("blocked"),
      pending: total - completed, pct: Math.round(completed / total * 100) };
  },
  phaseMetrics(internId, phaseId) {
    const prog = Store.progress(internId);
    const days = IM.PHASES.find(p => p.id === phaseId).days;
    const done = days.filter(d => (prog[d.id] || {}).status === "completed").length;
    return { done, total: days.length, pct: Math.round(done / days.length * 100) };
  },
  lastActivity(internId) {
    const logs = Store.list("logs", internId);
    return logs.length ? logs[0].ts : 0;
  },
  isAtRisk(internId) {
    const m = Store.metrics(internId);
    const last = Store.lastActivity(internId);
    // only "stale" once they've actually started; a brand-new intern isn't at risk
    const stale = last > 0 && (Date.now() - last) > 3 * 86400000;
    return m.blocked > 0 || (stale && m.pct < 100);
  },
  cohortMetrics() {
    const interns = Store.interns();
    const pcts = interns.map(i => Store.metrics(i.id).pct);
    const avg = Math.round(pcts.reduce((a, b) => a + b, 0) / interns.length);
    const blocked = interns.filter(i => Store.metrics(i.id).blocked > 0).length;
    const atRisk = interns.filter(i => Store.isAtRisk(i.id)).length;
    const completedTasks = interns.reduce((n, i) => n + Store.metrics(i.id).completed, 0);
    return { avg, blocked, atRisk, count: interns.length,
      completedTasks, totalTasks: interns.length * IM.ALLDAYS.length };
  },
  reset() { try { localStorage.removeItem(IM.KEY); } catch (e) {} Store.init(); },
};

/* ---------- shared UI helpers ---------- */
const UI = {
  initTheme() {
    const r = document.documentElement;
    try { const t = localStorage.getItem(IM.THEME);
      if (t) r.setAttribute("data-theme", t);
      else if (window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches) r.setAttribute("data-theme", "dark");
    } catch (e) {}
  },
  wireToggle(btn) {
    if (!btn) return;
    btn.addEventListener("click", () => {
      const r = document.documentElement, n = r.getAttribute("data-theme") === "dark" ? "light" : "dark";
      r.setAttribute("data-theme", n); try { localStorage.setItem(IM.THEME, n); } catch (e) {}
    });
  },
  timeAgo(ts) {
    if (!ts) return "no activity";
    const s = Math.floor((Date.now() - ts) / 1000);
    if (s < 60) return "just now";
    if (s < 3600) return Math.floor(s / 60) + "m ago";
    if (s < 86400) return Math.floor(s / 3600) + "h ago";
    return Math.floor(s / 86400) + "d ago";
  },
  esc(t) { return String(t == null ? "" : t).replace(/[<>&]/g, c => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c])); },
  initials(name) { return name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase(); },
  ring(pct, size) {
    size = size || 54; const r = (size - 8) / 2, c = 2 * Math.PI * r, off = c * (1 - pct / 100);
    const col = pct === 100 ? "var(--jungle)" : pct >= 50 ? "var(--primary)" : "var(--sunflower)";
    return `<svg class="ring" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="var(--surface-2)" stroke-width="6"/>
      <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="${col}" stroke-width="6" stroke-linecap="round"
        stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${off.toFixed(1)}" transform="rotate(-90 ${size/2} ${size/2})"/>
      <text x="50%" y="50%" dy=".35em" text-anchor="middle" font-size="${size*0.26}" font-weight="700" fill="var(--text)">${pct}%</text>
    </svg>`;
  },
  // ALX logo inline (themes via .logo svg path{fill:var(--logo)})
  logo: `<svg viewBox="100 70 170 90" role="img" aria-label="ALX"><g>
    <path d="M258.698 128.735L244.107 114.233L258.705 99.6342L260 98.3393L258.705 97.0445L248.931 87.2703L247.636 85.9755L246.341 87.2703L231.743 101.869L217.241 87.2777L215.946 85.9755L214.644 87.2703L204.869 97.0445L203.582 98.3393L204.862 99.6342L219.379 114.233L204.869 128.742L203.575 130.037L204.869 131.332L214.644 141.106L215.938 142.401L217.233 141.106L231.743 126.596L246.349 141.113L247.636 142.401L248.931 141.106L258.705 131.332L260 130.03L258.698 128.735Z"/>
    <path d="M177.68 85.1168V153.506H195.822V77L177.68 85.1168Z"/>
    <path d="M148.483 126.293C148.172 132.123 143.348 136.763 137.436 136.763C131.524 136.763 126.374 131.813 126.374 125.701C126.374 119.589 131.324 114.639 137.436 114.639C143.547 114.639 148.172 119.278 148.483 125.109V126.293ZM148.483 98.1911V100.588C145.101 99.1012 141.365 98.2651 137.436 98.2651C122.282 98.2725 110 110.548 110 125.701C110 140.854 122.282 153.137 137.436 153.137C141.365 153.137 145.101 152.301 148.483 150.813V153.507H166.625V98.1985H148.483V98.1911Z"/>
  </g></svg>`,
};
UI.initTheme();
