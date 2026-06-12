# 🏔️ Wayanad → Coimbatore Route Planner PWA

A Progressive Web App (PWA) that visualizes and plans the scenic road trip:

**Wayanad → Lakkidi View Point → Pookode Lake → Needle Rock → Pykara Lake → Dolphin's Nose → Catherine Falls → Coimbatore**

---

## ✨ Features

| Feature | Details |
|---|---|
| 🗺️ Interactive Map | Leaflet.js route visualization with all 8 waypoints |
| ⛽ Fuel Calculator | Distance, efficiency, fuel price inputs |
| 💰 Cost Splitter | Enter names, split all expenses equally |
| 📊 Expense Chart | Chart.js doughnut chart breakdown |
| 📄 PDF Export | jsPDF — full trip report with waypoints + costs |
| 🌙 Dark / Light Mode | Toggle, persisted via localStorage |
| 📴 Offline PWA | Service Worker + manifest, works without internet |
| 💾 LocalStorage | All inputs auto-saved between sessions |

---

## 🚀 Deployment

### GitHub Pages

1. Push the repo to GitHub
2. Go to **Settings → Pages → Source: `main` branch → `/root`**
3. Your app will be live at `https://<username>.github.io/<repo>/`

### Run Locally

```bash
# Option A: Python (no install needed)
python3 -m http.server 8080
# Open http://localhost:8080

# Option B: Node.js
npx serve .
# Open http://localhost:3000

# Option C: VS Code Live Server extension
# Right-click index.html → Open with Live Server
```

> ⚠️ Must serve over HTTP (not `file://`) for Service Worker to register.

---

## 📁 File Structure

```
wayanad-trip-pwa/
├── index.html          # Main app shell
├── manifest.json       # PWA manifest
├── sw.js               # Service Worker (offline caching)
├── css/
│   └── style.css       # Dark/light theme, all UI styles
├── js/
│   └── app.js          # Map, calculator, PDF, state logic
├── icons/
│   ├── icon-192.png    # PWA icon
│   └── icon-512.png    # PWA icon (large)
├── generate_icons.py   # Icon generation script (run once)
└── README.md
```

---

## 🛣️ Route Details

| # | Stop | Time | Est. Duration | Dist from Prev |
|---|---|---|---|---|
| 1 | Wayanad, Kerala | 06:00 AM | Depart | — |
| 2 | Lakkidi View Point | 07:15 AM | 20–30 min | 38 km |
| 3 | Pookode Lake | 08:00 AM | 45 min | 10 km |
| 4 | Needle Rock View Point | 10:30 AM | 30 min | 55 km |
| 5 | Pykara Lake, Ooty | 12:30 PM | 1 hr | 65 km |
| 6 | Dolphin's Nose, Coonoor | 03:00 PM | 45 min | 40 km |
| 7 | Catherine Falls, Kotagiri | 05:00 PM | 45 min | 22 km |
| 8 | Coimbatore, Tamil Nadu | 07:30 PM | Arrive | 80 km |

**Total: ~310 km | ~8–10 hours including stops**

---

## 📦 Libraries Used (all via CDN, cached offline)

- [Bootstrap 5.3](https://getbootstrap.com/) — UI framework
- [Bootstrap Icons 1.11](https://icons.getbootstrap.com/) — Icons
- [Leaflet 1.9](https://leafletjs.com/) — Interactive map
- [Chart.js 4.4](https://www.chartjs.org/) — Expense chart
- [jsPDF 2.5](https://github.com/parallax/jsPDF) — PDF export

---

## 🗺️ Google Maps Route URL

```
https://www.google.com/maps/dir/Wayanad,+Kerala/Lakkidi+View+Point,+Wayanad/
Pookode+Lake,+Wayanad/Needle+Rock+View+Point,+Gudalur/Pykara+Lake,+Ooty/
Dolphin's+Nose,+Coonoor/Catherine+Falls,+Kotagiri/Coimbatore,+Tamil+Nadu
```

---

## 📱 Install as PWA

1. Open in Chrome/Edge on Android or iOS
2. Tap the **"Add to Home Screen"** prompt
3. App works fully offline after first load

---

*Built with ❤️ for the Wayanad → Coimbatore scenic route*
