# Selbsteinschätzung Mitarbeit

Interaktives Tool zur Selbsteinschätzung der Unterrichtsmitarbeit für Schüler*innen.

## Dateien

| Datei | Funktion |
|---|---|
| `index.html` | Struktur / Markup |
| `style.css` | Design |
| `data.js` | Kriterien, Gewichtung & Unterrichtsfächer |
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

## Unterrichtsfächer anpassen

Die Fächer stehen in `data.js` als `SUBJECTS`. Die Auswahl ist auf der Startseite
verpflichtend – ohne Fach lässt sich die Einschätzung nicht starten, weil sonst genau
der Überblick fehlt, um den es geht.

Sortiert ist die Liste **alphabetisch**, nicht nach Aufgabenfeld. Die Auswahl treffen
SuS, für die das Aufgabenfeld-Schema kein vertrautes Ordnungsprinzip ist: bei „Religion"
oder „Politik-Wirtschaft" ist die Zuordnung nicht selbsterklärend, alphabetisch ist die
Suchrichtung dagegen immer vorhersagbar. Dazu passt, dass ein natives `<select>` auf dem
iPad nur wenige Einträge gleichzeitig zeigt und die Type-Ahead-Funktion am Desktop
alphabetische Ordnung voraussetzt.

## Ergebnis teilen

Das Ergebnis steckt vollständig kodiert in der URL (`?r=…`) – Name, Fach, Zeitstempel und
Auswahl. Es wird nichts gespeichert und nichts an einen Server gesendet.

> Der Zeitstempel wird **beim Abschluss der Einschätzung** gesetzt und mit in den Link
> kodiert. Deshalb zeigt das PDF der Lehrkraft den Zeitpunkt der Einschätzung und nicht
> den, an dem der Link geöffnet wurde. Links aus der Zeit vor dieser Änderung enthalten
> weder Fach noch Zeitstempel – dort bleiben die beiden Zeilen leer, statt ein falsches
> Datum anzuzeigen.

Auf der Ergebnisseite gibt es zwei Wege zum Teilen:

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
gestrafft). Der Kopf des Ausdrucks führt Name, Fach sowie Datum und Uhrzeit.

Im ungünstigsten Fall – längste Formulierungen, langer Name, längster Fachname – füllt das
Ergebnis rund 66 % der Seitenhöhe. Wer die Kategorien in `data.js` erweitert oder die
Formulierungen deutlich verlängert, sollte den Ausdruck erneut prüfen.
