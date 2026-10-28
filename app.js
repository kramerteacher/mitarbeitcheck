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

  // Bild im Voraus erzeugen, damit der Teilen-Klick ohne Wartezeit auskommt
  prepareResultImage();
}

// ── Ergebnisbild ──────────────────────────────────────────────────────────────
// Von Hand auf ein Canvas gezeichnet statt per Bibliothek: html2canvas & Co. wären
// ~200 KB und scheitern auf iOS Safari gern an Webfonts und CSS-Variablen.

const IMG = {
  width: 1000,
  pad: 56,
  scale: 2 // doppelte Auflösung, damit es auf Retina-Displays scharf bleibt
};

function imgFont(weight, size) {
  return `${weight} ${size}px Inter, system-ui, -apple-system, sans-serif`;
}

// ctx.roundRect fehlt auf älteren iPads – deshalb von Hand über arcTo
function roundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function wrapLines(ctx, text, maxWidth) {
  const lines = [];
  let line = "";
  String(text).split(/\s+/).forEach(word => {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width <= maxWidth || !line) {
      line = test;
    } else {
      lines.push(line);
      line = word;
    }
  });
  if (line) lines.push(line);
  return lines;
}

// Schriftgröße so weit verkleinern, bis der Text in die Breite passt
function fitFont(ctx, text, weight, startSize, maxWidth, minSize) {
  let size = startSize;
  ctx.font = imgFont(weight, size);
  while (ctx.measureText(text).width > maxWidth && size > minSize) {
    size -= 1;
    ctx.font = imgFont(weight, size);
  }
  return size;
}

// Inter muss geladen sein, bevor gezeichnet wird – sonst fällt Canvas still auf
// eine Systemschrift zurück und alle vorab gemessenen Breiten stimmen nicht mehr.
async function ensureFonts() {
  if (!document.fonts || !document.fonts.load) return;
  try {
    await Promise.all([
      document.fonts.load(imgFont(400, 25)),
      document.fonts.load(imgFont(600, 30)),
      document.fonts.load(imgFont(700, 27)),
      document.fonts.load(imgFont(800, 46))
    ]);
    await document.fonts.ready;
  } catch (e) {
    // Ohne Inter sieht das Bild anders aus, erzeugt wird es trotzdem
  }
}

async function renderResultImage() {
  await ensureFonts();

  const W = IMG.width;
  const pad = IMG.pad;
  const contentW = W - pad * 2;

  const itemPadX = 28;
  const itemPadY = 26;
  const barW = 6;
  const lineH = 34;
  const textW = contentW - itemPadX * 2 - barW - 10;

  // Messdurchlauf: erst die Gesamthöhe bestimmen, dann das Canvas anlegen
  const probe = document.createElement("canvas").getContext("2d");

  const items = CATEGORIES.map((cat, i) => {
    const sel = state.selections[i];
    const colors = sel !== null ? RESULT_COLORS[sel] : { border: "#cccccc", badge: "#999999" };
    probe.font = imgFont(400, 25);
    const lines = wrapLines(probe, sel !== null ? cat.levels[sel] : "Keine Auswahl", textW);
    return {
      title: cat.title,
      note: sel !== null ? sel + 1 : "–",
      colors,
      lines,
      height: itemPadY * 2 + 30 + 14 + lines.length * lineH
    };
  });

  const metaLine = [state.subject, formatTimestamp(state.timestamp)].filter(Boolean).join(" · ");
  const hasName = !!state.studentName;
  const nameSize = hasName ? fitFont(probe, state.studentName, 800, 46, contentW, 26) : 0;

  const gradeBoxH = 230;
  let headerH = 22 + 26;
  if (hasName) headerH += 46 + 14;
  if (metaLine) headerH += 26;
  headerH += 40;

  const itemsH = items.reduce((sum, it) => sum + it.height, 0) + (items.length - 1) * 14;
  const totalH = Math.round(pad + headerH + gradeBoxH + 36 + itemsH + pad);

  // Zeichnen
  const canvas = document.createElement("canvas");
  canvas.width = W * IMG.scale;
  canvas.height = totalH * IMG.scale;
  const ctx = canvas.getContext("2d");
  ctx.scale(IMG.scale, IMG.scale);

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, W, totalH);

  let y = pad;

  ctx.textAlign = "left";
  ctx.font = imgFont(700, 22);
  ctx.fillStyle = "#2563eb";
  ctx.fillText("SELBSTEINSCHÄTZUNG MITARBEIT", pad, y + 18);
  y += 22 + 26;

  if (hasName) {
    ctx.font = imgFont(800, nameSize);
    ctx.fillStyle = "#1a2030";
    ctx.fillText(state.studentName, pad, y + 38);
    y += 46 + 14;
  }

  if (metaLine) {
    ctx.font = imgFont(600, 26);
    ctx.fillStyle = "#6b7a90";
    ctx.fillText(metaLine, pad, y + 21);
    y += 26;
  }
  y += 40;

  // Notenbox
  const rawGrade = calcGrade();
  const rounded = roundToHalf(rawGrade);
  const gradeInt = Math.min(6, Math.max(1, Math.round(rawGrade)));

  roundedRect(ctx, pad, y, contentW, gradeBoxH, 18);
  ctx.fillStyle = "#f8fafc";
  ctx.fill();
  ctx.strokeStyle = "#e2e6ea";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.textAlign = "center";
  ctx.font = imgFont(700, 20);
  ctx.fillStyle = "#6b7a90";
  ctx.fillText("GESAMTNOTE", W / 2, y + 48);

  ctx.font = imgFont(800, 108);
  ctx.fillStyle = gradeColor(rounded);
  ctx.fillText(rounded.toFixed(1).replace(".", ","), W / 2, y + 160);

  ctx.font = imgFont(600, 30);
  ctx.fillStyle = "#6b7a90";
  ctx.fillText(GRADE_LABELS[gradeInt] || "", W / 2, y + 202);

  y += gradeBoxH + 36;
  ctx.textAlign = "left";

  // Einzelkategorien
  items.forEach(it => {
    roundedRect(ctx, pad, y, contentW, it.height, 14);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.strokeStyle = "#e2e6ea";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Farbbalken an der linken Kante, auf die runde Ecke beschnitten
    ctx.save();
    roundedRect(ctx, pad, y, contentW, it.height, 14);
    ctx.clip();
    ctx.fillStyle = it.colors.border;
    ctx.fillRect(pad, y, barW, it.height);
    ctx.restore();

    const tx = pad + barW + itemPadX;
    let ty = y + itemPadY;

    // Note-Badge rechts
    const badgeText = `Note ${it.note}`;
    ctx.font = imgFont(800, 20);
    const badgeW = ctx.measureText(badgeText).width + 28;
    const badgeX = pad + contentW - itemPadX - badgeW;
    roundedRect(ctx, badgeX, ty, badgeW, 34, 8);
    ctx.fillStyle = it.colors.badge;
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.fillText(badgeText, badgeX + badgeW / 2, ty + 23);
    ctx.textAlign = "left";

    // Kategorietitel – notfalls verkleinert, damit er nicht unters Badge läuft
    fitFont(ctx, it.title, 700, 27, badgeX - tx - 16, 18);
    ctx.fillStyle = "#1a2030";
    ctx.fillText(it.title, tx, ty + 24);
    ty += 30 + 14;

    // Gewählte Formulierung
    ctx.font = imgFont(400, 25);
    ctx.fillStyle = "#6b7a90";
    it.lines.forEach(line => {
      ctx.fillText(line, tx, ty + 20);
      ty += lineH;
    });

    y += it.height + 14;
  });

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => (blob ? resolve(blob) : reject(new Error("toBlob lieferte nichts"))),
      "image/png"
    );
  });
}

// Dateiname wie "Mitarbeit_Mathematik_Lena-Schmidt_2026-10-28.png"
function imageFilename() {
  const d = state.timestamp ? new Date(state.timestamp) : new Date();
  const datum = [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0")
  ].join("-");

  return ["Mitarbeit", state.subject, state.studentName, datum]
    .filter(Boolean)
    .join("_")
    .replace(/[^\p{L}\p{N}_-]+/gu, "-") + ".png";
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

// Betreffzeile für die E-Mail: "Selbsteinschätzung Mitarbeit – Mathematik – Lena Schmidt"
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

// Das Bild wird schon beim Aufbau der Ergebnisseite erzeugt, nicht erst beim Klick.
// Grund: iOS verlangt, dass navigator.share() unmittelbar aus der Nutzergeste heraus
// aufgerufen wird. Wer davor noch rendert und awaitet, verliert sie und bekommt
// sporadische "not a user gesture"-Abbrüche.
let pendingImage = null;

function prepareResultImage() {
  pendingImage = null;
  renderResultImage()
    .then(blob => { pendingImage = new File([blob], imageFilename(), { type: "image/png" }); })
    .catch(() => { pendingImage = null; });
}

function downloadFile(file) {
  const url = URL.createObjectURL(file);
  const a = document.createElement("a");
  a.href = url;
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

// Hauptweg: Bild ins Sharesheet. Bewusst NUR files übergeben – sobald zusätzlich
// text/url gesetzt sind, entscheidet iOS selbst, was beim Ziel ankommt, und kopiert
// dann gern nur die Titelzeile statt des eigentlichen Inhalts.
document.getElementById("btn-image").addEventListener("click", () => {
  if (pendingImage && navigator.canShare && navigator.canShare({ files: [pendingImage] })) {
    const file = pendingImage;
    navigator.share({ files: [file] }).catch(err => {
      if (err && err.name === "AbortError") return; // Nutzer hat abgebrochen
      downloadFile(file);
    });
    return;
  }

  if (pendingImage) {
    downloadFile(pendingImage);
    showToast("Bild gespeichert");
    return;
  }

  // Noch nicht fertig oder fehlgeschlagen: jetzt erzeugen und herunterladen.
  // Teilen geht hier nicht mehr, die Geste ist nach dem await verbraucht.
  showToast("Bild wird erstellt …");
  renderResultImage()
    .then(blob => {
      downloadFile(new File([blob], imageFilename(), { type: "image/png" }));
      showToast("Bild gespeichert");
    })
    .catch(() => showToast("Bild konnte nicht erstellt werden"));
});

// Link: direkt in die Zwischenablage, ohne Sharesheet dazwischen
function showLinkFallback(url) {
  const field = document.getElementById("link-field");
  document.getElementById("link-fallback").hidden = false;
  field.value = url;
  field.focus();
  field.setSelectionRange(0, url.length); // iOS markiert sonst nichts
}

document.getElementById("btn-copy").addEventListener("click", () => {
  const url = buildResultUrl();
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url)
      .then(() => {
        document.getElementById("link-fallback").hidden = true;
        showToast("Link kopiert!");
      })
      .catch(() => showLinkFallback(url));
  } else {
    showLinkFallback(url);
  }
});

// "Weitere Optionen" auf-/zuklappen
document.getElementById("btn-more").addEventListener("click", () => {
  const panel = document.getElementById("more-panel");
  const open = panel.hidden;
  panel.hidden = !open;
  document.getElementById("btn-more").setAttribute("aria-expanded", String(open));
});

// E-Mail per mailto (Panel auf-/zuklappen)
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

// Drucken
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
  // Vorbereitetes Bild verwerfen
  pendingImage = null;
  // Aufgeklappte Bereiche schließen und leeren
  document.getElementById("more-panel").hidden = true;
  document.getElementById("btn-more").setAttribute("aria-expanded", "false");
  document.getElementById("link-fallback").hidden = true;
  document.getElementById("link-field").value = "";
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
