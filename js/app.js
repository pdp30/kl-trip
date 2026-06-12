/* ═══════════════════════════════════════════════════════════════
   Coimbatore → Wayanad Route PWA  |  app.js
   Route URL (reversed):
   https://www.google.com/maps/dir/Coimbatore,+Tamil+Nadu/Catherine+Falls,+Kotagiri/
   Dolphin's+Nose,+Coonoor/Pykara+Lake,+Ooty/Needle+Rock+View+Point,+Gudalur/
   Pookode+Lake,+Wayanad/Lakkidi+View+Point,+Wayanad/Wayanad,+Kerala
═══════════════════════════════════════════════════════════════ */

"use strict";

const ROUTE_URL = "https://www.google.com/maps/dir/Coimbatore,+Tamil+Nadu/Catherine+Falls,+Kotagiri/Dolphin's+Nose,+Coonoor/Pykara+Lake,+Ooty/Needle+Rock+View+Point,+Gudalur/Pookode+Lake,+Wayanad/Lakkidi+View+Point,+Wayanad/Wayanad,+Kerala";

const WAYPOINTS = [
  {
    id: 1,
    name: "Coimbatore, Tamil Nadu",
    short: "Coimbatore",
    lat: 11.0168, lng: 76.9558,
    type: "start",
    icon: "🏙️",
    desc: "Start point — Manchester of South India",
    time: "06:00 AM",
    duration: "Depart",
    distFromPrev: 0,
    tips: "Fill fuel at Coimbatore. Roads clear early morning. NH-181 towards Mettupalayam."
  },
  {
    id: 2,
    name: "Catherine Falls, Kotagiri",
    short: "Catherine Falls",
    lat: 11.4000, lng: 76.8833,
    type: "stop",
    icon: "💧",
    desc: "Second highest waterfall in the Nilgiris",
    time: "08:00 AM",
    duration: "45 min",
    distFromPrev: 80,
    tips: "2 km trek one-way. Best flow June–November. Morning light is gorgeous."
  },
  {
    id: 3,
    name: "Dolphin's Nose, Coonoor",
    short: "Dolphin's Nose",
    lat: 11.3545, lng: 76.7945,
    type: "stop",
    icon: "🐬",
    desc: "Rock jutting over the valley — Coonoor's signature view",
    time: "09:30 AM",
    duration: "45 min",
    distFromPrev: 22,
    tips: "Steep road. Best views in clear weather. Try Coonoor tea at stalls."
  },
  {
    id: 4,
    name: "Pykara Lake, Ooty",
    short: "Pykara",
    lat: 11.4167, lng: 76.6167,
    type: "stop",
    icon: "🌊",
    desc: "Serene reservoir in Nilgiris, near Ooty",
    time: "11:30 AM",
    duration: "1 hr",
    distFromPrev: 40,
    tips: "Picnic spot. Speedboating available. Good lunch stop before the ghats."
  },
  {
    id: 5,
    name: "Needle Rock View Point",
    short: "Needle Rock",
    lat: 11.4500, lng: 76.4833,
    type: "stop",
    icon: "🪨",
    desc: "Sharp basalt rock formation, Gudalur forests",
    time: "02:00 PM",
    duration: "30 min",
    distFromPrev: 65,
    tips: "1 km trek to viewpoint. Wear comfortable shoes. Gudalur roads are winding."
  },
  {
    id: 6,
    name: "Pookode Lake",
    short: "Pookode",
    lat: 11.5350, lng: 76.0770,
    type: "stop",
    icon: "🪷",
    desc: "Freshwater lake surrounded by eucalyptus forest",
    time: "03:30 PM",
    duration: "45 min",
    distFromPrev: 55,
    tips: "Boating available. Entry ₹20. Afternoon mist rolls in beautifully."
  },
  {
    id: 7,
    name: "Lakkidi View Point",
    short: "Lakkidi",
    lat: 11.5000, lng: 76.0833,
    type: "stop",
    icon: "🌄",
    desc: "Scenic ghats viewpoint, Thamarassery Pass",
    time: "04:30 PM",
    duration: "20–30 min",
    distFromPrev: 10,
    tips: "Golden hour views over the valley. Last major viewpoint before Wayanad."
  },
  {
    id: 8,
    name: "Wayanad, Kerala",
    short: "Wayanad",
    lat: 11.6854, lng: 76.1320,
    type: "end",
    icon: "🏔️",
    desc: "Destination — misty hill district of Kerala",
    time: "06:00 PM",
    duration: "Arrive",
    distFromPrev: 38,
    tips: "Total: ~310 km. Kalpetta town has good hotels and food."
  }
];

const TOTAL_DISTANCE_KM = WAYPOINTS.reduce((s, w) => s + w.distFromPrev, 0);

/* ─── State ─────────────────────────────────────────────────── */
let state = {
  people: 4,
  names: ["Person 1", "Person 2", "Person 3", "Person 4"],
  expenses: [],
  theme: "dark"
};

let liveTrackingWatchId = null;
let liveTrackingMarker = null;
let liveTrackingCircle = null;
let lastLivePosition = null;
let lastLiveTime = null;

function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function findNearestWaypoint(lat, lng) {
  let nearest = WAYPOINTS[0];
  let minDist = haversineDistance(lat, lng, nearest.lat, nearest.lng);
  for (let wp of WAYPOINTS) {
    const dist = haversineDistance(lat, lng, wp.lat, wp.lng);
    if (dist < minDist) {
      minDist = dist;
      nearest = wp;
    }
  }
  return { waypoint: nearest, distance: minDist };
}

function updateLiveTrackButton() {
  const btn = document.getElementById("live-track-btn");
  if (!btn) return;
  if (liveTrackingWatchId !== null) {
    btn.innerHTML = '<i class="bi bi-stop-circle"></i> Stop Live';
    btn.classList.remove("btn-outline-accent");
    btn.classList.add("btn-danger");
  } else {
    btn.innerHTML = '<i class="bi bi-geo-alt-fill"></i> Start Live';
    btn.classList.remove("btn-danger");
    btn.classList.add("btn-outline-accent");
  }
}

function setLivePosition(lat, lng, accuracy, speed, heading) {
  if (!window._map) return;
  const latlng = [lat, lng];
  const now = Date.now();
  const statusCard = document.getElementById("live-status-card");
  const mapContainer = document.getElementById("map-container");
  
  if (statusCard) statusCard.style.display = "block";
  if (mapContainer) mapContainer.style.marginTop = "0";
  
  if (!liveTrackingMarker) {
    liveTrackingMarker = L.circleMarker(latlng, {
      radius: 8,
      fillColor: "#38d9a9",
      color: "#ffffff",
      weight: 2,
      fillOpacity: 0.95
    }).addTo(window._map).bindPopup("You are here");
    liveTrackingCircle = L.circle(latlng, {
      radius: accuracy || 20,
      color: "#38d9a9",
      fillColor: "#38d9a9",
      fillOpacity: 0.1
    }).addTo(window._map);
    window._map.setView(latlng, 13);
    liveTrackingMarker.openPopup();
  } else {
    liveTrackingMarker.setLatLng(latlng);
    liveTrackingCircle.setLatLng(latlng).setRadius(accuracy || 20);
    window._map.panTo(latlng);
  }
  
  const { waypoint, distance } = findNearestWaypoint(lat, lng);
  let speedKmh = speed ? (speed * 3.6).toFixed(1) : "--";
  
  document.getElementById("live-distance").textContent = distance.toFixed(1) + " km";
  document.getElementById("live-speed").textContent = speedKmh + " km/h";
  
  lastLivePosition = { lat, lng, accuracy, speed };
  lastLiveTime = now;
}

function startLiveTracking() {
  if (!navigator.geolocation) {
    showToast("Geolocation not supported in this browser.");
    return;
  }
  if (liveTrackingWatchId !== null) return;
  liveTrackingWatchId = navigator.geolocation.watchPosition(
    pos => setLivePosition(pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy, pos.coords.speed, pos.coords.heading),
    err => showToast(`Location error: ${err.message}`),
    { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
  );
  updateLiveTrackButton();
  showToast("Live tracking started.");
}

function stopLiveTracking() {
  if (liveTrackingWatchId === null) return;
  navigator.geolocation.clearWatch(liveTrackingWatchId);
  liveTrackingWatchId = null;
  if (liveTrackingMarker) {
    window._map && window._map.removeLayer(liveTrackingMarker);
    liveTrackingMarker = null;
  }
  if (liveTrackingCircle) {
    window._map && window._map.removeLayer(liveTrackingCircle);
    liveTrackingCircle = null;
  }
  const statusCard = document.getElementById("live-status-card");
  if (statusCard) statusCard.style.display = "none";
  updateLiveTrackButton();
  showToast("Live tracking stopped.");
}

function loadState() {
  try {
    const saved = localStorage.getItem("cbe_wyd_state");
    if (saved) Object.assign(state, JSON.parse(saved));
  } catch (_) {}
  if (!Array.isArray(state.expenses)) state.expenses = [];
  if (!Array.isArray(state.names)) state.names = [];
  state.people = parseInt(state.people) || 1;
}

function saveState() {
  try {
    localStorage.setItem("cbe_wyd_state", JSON.stringify(state));
  } catch (_) {}
}

function syncInputsToState() {
  state.people = parseInt(document.getElementById("inp-people").value) || 1;
}

function syncStateToInputs() {
  document.getElementById("inp-people").value = state.people;
}

function addExpense() {
  const payer = document.getElementById("inp-expense-payer").value || state.names[0] || "Person 1";
  const amount = parseFloat(document.getElementById("inp-expense-amount").value) || 0;
  const purpose = document.getElementById("inp-expense-purpose").value.trim();
  if (!amount || amount <= 0) {
    showToast("Enter a valid amount to add an expense.");
    return;
  }
  state.expenses.push({ payer, amount, purpose });
  document.getElementById("inp-expense-amount").value = 0;
  document.getElementById("inp-expense-purpose").value = "";
  renderExpenseList();
  renderSplitResult();
  renderChart();
  saveState();
  showToast("Expense added and saved.");
}

function renderExpenseList() {
  if (!state.expenses.length) {
    document.getElementById("expense-list").innerHTML = `<div class="text-muted">No expenses recorded yet.</div>`;
    return;
  }
  let html = "";
  state.expenses.forEach((expense, idx) => {
    html += `<div class="expense-item">
      <div>
        <strong>${escHtml(expense.payer)}</strong>
        <span class="expense-purpose">${escHtml(expense.purpose || "No purpose")}</span>
      </div>
      <div style="text-align:right;">
        <span>₹${expense.amount.toLocaleString("en-IN")}</span>
        <button class="btn btn-sm btn-outline-danger mt-2 delete-expense" data-idx="${idx}">Delete</button>
      </div>
    </div>`;
  });
  document.getElementById("expense-list").innerHTML = html;
  document.querySelectorAll(".delete-expense").forEach(btn => {
    btn.addEventListener("click", e => {
      const idx = +e.target.dataset.idx;
      state.expenses.splice(idx, 1);
      renderExpenseList();
      renderSplitResult();
      renderChart();
      saveState();
    });
  });
}

function renderSplitResult() {
  const totalAmount = state.expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const perPerson = state.people > 0 ? totalAmount / state.people : 0;
  let html = `
    <div class="breakdown-row">
      <span class="breakdown-label">Total Expenses</span>
      <span class="breakdown-val">₹${totalAmount.toLocaleString("en-IN")}</span>
    </div>`;

  for (let i = 0; i < state.people; i++) {
    const name = state.names[i] || `Person ${i + 1}`;
    const paid = state.expenses.filter(exp => exp.payer === name).reduce((sum, exp) => sum + exp.amount, 0);
    const balance = paid - perPerson;
    const status = balance === 0 ? "Settled" : balance > 0 ? `Gets ₹${balance.toLocaleString("en-IN")}` : `Owes ₹${Math.abs(balance).toLocaleString("en-IN")}`;
    html += `<div class="split-person">
      <span class="split-person-name">${escHtml(name)}</span>
      <span class="split-person-amt">Paid ₹${paid.toLocaleString("en-IN")} · Share ₹${perPerson.toFixed(0).toLocaleString("en-IN")} · ${status}</span>
    </div>`;
  }
  document.getElementById("split-result").innerHTML = html;
}

/* ─── People Inputs ─────────────────────────────────────────── */
function renderPeopleInputs() {
  const n = state.people;
  while (state.names.length < n) state.names.push(`Person ${state.names.length + 1}`);
  state.names = state.names.slice(0, n);

  let html = `<div class="mb-2" style="font-size:0.8rem;color:var(--text-muted)">Edit person names and the expense split updates automatically.</div>`;
  for (let i = 0; i < n; i++) {
    html += `<div class="person-row">
      <span class="wp-num">${i + 1}</span>
      <input type="text" class="form-control form-control-sm person-name" data-idx="${i}"
             value="${escHtml(state.names[i])}" placeholder="Name" />
    </div>`;
  }
  document.getElementById("people-inputs").innerHTML = html;

  document.querySelectorAll(".person-name").forEach(inp => {
    inp.addEventListener("input", e => {
      state.names[+e.target.dataset.idx] = e.target.value || `Person ${+e.target.dataset.idx + 1}`;
      renderExpensePayerOptions();
      renderSplitResult();
      renderChart();
      saveState();
    });
  });
}

function renderSplitResult() {
  const totalAmount = state.expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const perPerson = state.people > 0 ? totalAmount / state.people : 0;
  let html = `<div class="breakdown-row">
      <span class="breakdown-label">Total Expenses</span>
      <span class="breakdown-val">₹${totalAmount.toLocaleString("en-IN")}</span>
    </div>`;

  for (let i = 0; i < state.people; i++) {
    const name = state.names[i] || `Person ${i + 1}`;
    const paid = state.expenses.filter(exp => exp.payer === name).reduce((sum, exp) => sum + exp.amount, 0);
    const balance = paid - perPerson;
    const status = balance === 0 ? "Settled" : balance > 0 ? `Gets ₹${balance.toLocaleString("en-IN")}` : `Owes ₹${Math.abs(balance).toLocaleString("en-IN")}`;
    html += `<div class="split-person">
      <span class="split-person-name">${escHtml(name)}</span>
      <span class="split-person-amt">Paid ₹${paid.toLocaleString("en-IN")} · Share ₹${perPerson.toFixed(0).toLocaleString("en-IN")} · ${status}</span>
    </div>`;
  }
  document.getElementById("stat-fuel").textContent = `₹${totalAmount.toLocaleString("en-IN")}`;
  document.getElementById("stat-perperson").textContent = `₹${Math.ceil(perPerson).toLocaleString("en-IN")}`;
  document.getElementById("split-result").innerHTML = html;
  saveState();
}

/* ─── Chart ─────────────────────────────────────────────────── */
let chartInstance = null;
function renderChart() {
  const grouped = state.expenses.reduce((acc, exp) => {
    acc[exp.payer] = (acc[exp.payer] || 0) + exp.amount;
    return acc;
  }, {});
  const labels = Object.keys(grouped);
  const vals = labels.map(name => grouped[name]);
  const colors = ["#38d9a9","#4da6ff","#ffb347","#ff7675","#a29bfe","#6c5ce7","#00b894","#fd79a8"];
  const ctx = document.getElementById("expense-chart").getContext("2d");
  if (chartInstance) chartInstance.destroy();
  chartInstance = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: labels.length ? labels : ["No expenses"],
      datasets: [{ data: labels.length ? vals : [1], backgroundColor: colors, borderColor: "transparent", hoverOffset: 8 }]
    },
    options: {
      responsive: false,
      plugins: {
        legend: { position: "bottom", labels: { color: getComputedStyle(document.documentElement).getPropertyValue("--text").trim() || "#d0e6f7", font: { size: 11 }, padding: 12, boxWidth: 12 }},
        tooltip: { callbacks: { label: ctx => ctx.label === "No expenses" ? "" : ` ₹${ctx.parsed.toLocaleString("en-IN")}` }}
      },
      cutout: "60%"
    }
  });
}

/* ─── Waypoints List ─────────────────────────────────────────── */
function renderExpensePayerOptions() {
  const select = document.getElementById("inp-expense-payer");
  if (!select) return;
  let html = "";
  for (let i = 0; i < state.people; i++) {
    const name = state.names[i] || `Person ${i + 1}`;
    html += `<option value="${escHtml(name)}">${escHtml(name)}</option>`;
  }
  select.innerHTML = html;
}

function renderWaypointsList() {
  let html = "";
  WAYPOINTS.forEach(wp => {
    html += `<div class="waypoint-item" data-id="${wp.id}" title="${escHtml(wp.tips)}">
      <div class="wp-num">${wp.id}</div>
      <div>
        <div class="wp-name">${wp.icon} ${escHtml(wp.name)}</div>
        <div class="wp-meta">${escHtml(wp.desc)}</div>
        <div class="wp-meta" style="color:var(--accent);margin-top:2px">${wp.time} · ${wp.duration}${wp.distFromPrev ? ` · +${wp.distFromPrev} km` : ""}</div>
      </div>
    </div>`;
  });
  document.getElementById("waypoints-list").innerHTML = html;
  document.querySelectorAll(".waypoint-item").forEach(el => {
    el.addEventListener("click", () => {
      const wp = WAYPOINTS.find(w => w.id === +el.dataset.id);
      if (wp && window._map) {
        window._map.setView([wp.lat, wp.lng], 12, { animate: true });
        window._markers && window._markers[wp.id - 1] && window._markers[wp.id - 1].openPopup();
      }
    });
  });
}

/* ─── Itinerary ─────────────────────────────────────────────── */
function renderItinerary() {
  let html = "";
  WAYPOINTS.forEach(wp => {
    html += `<div class="itin-stop">
      <div class="itin-dot">${wp.id}</div>
      <div class="itin-content">
        <div class="itin-time">${wp.time} &nbsp;•&nbsp; ${wp.duration}</div>
        <div class="itin-title">${wp.icon} ${escHtml(wp.name)}</div>
        <div class="itin-desc">${escHtml(wp.desc)}</div>
        <div class="itin-desc" style="color:var(--accent);margin-top:3px">💡 ${escHtml(wp.tips)}</div>
      </div>
    </div>`;
  });
  document.getElementById("itinerary-content").innerHTML = html;
}

/* ─── Map ────────────────────────────────────────────────────── */
function initMap() {
  const map = L.map("map", { center: [11.35, 76.55], zoom: 9, zoomControl: true });
  const darkTile  = L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", { attribution: '&copy; OSM &copy; CARTO', subdomains: "abcd", maxZoom: 19 });
  const lightTile = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: '&copy; OpenStreetMap', maxZoom: 19 });
  darkTile.addTo(map);
  window._map = map; window._darkTile = darkTile; window._lightTile = lightTile;

  const latlngs = WAYPOINTS.map(w => [w.lat, w.lng]);
  L.polyline(latlngs, { color: "#38d9a9", weight: 3, opacity: 0.85, dashArray: "6 4" }).addTo(map);

  window._markers = WAYPOINTS.map(wp => {
    const icon = L.divIcon({ className: "", html: `<div class="custom-marker">${wp.id}</div>`, iconSize: [26,26], iconAnchor: [13,13] });
    return L.marker([wp.lat, wp.lng], { icon }).addTo(map).bindPopup(`
      <div style="min-width:160px">
        <div style="font-weight:700;margin-bottom:4px">${wp.icon} ${wp.name}</div>
        <div style="font-size:0.8rem;color:#888">${wp.desc}</div>
        <div style="font-size:0.78rem;margin-top:4px;color:#38d9a9">${wp.time} · ${wp.duration}</div>
        ${wp.distFromPrev ? `<div style="font-size:0.78rem;color:#aaa">+${wp.distFromPrev} km from previous</div>` : ""}
        <div style="font-size:0.75rem;margin-top:6px;border-top:1px solid #333;padding-top:5px">💡 ${wp.tips}</div>
      </div>`, { maxWidth: 220 });
  });
  map.fitBounds(L.latLngBounds(latlngs), { padding: [30,30] });
}

function updateMapTheme(isDark) {
  if (!window._map) return;
  if (isDark) { window._lightTile && window._map.removeLayer(window._lightTile); window._darkTile && window._darkTile.addTo(window._map); }
  else        { window._darkTile  && window._map.removeLayer(window._darkTile);  window._lightTile && window._lightTile.addTo(window._map); }
}

/* ─── PDF Export ─────────────────────────────────────────────── */
async function exportPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  const W = doc.internal.pageSize.getWidth();
  let y = 15;

  doc.setFillColor(13,27,42);
  doc.rect(0,0,W,30,"F");
  doc.setTextColor(56,217,169);
  doc.setFontSize(16); doc.setFont("helvetica","bold");
  doc.text("Coimbatore → Wayanad Route Planner", W/2, 13, { align:"center" });
  doc.setFontSize(8); doc.setTextColor(160,200,230);
  doc.text(`Generated: ${new Date().toLocaleString("en-IN")}  |  ${TOTAL_DISTANCE_KM} km scenic route`, W/2, 22, { align:"center" });
  y = 38;

  doc.setFontSize(7); doc.setTextColor(100,160,200);
  doc.text("Route URL:", 14, y);
  doc.setTextColor(56,217,169);
  doc.textWithLink(ROUTE_URL.substring(0,90)+"...", 14, y+5, { url: ROUTE_URL });
  y += 14;

  doc.setFontSize(11); doc.setFont("helvetica","bold"); doc.setTextColor(56,217,169);
  doc.text("Waypoints & Itinerary", 14, y); y += 6;

  WAYPOINTS.forEach((wp,i) => {
    if (y > 250) { doc.addPage(); y = 20; }
    if (i%2===0) { doc.setFillColor(240,248,255); doc.rect(14,y-4,W-28,18,"F"); }
    doc.setFontSize(9); doc.setFont("helvetica","bold"); doc.setTextColor(20,60,100);
    doc.text(`${wp.id}. ${wp.name}`, 18, y);
    doc.setFont("helvetica","normal"); doc.setFontSize(8); doc.setTextColor(80,80,80);
    doc.text(`${wp.time}  ·  ${wp.duration}${wp.distFromPrev ? `  ·  +${wp.distFromPrev} km` : ""}`, 18, y+5);
    doc.setTextColor(120,120,120); doc.text(wp.desc, 18, y+10);
    y += 20;
  });

  y += 4; doc.line(14,y,W-14,y); y += 8;

  if (state.expenses.length > 0) {
    if (y > 220) { doc.addPage(); y = 20; }
    doc.setFontSize(11); doc.setFont("helvetica","bold"); doc.setTextColor(56,217,169);
    doc.text("Expense Summary", 14, y); y += 7;

    const totalAmount = state.expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const perPerson = state.people > 0 ? totalAmount / state.people : 0;
    const rows = [
      ["Number of People", `${state.people}`],
      ["Total Expenses", `₹${totalAmount.toLocaleString("en-IN")}`],
      ["Share Each", `₹${perPerson.toFixed(0).toLocaleString("en-IN")}`],
    ];
    rows.forEach((row,i) => {
      if (y > 270) { doc.addPage(); y = 20; }
      const isTotal = row[0] === "Share Each";
      doc.setFillColor(isTotal?220:(i%2===0?248:255), isTotal?245:248, isTotal?230:255);
      doc.rect(14,y-4,W-28,8,"F");
      doc.setFont("helvetica",isTotal?"bold":"normal"); doc.setFontSize(9);
      doc.setTextColor(isTotal?0:50, isTotal?80:50, isTotal?0:50);
      doc.text(row[0],18,y);
      doc.setTextColor(isTotal?0:50, isTotal?120:100, isTotal?80:100);
      doc.text(row[1],W-18,y,{align:"right"});
      y += 9;
    });

    y += 4; doc.line(14,y,W-14,y); y += 8;
    if (y > 230) { doc.addPage(); y = 20; }
    doc.setFontSize(11); doc.setFont("helvetica","bold"); doc.setTextColor(56,217,169);
    doc.text("Expenses", 14, y); y += 7;
    state.expenses.forEach(exp => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.setFont("helvetica","normal"); doc.setFontSize(9); doc.setTextColor(50,50,100);
      doc.text(`${escHtml(exp.payer)} paid ₹${exp.amount.toLocaleString("en-IN")}`, 18, y);
      doc.setTextColor(120,120,120);
      doc.text(exp.purpose || "No purpose", 18, y + 5);
      y += 10;
    });

    y += 4; doc.line(14,y,W-14,y); y += 8;
    if (y > 230) { doc.addPage(); y = 20; }
    doc.setFontSize(11); doc.setFont("helvetica","bold"); doc.setTextColor(56,217,169);
    doc.text("Settlement", 14, y); y += 7;
    for (let i=0; i<state.people; i++) {
      if (y > 270) { doc.addPage(); y = 20; }
      const name = state.names[i] || `Person ${i+1}`;
      const paid = state.expenses.filter(exp => exp.payer === name).reduce((sum, exp) => sum + exp.amount, 0);
      const balance = paid - perPerson;
      const status = balance === 0 ? "Settled" : balance > 0 ? `Gets ₹${balance.toLocaleString("en-IN")}` : `Owes ₹${Math.abs(balance).toLocaleString("en-IN")}`;
      doc.setFillColor(i%2===0?240:255,248,255); doc.rect(14,y-4,W-28,8,"F");
      doc.setFont("helvetica","normal"); doc.setFontSize(9); doc.setTextColor(50,50,100);
      doc.text(`${i+1}. ${name}`,18,y);
      doc.setTextColor(0,120,80);
      doc.text(status, W-18, y, {align:"right"});
      y += 9;
    }
  }

  const pageCount = doc.internal.getNumberOfPages();
  for (let p=1; p<=pageCount; p++) {
    doc.setPage(p); doc.setFontSize(7); doc.setTextColor(160,160,160);
    doc.text(`Coimbatore → Wayanad Route Planner  |  Page ${p} of ${pageCount}`, W/2, 292, {align:"center"});
  }
  doc.save("Coimbatore-Wayanad-Route.pdf");
  showToast("PDF exported successfully!");
}

/* ─── Theme ──────────────────────────────────────────────────── */
function setTheme(theme) {
  state.theme = theme;
  document.documentElement.setAttribute("data-bs-theme", theme);
  document.getElementById("theme-toggle").innerHTML = theme==="dark" ? '<i class="bi bi-sun-fill"></i>' : '<i class="bi bi-moon-fill"></i>';
  updateMapTheme(theme==="dark");
  if (chartInstance) renderChart();
  saveState();
}

function showToast(msg) {
  document.getElementById("toast-msg").textContent = msg;
  new bootstrap.Toast(document.getElementById("toast"), { delay: 2500 }).show();
}

function initItineraryToggle() {
  const btn=document.getElementById("toggle-itinerary"), body=document.getElementById("itinerary-body");
  let open=true;
  btn.addEventListener("click",()=>{ open=!open; body.style.display=open?"":"none"; btn.innerHTML=open?'<i class="bi bi-chevron-up"></i>':'<i class="bi bi-chevron-down"></i>'; });
}

function initOffline() {
  const badge=document.getElementById("offline-badge");
  function update(){ badge.classList.toggle("d-none",navigator.onLine); }
  window.addEventListener("online",update); window.addEventListener("offline",update); update();
}

function registerSW() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js")
      .then(r=>console.log("SW:",r.scope)).catch(e=>console.error("SW:",e));
  }
}

function escHtml(s) {
  return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

/* ─── Init ───────────────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  loadState();
  syncStateToInputs();
  setTheme(state.theme||"dark");
  renderWaypointsList();
  renderItinerary();
  initItineraryToggle();
  initMap();
  initOffline();
  registerSW();
  document.getElementById("stat-time").textContent = "~8–10 hrs";
  renderExpensePayerOptions();
  renderPeopleInputs();
  renderExpenseList();
  renderSplitResult();
  renderChart();
  updateLiveTrackButton();
  document.getElementById("add-expense-btn").addEventListener("click", addExpense);
  document.getElementById("live-track-btn").addEventListener("click", () => {
    if (liveTrackingWatchId === null) startLiveTracking(); else stopLiveTracking();
  });
  document.getElementById("export-pdf-btn").addEventListener("click", exportPDF);
  document.getElementById("theme-toggle").addEventListener("click", ()=>setTheme(state.theme==="dark"?"light":"dark"));
  document.getElementById("inp-people").addEventListener("input", e=>{
    state.people = parseInt(e.target.value) || 1;
    renderPeopleInputs();
    renderExpensePayerOptions();
    renderSplitResult();
    renderChart();
    saveState();
  });
});
