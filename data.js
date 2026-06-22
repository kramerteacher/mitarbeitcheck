// data.js
// Gewichtung: Alle Kategorien standardmäßig gleich (1.0)
// Zum Gewichten einzelne Werte anpassen, z.B. 1.5 für doppelte Gewichtung

const CATEGORIES = [
  {
    id: "qualitaet-beitraege",
    title: "Qualität der Beiträge",
    weight: 1.0,
    levels: [
      // Note 1
      "Ich bringe inhaltlich starke Beiträge ein, zeige eigene Ideen und Transfers und nutze vertieftes Fachwissen.",
      // Note 2
      "Ich gebe überwiegend richtige Beiträge und kann bei schwierigen Fragen mitdenken.",
      // Note 3
      "Ich gebe überwiegend richtige Beiträge und fasse Inhalte angemessen zusammen.",
      // Note 4
      "Meine Beiträge beschränken sich auf einfache Wiederholungen.",
      // Note 5
      "Meine Beiträge sind oft unvollständig oder fehlerhaft.",
      // Note 6
      "Ich gebe kaum oder keine fachlich richtigen Beiträge."
    ]
  },
  {
    id: "qualitaet-arbeitsergebnisse",
    title: "Qualität der Arbeitsergebnisse",
    weight: 1.0,
    levels: [
      "Ich löse Aufgaben selbstständig, auch schwierige, und stelle Lösungswege klar dar.",
      "Ich löse schwierige Aufgaben nach kurzer Hilfe nachvollziehbar.",
      "Ich löse geübte Aufgaben sicher und nachvollziehbar.",
      "Ich benötige häufig Unterstützung; Darstellung oft unklar.",
      "Ich löse selbst geübte Aufgaben kaum.",
      "Ich erreiche kaum richtige Ergebnisse."
    ]
  },
  {
    id: "praesenz-arbeitsverhalten",
    title: "Präsenz und Arbeitsverhalten",
    weight: 1.0,
    levels: [
      "Ich folge aufmerksam und signalisiere dies aktiv. Ich arbeite in allen Arbeitsphasen sehr aufmerksam mit.",
      "Ich folge konzentriert und stelle gelegentlich Fragen. Ich beteilige mich in den meisten Arbeitsphasen rege.",
      "Ich folge meist aufmerksam, bin aber manchmal abgelenkt. Ich beteilige mich gelegentlich in den Arbeitsphasen.",
      "Ich bin häufiger abgelenkt, folge aber zeitweise. Ich beteilige mich teilweise in einzelnen Arbeitsphasen.",
      "Ich bin oft abgelenkt und kann schlecht folgen. Ich beteilige mich kaum in einer Arbeitsphase.",
      "Ich zeige keine Bereitschaft zu folgen. Ich beteilige mich nicht in den einzelnen Arbeitsphasen."
    ]
  },
  {
    id: "fachsprache",
    title: "Verwendung der Fachsprache",
    weight: 1.0,
    levels: [
      "Ich nutze Fachsprache sicher, präzise und angemessen.",
      "Ich nutze Fachsprache meist sicher.",
      "Ich bemühe mich um korrekte Fachsprache.",
      "Ich bin im Umgang mit Fachsprache unsicher.",
      "Ich mache häufig Fehler in der Fachsprache.",
      "Ich nutze Fachbegriffe kaum oder falsch."
    ]
  },
  {
    id: "quantitaet",
    title: "Quantität",
    weight: 1.0,
    levels: [
      "Ich beteilige mich in fast jeder Stunde mehrfach.",
      "Ich beteilige mich regelmäßig und häufig.",
      "Ich beteilige mich in jeder Stunde gelegentlich.",
      "Ich beteilige mich unregelmäßig.",
      "Ich beteilige mich selten.",
      "Ich beteilige mich nie."
    ]
  },
  {
    id: "praesentation",
    title: "Präsentation der Arbeitsergebnisse",
    weight: 1.0,
    levels: [
      "Ich präsentiere sehr regelmäßig und zuverlässig meine Arbeitsergebnisse.",
      "Ich präsentiere regelmäßig Arbeitsergebnisse.",
      "Ich präsentiere gelegentlich einzelne Arbeitsergebnisse.",
      "Ich präsentiere vereinzelt Arbeitsergebnisse.",
      "Ich präsentiere selten einzelne Arbeitsergebnisse.",
      "Ich präsentiere keine Arbeitsergebnisse."
    ]
  }
];

// Notenbezeichnungen
const GRADE_LABELS = {
  1: "Sehr gut",
  2: "Gut",
  3: "Befriedigend",
  4: "Ausreichend",
  5: "Mangelhaft",
  6: "Ungenügend"
};
