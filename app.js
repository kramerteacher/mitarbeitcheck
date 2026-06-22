// app.js

// ── State ────────────────────────────────────────────────────────────────────
const state = {
  currentCat: 0,
  selections: Array(CATEGORIES.length).fill(null), // index 0–5 = Note 1–6
  studentName: ""
};

// ── Helpers ──────────────────────────────────────────────────────────────────

// Berechnet Gesamtnote als gewichteten Durchschnitt
function calcGrade() {
  let weightedSum = 0;
  let totalWeight = 0;
  CATEGORIES.forEach((cat, i) => {
    if (state.selections[i] !== null) {
      weightedSum += (state.selections[i] + 1) * cat.weight; // +1 weil 0-basiert
      totalWeight += cat.weight;
    }
  });
  if (totalWeight === 0) return null;
  return weightedSum / totalWeight;
}

// Rundet auf halbe Noten, z.B. 1.0, 1.5, 2.0 …
function roundToHalf(val) {
  return Math.round(val * 2) / 2;
}

// Farbe abhängig von der Note
function gradeColor(grade) {
  if (grade <= 1.5) return "#2d9e6b";
  if (grade <= 2.5) return "#5aab4a";
  if (grade <= 3.5) return "#e8a820";
  if (grade <= 4.5) return "#e07c20";
  if (grade <= 5.5) return "#d64a2a";
  return "#b02020";
}

// Kartenfarbe je Niveaustufe (Index 0 = Note 1)
const CARD_COLORS = [
  { bg: "#eaf7f1", border: "#2d9e6b", badge: "#2d9e6b" },
  { bg: "#f0f8eb", border: "#5aab4a", badge: "#5aab4a" },
  { bg: "#fdf6e3", border: "#e8a820", badge: "#e8a820" },
  { bg: "#fef0e3", border: "#e07c20", badge: "#e07c20" },
  { bg: "#fdeee9", border: "#d64a2a", badge: "#d64a2a" },
  { bg: "#fbe9e9", border: "#b02020", badge: "#b02020" }
];

// Encode/Decode State für URL-Sharing
function encodeState() {
  const obj = {
    n: state.studentName,
    s: state.selections
  };
  return btoa(encodeURIComponent(JSON.stringify(obj)));
}

function decodeState(str) {
  try {
    return JSON.parse(decodeURIComponent(atob(str)));
  } catch (e) {
    return null;
  }
}

// ── Screens ──────────────────────────────────────────────────────────────────
function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

// ── Intro Screen ─────────────────────────────────────────────────────────────
document.getElementById("btn-start").addEventListener("click", () => {
  state.studentName = document.getElementById("student-name").value.trim();
  state.currentCat = 0;
  renderCategory();
  showScreen("screen-category");
});

document.getElementById("student-name").addEventListener("keydown", e => {
  if (e.key === "Enter") document.getElementById("btn-start").click();
});

// ── Category Screen ───────────────────────────────────────────────────────────
function renderCategory() {
  const cat = CATEGORIES[state.currentCat];
  const total = CATEGORIES.length;
  const idx = state.currentCat;

  // Header
  document.getElementById("cat-current").textContent = idx + 1;
  document.getElementById("cat-total").textContent = total;
  document.getElementById("cat-eyebrow").textContent = `Kategorie ${idx + 1} von ${total}`;
  document.getElementById("cat-title").textContent = cat.title;

  // Progress
  const pct = ((idx) / total) * 100;
  document.getElementById("progress-fill").style.width = pct + "%";

  // Karten
  const grid = document.getElementById("cards-grid");
  grid.innerHTML = "";

  cat.levels.forEach((text, levelIdx) => {
    const noteNum = levelIdx + 1;
    const colors = CARD_COLORS[levelIdx];
    const isSelected = state.selections[idx] === levelIdx;

    const card = document.createElement("div");
    card.className = "level-card" + (isSelected ? " selected" : "");
    card.dataset.level = levelIdx;
    card.style.setProperty("--card-bg", colors.bg);
    card.style.setProperty("--card-border", colors.border);
    card.style.setProperty("--card-badge", colors.badge);

    card.innerHTML = `
      <div class="card-badge">Note ${noteNum}</div>
      <p class="card-text">${text}</p>
      <div class="card-check">✓</div>
    `;

    card.addEventListener("click", () => selectLevel(levelIdx));
    grid.appendChild(card);
  });

  // Navigation
  document.getElementById("btn-back").style.visibility = idx === 0 ? "hidden" : "visible";
  document.getElementById("btn-next").disabled = state.selections[idx] === null;
  document.getElementById("btn-next").textContent =
    idx === total - 1 ? "Auswertung ansehen →" : "Weiter →";
}

function selectLevel(levelIdx) {
  const idx = state.currentCat;
  state.selections[idx] = levelIdx;

  // Karten visuell aktualisieren
  document.querySelectorAll(".level-card").forEach((card, i) => {
    card.classList.toggle("selected", i === levelIdx);
  });

  document.getElementById("btn-next").disabled = false;
}

document.getElementById("btn-next").addEventListener("click", () => {
  if (state.currentCat < CATEGORIES.length - 1) {
    state.currentCat++;
    renderCategory();
    // Smooth scroll nach oben
    document.getElementById("screen-category").scrollTo({ top: 0, behavior: "smooth" });
  } else {
    renderResult();
    showScreen("screen-result");
  }
});

document.getElementById("btn-back").addEventListener("click", () => {
  if (state.currentCat > 0) {
    state.currentCat--;
    renderCategory();
  } else {
    showScreen("screen-intro");
  }
});

// ── Result Screen ─────────────────────────────────────────────────────────────
function renderResult() {
  // Name
  const nameEl = document.getElementById("result-name-display");
  nameEl.textContent = state.studentName ? `${state.studentName}` : "";
  nameEl.style.display = state.studentName ? "block" : "none";

  // Gesamtnote
  const rawGrade = calcGrade();
  const rounded = roundToHalf(rawGrade);
  const color = gradeColor(rounded);

  const overallEl = document.getElementById("overall-grade");
  overallEl.textContent = rounded.toFixed(1).replace(".", ",");
  overallEl.style.color = color;

  // Floored integer für Label
  const gradeInt = Math.min(6, Math.max(1, Math.round(rawGrade)));
  document.getElementById("overall-grade-text").textContent =
    GRADE_LABELS[gradeInt] || "";

  // Breakdown
  const breakdown = document.getElementById("breakdown");
  breakdown.innerHTML = "";

  CATEGORIES.forEach((cat, i) => {
    const sel = state.selections[i];
    const noteNum = sel !== null ? sel + 1 : "–";
    const colors = sel !== null ? CARD_COLORS[sel] : { border: "#ccc", badge: "#999" };
    const text = sel !== null ? cat.levels[sel] : "Keine Auswahl";

    const item = document.createElement("div");
    item.className = "breakdown-item";
    item.style.setProperty("--item-border", colors.border);

    item.innerHTML = `
      <div class="breakdown-header">
        <span class="breakdown-cat">${cat.title}</span>
        <span class="breakdown-note" style="background:${colors.badge}">Note ${noteNum}</span>
      </div>
      <p class="breakdown-text">${text}</p>
    `;
    breakdown.appendChild(item);
  });
}

// Print
document.getElementById("btn-print").addEventListener("click", () => {
  window.print();
});

// Share
document.getElementById("btn-share").addEventListener("click", () => {
  const encoded = encodeState();
  const url = window.location.href.split("?")[0] + "?r=" + encoded;
  navigator.clipboard.writeText(url).then(() => {
    const toast = document.getElementById("share-toast");
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2500);
  }).catch(() => {
    prompt("Diesen Link kopieren:", url);
  });
});

// Restart
document.getElementById("btn-restart").addEventListener("click", () => {
  state.currentCat = 0;
  state.selections = Array(CATEGORIES.length).fill(null);
  state.studentName = "";
  document.getElementById("student-name").value = "";
  // URL bereinigen
  history.replaceState(null, "", window.location.pathname);
  showScreen("screen-intro");
});

// ── URL-Restore ───────────────────────────────────────────────────────────────
(function restoreFromURL() {
  const params = new URLSearchParams(window.location.search);
  const r = params.get("r");
  if (!r) return;
  const decoded = decodeState(r);
  if (!decoded) return;
  state.studentName = decoded.n || "";
  state.selections = decoded.s || Array(CATEGORIES.length).fill(null);
  document.getElementById("student-name").value = state.studentName;
  renderResult();
  showScreen("screen-result");
})();
