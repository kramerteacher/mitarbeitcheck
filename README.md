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

Die Ergebnisseite ist bewusst gestaffelt: **„Als Bild speichern"** ist die Hauptaktion,
**„Link kopieren"** steht daneben, Drucken und E-Mail liegen hinter „Weitere Optionen".
Grund ist beobachtetes Nutzungsverhalten – SuS verschicken bevorzugt Screenshots und
nutzen die Mail-App auf den iPads praktisch gar nicht.

### „Als Bild speichern"

Erzeugt ein PNG mit dem vollständigen Ergebnis (Name, Fach, Zeitpunkt, Gesamtnote und alle
sechs Kategorien samt gewählter Formulierung) und übergibt es dem Sharesheet. Auf dem iPad
erscheint damit dasselbe Menü wie beim Screenshot-Teilen: „Bild sichern" legt es in *Fotos*,
oder es geht direkt an IServ. Wo `navigator.share` mit Dateien fehlt (Desktop-Chrome,
Firefox), wird die Datei stattdessen heruntergeladen.

Gezeichnet wird per Canvas von Hand, ohne Bibliothek – `html2canvas` & Co. wären ~200 KB
und scheitern auf iOS Safari gern an Webfonts und CSS-Variablen. Zwei Details sind wichtig:

- Das Bild wird **vorab** beim Aufbau der Ergebnisseite erzeugt, nicht erst beim Klick.
  iOS verlangt, dass `navigator.share()` unmittelbar aus der Nutzergeste heraus läuft; wer
  davor noch rendert und `await`et, verliert sie und bekommt sporadische Abbrüche.
- `ensureFonts()` wartet auf Inter, bevor gezeichnet wird. Sonst fällt Canvas still auf eine
  Systemschrift zurück und die vorab gemessenen Textbreiten stimmen nicht mehr.

### „Link kopieren"

Schreibt die URL direkt über `navigator.clipboard.writeText()` – **bewusst ohne Sharesheet**.

> Früher lief das über `navigator.share({ title, text, url })`. Sind `text` und `url`
> gleichzeitig gesetzt, bekommt das iOS-Sharesheet zwei Elemente und entscheidet selbst,
> welches beim Ziel ankommt; bei „Kopieren" und beim Einfügen in Fremd-Apps gewann
> regelmäßig `text`, also nur die Titelzeile. Ein direkter Schreibvorgang in die
> Zwischenablage hat diese Mehrdeutigkeit nicht. Aus demselben Grund übergibt der
> Bild-Button **nur** `files` und kein `text`/`url` daneben.

Schlägt der Zugriff fehl (blockierte Zwischenablage), erscheint stattdessen ein Feld mit
dem vormarkierten Link zum manuellen Kopieren.

### „Ergebnis per E-Mail teilen"

Klappt ein Feld für die Adresse der Lehrkraft auf und öffnet das E-Mail-Programm mit
fertigem Betreff, Notenübersicht und Link.

> Ein Versand **ohne** das E-Mail-Programm des Nutzers – oder ein PDF als Anhang – ist auf
> einer statischen Seite technisch nicht möglich. Das bräuchte einen Server, einen
> Mailprovider, Missbrauchsschutz und wegen der Schülerdaten eine datenschutzrechtliche
> Freigabe. Der `mailto:`-Weg hält die Daten im Mailsystem der Schule.

## PDF-Export

„Drucken / Als PDF speichern" ist über `@media print` in `style.css` auf **genau eine
A4-Seite** ausgelegt (Icon und Buttons ausgeblendet, Gesamtnote verkleinert, Abstände
gestrafft). Der Kopf des Ausdrucks führt Name, Fach sowie Datum und Uhrzeit.

Im ungünstigsten Fall – längste Formulierungen, langer Name, längster Fachname – füllt das
Ergebnis rund 65 % der Seitenhöhe. Wer die Kategorien in `data.js` erweitert oder die
Formulierungen deutlich verlängert, sollte den Ausdruck erneut prüfen.

## Stolperfalle: `hidden` und `display`

Aufklappbare Bereiche (`.more-panel`, `.email-panel`, `.link-fallback`) tragen das
`hidden`-Attribut. Author-Styles schlagen aber die UA-Regel `[hidden] { display: none }`,
sodass ein `display: flex` aus der Klasse gewinnt und das Panel trotz `hidden` sichtbar
bleibt. Deshalb steht ganz oben in `style.css`:

```css
[hidden] { display: none !important; }
```

Wer ein neues aufklappbares Element mit eigenem `display` anlegt, sollte das im Blick
behalten – der Fehler ist still und fällt nur im geschlossenen Zustand auf.
