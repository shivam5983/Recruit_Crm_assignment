// ---------- Mock Data ----------
const state = {
  jobs: [
    {
      id: 1,
      title: "Senior Frontend Engineer",
      status: "hot",
      location: "Remote • India",
      applicants: 18,
    },
    {
      id: 2,
      title: "Backend Engineer (Node.js)",
      status: "open",
      location: "Mumbai",
      applicants: 25,
    },
    {
      id: 3,
      title: "Product Manager",
      status: "open",
      location: "Remote",
      applicants: 9,
    },
  ],
  contacts: [
    { id: 1, name: "Rhea Kapoor", role: "CTO", email: "rhea@acme.com" },
    { id: 2, name: "Ankit Verma", role: "HR Lead", email: "ankit@acme.com" },
  ],
  activities: [
    {
      id: 1,
      type: "call",
      subject: "Intro call with HR",
      body: "Discussed hiring plan.",
      at: "2025-08-17 10:45",
      author: "You",
    },
    {
      id: 2,
      type: "email",
      subject: "JD for Backend Role",
      body: "Sent JD & comp range.",
      at: "2025-08-18 14:10",
      author: "You",
    },
    {
      id: 3,
      type: "note",
      subject: "Budget approved",
      body: "Headcount 3 roles confirmed.",
      at: "2025-08-19 09:05",
      author: "Priya",
    },
  ],
  nextFollowUp: null,
};

// ---------- Helpers ----------
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

function showToast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("is-visible");
  setTimeout(() => t.classList.remove("is-visible"), 1600);
}

function formatDateTime(str) {
  if (!str) return "—";
  const d = new Date(str);
  if (isNaN(d)) return str;
  return d.toLocaleString();
}

function iconFor(type) {
  return { call: "📞", email: "✉️", note: "📝" }[type] || "•";
}

// ---------- Rendering ----------
function renderKPIs() {
  $("#kpiOpenJobs").textContent = state.jobs.filter(
    (j) => j.status !== "closed"
  ).length;
  $("#kpiActiveCandidates").textContent = 42; // demo
  const last = state.activities
    .slice()
    .sort((a, b) => new Date(b.at) - new Date(a.at))[0];
  $("#kpiLastActivity").textContent = last
    ? `${last.type.toUpperCase()} — ${formatDateTime(last.at)}`
    : "—";
  $("#kpiNextFollowUp").textContent = state.nextFollowUp
    ? formatDateTime(state.nextFollowUp)
    : "—";
}

function jobBadge(status) {
  const map = { open: "Open", hot: "Hot", closed: "Closed" };
  return `<span class="tag">${map[status] || status}</span>`;
}

function renderJobs(listEl, filter = "all") {
  const jobs = state.jobs.filter((j) =>
    filter === "all" ? true : j.status === filter
  );
  listEl.innerHTML = jobs
    .map(
      (j) => `
    <li>
      <div class="media">J</div>
      <div style="flex:1">
        <div class="list__title">${j.title} ${jobBadge(j.status)}</div>
        <div class="list__meta">${j.location} • ${j.applicants} applicants</div>
      </div>
      <button class="btn btn--ghost btn--sm">Open</button>
    </li>
  `
    )
    .join("");
}

function renderContacts(listEl) {
  listEl.innerHTML = state.contacts
    .map(
      (c) => `
    <li>
      <div class="media">C</div>
      <div style="flex:1">
        <div class="list__title">${c.name}</div>
        <div class="list__meta">${c.role} • ${c.email || "—"}</div>
      </div>
      <button class="btn btn--ghost btn--sm">Message</button>
    </li>
  `
    )
    .join("");
}

function renderActivities(listEl, opts = {}) {
  const { type = "all", search = "" } = opts;
  const items = state.activities
    .filter((a) => (type === "all" ? true : a.type === type))
    .filter((a) => {
      const test = (a.subject + " " + (a.body || "")).toLowerCase();
      return test.includes(search.toLowerCase());
    })
    .sort((a, b) => new Date(b.at) - new Date(a.at));

  listEl.innerHTML = items
    .map(
      (a) => `
    <li>
      <div class="title">${iconFor(a.type)} ${a.subject}</div>
      <div class="meta">${a.type.toUpperCase()} • ${formatDateTime(
        a.at
      )} • by ${a.author}</div>
      ${
        a.body
          ? `<div class="body" style="margin-top:6px;color:#c7d3e1">${a.body}</div>`
          : ""
      }
    </li>
  `
    )
    .join("");
}

// ---------- Tabs ----------
function activateTab(id) {
  $$(".tab").forEach((t) =>
    t.classList.toggle("is-active", t.id === `tab-${id}`)
  );
  $$(".panel").forEach((p) =>
    p.classList.toggle("is-active", p.id === `panel-${id}`)
  );
}

// ---------- Dialogs / Forms ----------
function wireDialogs() {
  const dlgJob = $("#dlgAddJob");
  const dlgAct = $("#dlgLogActivity");
  const dlgCon = $("#dlgAddContact");

  $("#btnAddJob").addEventListener("click", () => dlgJob.showModal());
  $("#btnAddJob2").addEventListener("click", () => dlgJob.showModal());
  $("#btnLogActivity").addEventListener("click", () => dlgAct.showModal());
  $("#btnAddContact").addEventListener("click", () => dlgCon.showModal());
  $("#btnAddContact2").addEventListener("click", () => dlgCon.showModal());

  $("#formAddJob").addEventListener("submit", (e) => {
    const data = Object.fromEntries(new FormData(e.target).entries());
    if (!data.title) return;
    state.jobs.unshift({
      id: Date.now(),
      title: data.title,
      status: data.status || "open",
      location: data.location || "—",
      applicants: Math.floor(Math.random() * 20) + 1,
    });
    dlgJob.close();
    renderAll();
    showToast("Job added");
  });

  $("#formLogActivity").addEventListener("submit", (e) => {
    const data = Object.fromEntries(new FormData(e.target).entries());
    state.activities.push({
      id: Date.now(),
      type: data.type,
      subject: data.subject || "(No subject)",
      body: data.body || "",
      at: new Date().toISOString(),
      author: "You",
    });
    if (data.followup) state.nextFollowUp = data.followup;
    dlgAct.close();
    renderAll();
    showToast("Activity logged");
  });

  $("#formAddContact").addEventListener("submit", (e) => {
    const data = Object.fromEntries(new FormData(e.target).entries());
    state.contacts.unshift({
      id: Date.now(),
      name: data.name || "Unnamed",
      email: data.email || "",
      role: data.role || "",
    });
    dlgCon.close();
    renderAll();
    showToast("Contact added");
  });
}

// ---------- Filters & Events ----------
function wireFilters() {
  // Job segmented control (Overview)
  $$(".segmented__btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      $$(".segmented__btn").forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      renderJobs($("#listJobs"), btn.dataset.jobFilter);
    });
  });

  // Activities filters (both places)
  const attachActFilter = (typeSel, searchSel, target) => {
    const apply = () => {
      const type = typeSel ? typeSel.value : "all";
      const search = searchSel ? searchSel.value : "";
      renderActivities(target, { type, search });
    };
    if (typeSel) typeSel.addEventListener("change", apply);
    if (searchSel) searchSel.addEventListener("input", apply);
    apply();
  };
  attachActFilter(
    $("#activityTypeFilter"),
    $("#activitySearch"),
    $("#timeline")
  );
  attachActFilter($("#activityTypeFilter2"), null, $("#timelineFull"));

  // Tabs
  $$(
    "#tab-overview, #tab-jobs, #tab-contacts, #tab-candidates, #tab-activities, #tab-files"
  ).forEach((tab) => {
    tab.addEventListener("click", () => {
      activateTab(tab.id.replace("tab-", ""));
    });
  });
}

// ---------- Initial Render ----------
function renderAll() {
  renderKPIs();
  renderJobs($("#listJobs"), "all");
  renderJobs($("#listJobsFull"), "all");
  renderContacts($("#listContacts"));
  renderContacts($("#listContactsFull"));
  renderActivities($("#timeline"), {
    type: $("#activityTypeFilter")?.value || "all",
    search: $("#activitySearch")?.value || "",
  });
  renderActivities($("#timelineFull"), {
    type: $("#activityTypeFilter2")?.value || "all",
  });
}

window.addEventListener("DOMContentLoaded", () => {
  wireDialogs();
  wireFilters();
  renderAll();
});
