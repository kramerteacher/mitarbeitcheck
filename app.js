// app.js

// ── State ────────────────────────────────────────────────────────────────────
const state = {
  currentCat: 0,
  selections: Array(CATEGORIES.length).fill(null), // index 0–5 = Note 1–6
  studentName: "",
  subject: "",
  timestamp: null // Zeitpunkt des Abschlusses, wandert mit in den Share-Link
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

// Kartenfarben für die AUSWAHLSEITEN: einfarbige Blauskala (keine Wertung)
// Index 0 = Note 1 (sehr hell), Index 5 = Note 6 (kräftiges Blau)
const CARD_COLORS = [
  { bg: "#f2f7fe", border: "#cfe0f7", badge: "#3f76ba" },
  { bg: "#e6effb", border: "#b5cff2", badge: "#396da8" },
  { bg: "#d8e6f8", border: "#97bbea", badge: "#326096" },
  { bg: "#c7daf4", border: "#7aa6e0", badge: "#2a5385" },
  { bg: "#b3cbee", border: "#5d8fd4", badge: "#224673" },
  { bg: "#9db9e5", border: "#4176c0", badge: "#1a3860" }
];

// Kartenfarben für die ERGEBNISSEITE: farbig wie ursprünglich
const RESULT_COLORS = [
  { bg: "#eaf7f1", border: "#2d9e6b", badge: "#2d9e6b" },
  { bg: "#f0f8eb", border: "#5aab4a", badge: "#5aab4a" },
  { bg: "#fdf6e3", border: "#e8a820", badge: "#e8a820" },
  { bg: "#fef0e3", border: "#e07c20", badge: "#e07c20" },
  { bg: "#fdeee9", border: "#d64a2a", badge: "#d64a2a" },
  { bg: "#fbe9e9", border: "#b02020", badge: "#b02020" }
];

// Datum/Uhrzeit deutsch formatiert, z.B. "08.08.2026, 14:32 Uhr"
function formatTimestamp(ts) {
  if (!ts) return "";
  const d = new Date(ts);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleString("de-DE", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit"
  }) + " Uhr";
}

// Encode/Decode State für URL-Sharing
// f = Fach, t = Zeitstempel. Beide müssen mitkodiert werden, damit die Lehrkraft
// im geteilten Link den Zeitpunkt der Einschätzung sieht – nicht den des Öffnens.
function encodeState() {
  const obj = {
    n: state.studentName,
    f: state.subject,
    t: state.timestamp,
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

// Fächer-Dropdown aus data.js aufbauen
(function buildSubjectOptions() {
  const select = document.getElementById("student-subject");
  SUBJECTS.forEach(name => {
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    select.appendChild(opt);
  });
})();

// Ohne Fach kein Start – der Überblick über mehrere Einschätzungen
// funktioniert nur, wenn das Fach gesetzt ist.
document.getElementById("student-subject").addEventListener("change", e => {
  document.getElementById("btn-start").disabled = !e.target.value;
});

document.getElementById("btn-start").addEventListener("click", () => {
  state.studentName = document.getElementById("student-name").value.trim();
  state.subject = document.getElementById("student-subject").value;
  if (!state.subject) return;
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
    // Abschlusszeitpunkt festhalten (bei Korrekturen über "Zurück" aktualisiert er sich)
    state.timestamp = Date.now();
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

  // Fach
  const subjEl = document.getElementById("result-subject-display");
  subjEl.textContent = state.subject;
  subjEl.style.display = state.subject ? "block" : "none";

  // Datum/Uhrzeit – bei alten Share-Links ohne Zeitstempel bleibt die Zeile leer,
  // besser als ein falsches Datum anzuzeigen
  const dateEl = document.getElementById("result-date-display");
  const dateText = formatTimestamp(state.timestamp);
  dateEl.textContent = dateText;
  dateEl.style.display = dateText ? "block" : "none";

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
    const colors = sel !== null ? RESULT_COLORS[sel] : { border: "#ccc", badge: "#999" };
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

// ── Teilen ────────────────────────────────────────────────────────────────────

// Baut die teilbare URL mit kodiertem Ergebnis
function buildResultUrl() {
  return window.location.href.split("?")[0] + "?r=" + encodeState();
}

function showToast(msg) {
  const toast = document.getElementById("share-toast");
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2500);
}

// Fallback, wenn kein System-Sharesheet verfügbar ist
function copyLink(url) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(url)
      .then(() => showToast("Link kopiert!"))
      .catch(() => prompt("Diesen Link kopieren:", url));
  } else {
    prompt("Diesen Link kopieren:", url);
  }
}

// Kurzfassung des Ergebnisses als Klartext (für die E-Mail)
// Betreffzeile / Sharesheet-Titel: "Selbsteinschätzung Mitarbeit – Mathematik – Lena Schmidt"
function resultHeadline() {
  return ["Selbsteinschätzung Mitarbeit", state.subject, state.studentName]
    .filter(Boolean)
    .join(" – ");
}

function resultSummaryText() {
  const lines = [];
  if (state.studentName) lines.push(`Name: ${state.studentName}`);
  if (state.subject) lines.push(`Fach: ${state.subject}`);
  const dateText = formatTimestamp(state.timestamp);
  if (dateText) lines.push(`Zeitpunkt: ${dateText}`);
  lines.push(`Gesamtnote: ${roundToHalf(calcGrade()).toFixed(1).replace(".", ",")}`);
  lines.push("", "Einzelkategorien:");
  CATEGORIES.forEach((cat, i) => {
    const sel = state.selections[i];
    lines.push(`- ${cat.title}: Note ${sel !== null ? sel + 1 : "–"}`);
  });
  return lines.join("\n");
}

// Option 1: System-Sharesheet, sonst Zwischenablage
document.getElementById("btn-share").addEventListener("click", async () => {
  const url = buildResultUrl();
  const shareData = {
    title: "Selbsteinschätzung Mitarbeit",
    text: resultHeadline(),
    url
  };

  if (navigator.share) {
    try {
      await navigator.share(shareData);
      return;
    } catch (err) {
      // Nutzer hat das Sharesheet abgebrochen – dann nicht zusätzlich kopieren
      if (err && err.name === "AbortError") return;
      // jeder andere Fehler: unten auf die Zwischenablage zurückfallen
    }
  }
  copyLink(url);
});

// Option 2: E-Mail per mailto (Panel auf-/zuklappen)
document.getElementById("btn-email").addEventListener("click", () => {
  const panel = document.getElementById("email-panel");
  const btn = document.getElementById("btn-email");
  const open = panel.hidden;
  panel.hidden = !open;
  btn.setAttribute("aria-expanded", String(open));
  if (open) document.getElementById("email-to").focus();
});

function sendMail() {
  const input = document.getElementById("email-to");
  const error = document.getElementById("email-error");
  const to = input.value.trim();

  if (!to || !input.checkValidity()) {
    error.hidden = false;
    input.focus();
    return;
  }
  error.hidden = true;

  const subject = resultHeadline();
  const body = `${resultSummaryText()}\n\nVollständiges Ergebnis zum Ansehen und Ausdrucken:\n${buildResultUrl()}\n`;

  window.location.href =
    `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

document.getElementById("btn-email-send").addEventListener("click", sendMail);
document.getElementById("email-to").addEventListener("keydown", e => {
  if (e.key === "Enter") sendMail();
});
document.getElementById("email-to").addEventListener("input", () => {
  document.getElementById("email-error").hidden = true;
});

// Option 3: Drucken
document.getElementById("btn-print").addEventListener("click", () => {
  window.print();
});

// Restart
document.getElementById("btn-restart").addEventListener("click", () => {
  state.currentCat = 0;
  state.selections = Array(CATEGORIES.length).fill(null);
  state.studentName = "";
  state.subject = "";
  state.timestamp = null;
  document.getElementById("student-name").value = "";
  document.getElementById("student-subject").value = "";
  document.getElementById("btn-start").disabled = true;
  // E-Mail-Panel zuklappen und leeren
  document.getElementById("email-panel").hidden = true;
  document.getElementById("btn-email").setAttribute("aria-expanded", "false");
  document.getElementById("email-to").value = "";
  document.getElementById("email-error").hidden = true;
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

  // Nur gültige Auswahlen übernehmen – ein manipulierter Link darf die Seite
  // nicht in einen Zustand bringen, in dem calcGrade() null liefert.
  const sel = Array.isArray(decoded.s) ? decoded.s : [];
  state.selections = CATEGORIES.map((_, i) =>
    Number.isInteger(sel[i]) && sel[i] >= 0 && sel[i] < 6 ? sel[i] : null
  );
  if (state.selections.every(v => v === null)) return;

  state.studentName = typeof decoded.n === "string" ? decoded.n : "";
  // Fach nur übernehmen, wenn es wirklich eins aus der Liste ist
  state.subject = SUBJECTS.includes(decoded.f) ? decoded.f : "";
  state.timestamp = Number.isFinite(decoded.t) ? decoded.t : null;

  document.getElementById("student-name").value = state.studentName;
  if (state.subject) {
    document.getElementById("student-subject").value = state.subject;
    document.getElementById("btn-start").disabled = false;
  }
  renderResult();
  showScreen("screen-result");
})();
