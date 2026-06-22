# Selbsteinschätzung Mitarbeit

Interaktives Tool zur Selbsteinschätzung der Unterrichtsmitarbeit für Schüler*innen.

## Dateien

| Datei | Funktion |
|---|---|
| `index.html` | Struktur / Markup |
| `style.css` | Design |
| `data.js` | Kriterien & Gewichtung |
| `app.js` | Logik (Navigation, Berechnung, Sharing) |

## Auf GitHub Pages veröffentlichen

1. Neues Repository auf [github.com](https://github.com) anlegen (z.B. `mitarbeit-selbsteinschaetzung`)
2. Alle vier Dateien hochladen (per Drag & Drop oder Upload-Button)
3. In den Repository-Einstellungen: **Settings → Pages → Branch: main → / (root) → Save**
4. Nach ca. 1 Minute ist die Seite erreichbar unter:  
   `https://DEIN-USERNAME.github.io/mitarbeit-selbsteinschaetzung/`

## Gewichtung anpassen

In `data.js` hat jede Kategorie einen `weight`-Wert (Standard: `1.0`).  
Beispiel: Kategorie doppelt gewichten → `weight: 2.0`

```js
{
  id: "qualitaet-beitraege",
  title: "Qualität der Beiträge",
  weight: 2.0,   // ← doppelt gewichtet
  ...
}
```

## Link-Sharing

Auf der Ergebnisseite erzeugt „Link kopieren" eine URL mit dem kodierten Ergebnis –  
SuS können diesen Link z.B. per Schulmail an die Lehrkraft schicken.
