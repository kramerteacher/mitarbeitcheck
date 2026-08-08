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

## Ergebnis teilen

Das Ergebnis steckt vollständig kodiert in der URL (`?r=…`) – es wird nichts gespeichert
und nichts an einen Server gesendet. Auf der Ergebnisseite gibt es dafür zwei Wege:

**„Ergebnis teilen"** öffnet das systemeigene Sharesheet (Web Share API). Das funktioniert
auf iPad/iPhone, in Safari auf macOS sowie in Chrome/Edge auf Windows und Android.
Wo die API fehlt (Chrome auf macOS, Firefox Desktop), fällt der Button automatisch auf
„Link in die Zwischenablage" zurück – ohne sichtbaren Bruch für die Nutzer.

**„Ergebnis per E-Mail teilen"** klappt ein Feld für die Adresse der Lehrkraft auf und
öffnet anschließend das E-Mail-Programm mit fertigem Betreff, Notenübersicht und Link.

> Ein Versand **ohne** das E-Mail-Programm des Nutzers – oder ein PDF als Anhang – ist auf
> einer statischen Seite technisch nicht möglich. Das bräuchte einen Server, einen
> Mailprovider, Missbrauchsschutz und wegen der Schülerdaten eine datenschutzrechtliche
> Freigabe. Der `mailto:`-Weg hält die Daten im Mailsystem der Schule.

## PDF-Export

„Drucken / Als PDF speichern" ist über `@media print` in `style.css` auf **genau eine
A4-Seite** ausgelegt (Icon und Buttons ausgeblendet, Gesamtnote verkleinert, Abstände
gestrafft). Im ungünstigsten Fall – längste Formulierungen, langer Name – füllt das
Ergebnis rund 63 % der Seitenhöhe.
