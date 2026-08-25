import type {
  Appointment,
  Case,
  Client,
  Deadline,
  Inquiry,
  Message,
  Owner,
  Question,
  Slot,
  WorkflowTemplate,
} from './types'

/*
 * Every value below is taken from the Paper artboards so the prototype renders
 * identical to the design on first load. The demo path adds to this state; it
 * never needs to overwrite it.
 *
 * "Today" in the design is Monday, 10 August 2026, 14:22.
 */

export const TODAY = 'Montag, 10. August 2026'
export const NOW = '14:22'

/*
 * The design's totals are larger than the rows it lists — twelve mandates but
 * six rows, twenty-three messages this week but eight rows, nine deadlines but
 * eight. That is deliberate: these screens show the top of a longer list.
 *
 * So counts are rendered as `baseline + whatever the demo adds`, rather than
 * counting the seeded rows. Otherwise the badges would contradict the copy
 * right next to them.
 */
export const baseline = {
  mandates: 12,
  /** Rail badge for Postfach — messages needing her eye, not the week total. */
  outbox: 7,
  /** „9 FRISTEN · 5 MANDATE" in the Fristen header. */
  deadlines: 9,
  /** „Diese Woche 23" and the two author splits in the Postfach filters. */
  outboxWeek: 23,
  outboxFromEnsera: 19,
  outboxFromHer: 4,
}

export const consultant = {
  name: 'Katrin Held',
  initials: 'KH',
  practice: 'Energieberatung Held',
  registry: 'EEE · 184 992',
  phone: '05171 · 40 22 88',
  office: 'Büro Wollenweberstr. 8, Peine',
}

// ─────────────────────────────────────────────────────────────── Anfragen

export const inquiries: Inquiry[] = [
  {
    id: 'sander',
    name: 'Tobias Sander',
    email: 't.sander@posteo.de',
    location: '31224 Peine',
    arrived: 'heute, 09:12',
    listDate: 'HEUTE',
    listTime: '09:12',
    summary: 'Ölheizung von 1998, will auf Wärmepumpe wechseln',
    tag: 'EFH · PEINE · ALLE REGELN ERFÜLLT',
    tagState: 'neu',
    state: 'neu',
    buildingType: 'Einfamilienhaus',
    intent: 'Heizung tauschen',
    timeframe: '3 bis 6 Monate',
    quote:
      '„Unsere Ölheizung ist von 1998 und war letzten Winter zweimal aus. Wir würden auf Wärmepumpe wechseln, wissen aber nicht, ob das Haus dafür überhaupt gedämmt genug ist. Baujahr 1972, wir haben 1998 neue Fenster einbauen lassen."',
    // Order matters: the detail panel fills the first three into the left
    // column and the rest into the right, matching the artboard's layout.
    rules: [
      { label: 'Ein- oder Zweifamilienhaus', state: 'erfuellt' },
      { label: 'kein Gewerbe', state: 'erfuellt' },
      { label: 'kein Neubau — Baujahr 1972 aus dem Text', state: 'erfuellt' },
      { label: 'kein MFH', state: 'erfuellt' },
      { label: 'keine größere Sanierung', state: 'erfuellt' },
      { label: 'Denkmalschutz nicht beantwortet', state: 'offen' },
    ],
    suggestion:
      'Vorschlag: iSFP zuerst, dann KfW 458 — mit Fahrplan gibt es auf den Heizungstausch fünf Prozent mehr. Denkmalschutz klären Sie im Erstgespräch, dafür ist es kein Hindernis.',
  },
  {
    id: 'deibel',
    name: 'Marion Deibel',
    email: 'm.deibel@gmx.de',
    location: '31241 Ilsede',
    arrived: 'gestern, 17:40',
    listDate: 'GESTERN',
    listTime: '17:40',
    summary: 'Mehrfamilienhaus mit sechs Wohnungen, Dach und Heizung',
    tag: 'MFH · AUSSERHALB IHRES ZUSCHNITTS',
    tagState: 'ausserhalb',
    state: 'neu',
    buildingType: 'Mehrfamilienhaus',
    intent: 'Sanierungsfahrplan',
    timeframe: 'So schnell wie möglich',
    quote:
      '„Wir haben ein Mehrfamilienhaus mit sechs Wohnungen von 1961. Das Dach ist undicht und die Gasheizung von 1994 macht Geräusche. Die Eigentümergemeinschaft will vor der nächsten Versammlung wissen, was auf sie zukommt."',
    rules: [
      { label: 'Ein- oder Zweifamilienhaus', state: 'verletzt' },
      { label: 'kein Gewerbe', state: 'erfuellt' },
      { label: 'kein Neubau — Baujahr 1961', state: 'erfuellt' },
      { label: 'kein MFH — sechs Wohnungen', state: 'verletzt' },
      { label: 'keine größere Sanierung', state: 'offen' },
      { label: 'Denkmalschutz nicht beantwortet', state: 'offen' },
    ],
    suggestion:
      'Vorschlag: absagen und weiterempfehlen. Sechs Wohnungen liegen außerhalb Ihres Zuschnitts — für MFH ist das Büro Kramer in Braunschweig antragsberechtigt.',
  },
  {
    id: 'ostermann',
    name: 'Kai Ostermann',
    email: 'k.ostermann@web.de',
    location: '31228 Peine',
    arrived: '08.08., 11:26',
    listDate: '08.08.',
    summary: 'Sanierungsfahrplan vor dem Verkauf',
    tag: 'ANGENOMMEN · ZUGANG RAUS',
    tagState: 'erledigt',
    state: 'angenommen',
    buildingType: 'Einfamilienhaus',
    intent: 'Sanierungsfahrplan',
    timeframe: 'Erst mal nur informieren',
    quote:
      '„Wir wollen das Haus meiner Eltern verkaufen und hätten gern schwarz auf weiß, was ein Käufer investieren müsste. Baujahr 1979, Gasheizung von 2011."',
    rules: [
      { label: 'Ein- oder Zweifamilienhaus', state: 'erfuellt' },
      { label: 'kein MFH', state: 'erfuellt' },
      { label: 'kein Gewerbe', state: 'erfuellt' },
      { label: 'keine größere Sanierung', state: 'erfuellt' },
      { label: 'kein Neubau — Baujahr 1979', state: 'erfuellt' },
      { label: 'kein Denkmalschutz', state: 'erfuellt' },
    ],
  },
]

/** Toggle in the Anfragen footer: off means every inquiry crosses her desk. */
export const autoAcceptDefault = false

// ─────────────────────────────────────────────────────────────── Kundschaft

export const clients: Client[] = [
  {
    id: 'kowalski',
    name: 'Anja Kowalski',
    address: 'Am Wall 27',
    program: 'BAFA EBW · iSFP',
    docsTotal: 4,
    openQuestions: 0,
    lastContact: 'vor 11 Tagen',
    lastContactStale: true,
    owner: 'kundschaft',
    nextDeadline: { date: '22.08.', label: 'Unterlagen' },
  },
  {
    id: 'brendel',
    name: 'Hans-Jürgen Brendel',
    address: 'Lindenallee 3',
    program: 'BAFA EBW · iSFP',
    docsTotal: 9,
    openQuestions: 2,
    lastContact: 'heute, 08:41',
    owner: 'sie',
    ownerNote: 'BAFA-RÜCKFRAGE',
    ownerTask: 'Rückfrage der BAFA',
    nextDeadline: { date: '08.08. überfällig', label: 'Antwort an die BAFA', overdue: true },
  },
  {
    id: 'petersen',
    name: 'Silke Petersen',
    address: 'Hauptstraße 41',
    program: 'BAFA EBW · iSFP',
    docsTotal: 6,
    openQuestions: 0,
    lastContact: 'vor 2 Tagen',
    owner: 'kundschaft',
    nextDeadline: { date: '02.09.', label: 'Verwendungsnachweis' },
  },
  {
    id: 'reuter',
    name: 'Familie Reuter',
    address: 'Buchenweg 14',
    program: 'BAFA EBW · iSFP',
    docsTotal: 7,
    openQuestions: 1,
    lastContact: 'vor 3 Tagen',
    owner: 'kundschaft',
    nextDeadline: { date: '15.08.', label: 'Unterlagen' },
  },
  {
    id: 'yildirim',
    name: 'Mert Yildirim',
    address: 'Feldstraße 9',
    program: 'KfW 458',
    docsTotal: 9,
    openQuestions: 0,
    lastContact: 'gestern, 16:20',
    owner: 'sie',
    ownerNote: 'ANTRAG PRÜFEN',
    ownerTask: 'Förderantrag prüfen',
    nextDeadline: { date: '18.08.', label: 'Förderantrag KfW 458' },
  },
  {
    id: 'novak',
    name: 'Familie Novak',
    address: 'Kastanienweg 6',
    program: 'BEG EM',
    docsTotal: 9,
    openQuestions: 0,
    lastContact: 'vor 6 Tagen',
    owner: 'niemand',
    ownerNote: 'LÄUFT',
    ownerTask: 'läuft ohne uns',
    nextDeadline: { date: '16.09.', label: 'Ergebnisgespräch' },
  },
]

/** The dark summary bar. „12 laufende Mandate" counts more than the six rows shown. */
export const caseloadSummary = {
  total: 12,
  waitingOnHer: 4,
  waitingOnClients: 5,
  runningAlone: 3,
  agentStats: [
    { value: 7, label: 'Nachfassungen sind heute rausgegangen' },
    { value: 4, label: 'Antworten gelesen und dem Fall zugeordnet' },
    { value: 3, label: 'Fragen konnte ich nicht selbst beantworten' },
  ],
}

// ─────────────────────────────────────────────────────────────── Der Fall Reuter

export const reuterCase: Case = {
  id: 'reuter',
  clientName: 'Familie Reuter',
  formalName: 'Marlene und Jens Reuter · Geschwister',
  address: 'Buchenweg 14',
  city: '31226 Peine',
  program: 'BAFA EBW · iSFP',
  commissioned: '21. Juli 2026',
  ruleVersion: 'EBW 2026-01',
  phaseIndex: 3,
  phaseLabel: 'Datenaufnahme',
  since: '28.07.',
  daysRunning: 13,
  documents: [
    { id: 'grundriss', label: 'Grundriss', state: 'gelesen', arrived: '28.07.' },
    { id: 'hka-2022', label: 'Heizkostenabrechnung 2022', state: 'gelesen', arrived: '28.07.' },
    { id: 'hka-2023', label: 'Heizkostenabrechnung 2023', state: 'gelesen', arrived: '28.07.' },
    {
      id: 'hka-2024',
      label: 'Heizkostenabrechnung 2024',
      state: 'fehlt',
      reason:
        '2022 und 2023 liegen vor. Für die Förderung brauchen wir drei zusammenhängende Jahre.',
      action: 'hochladen',
    },
    { id: 'fotos', label: 'Fotos der Heizung', state: 'gelesen', arrived: '01.08.' },
    { id: 'energieausweis', label: 'Energieausweis 2019', clientLabel: 'Energieausweis', state: 'laeuft' },
    { id: 'grundbuch', label: 'Grundbuchauszug', state: 'gelesen', arrived: '30.07.' },
    {
      id: 'vollmacht',
      label: 'Vollmacht Jens Reuter',
      clientLabel: 'Unterschrift Ihres Bruders',
      state: 'fehlt',
      reason:
        'Das Haus gehört Ihnen beiden. Ohne seine Vollmacht kann der Antrag nicht raus.',
      action: 'weiterleiten',
    },
    { id: 'wohnflaeche', label: 'Wohnflächenberechnung', state: 'gelesen', arrived: '04.08.' },
  ],
  phases: [
    {
      id: 'p1',
      index: '01',
      date: '21. Juli',
      title: 'Erstgespräch',
      note: 'Erledigt — bei Ihnen zu Hause',
      owner: 'gemeinsam',
      state: 'erledigt',
    },
    {
      id: 'p2',
      index: '02',
      date: '24. Juli',
      // The client signed, so on their own page this reads „SIE".
      owner: 'kundschaft',
      title: 'Vertrag und Vollmacht',
      note: 'Erledigt — digital unterschrieben',
      state: 'erledigt',
    },
    {
      id: 'p3',
      index: '03',
      date: 'seit 28. Juli',
      title: 'Unterlagen',
      note: '7 von 9 da · 2 fehlen bis Fr 15.08.',
      owner: 'kundschaft',
      state: 'laeuft',
      expandable: true,
    },
    {
      id: 'p4',
      index: '04',
      date: '19. August, 10:00',
      title: 'Vor-Ort-Termin',
      note: 'Fest vereinbart · rund zwei Stunden',
      owner: 'gemeinsam',
      state: 'kommt',
    },
    {
      id: 'p5',
      index: '05',
      date: 'ca. 9. September',
      title: 'Ihr Sanierungsfahrplan',
      note: 'Berechnung und Bericht · ca. drei Wochen',
      owner: 'sie',
      state: 'kommt',
    },
    {
      id: 'p6',
      index: '06',
      date: 'ca. 16. September',
      title: 'Ergebnisgespräch und Förderantrag',
      note: 'Erst das Gespräch, dann der Antrag',
      owner: 'gemeinsam',
      state: 'kommt',
    },
  ],
  facts: [
    { label: 'Gebäudetyp', value: 'Einfamilienhaus', source: 'ANFRAGE' },
    { label: 'Baujahr', value: '1968', source: 'AUFNAHME' },
    { label: 'Wohnfläche', value: '148,2 m²', source: 'GRUNDRISS · S. 1', linked: true },
    { label: 'Denkmalschutz', value: 'nein', source: 'AUFNAHME' },
    { label: 'Eigentum', value: 'Marlene und Jens Reuter · Geschwister', source: 'AUFNAHME' },
    { label: 'Heizung', value: 'Gas-Brennwert · Baujahr 2004', source: 'TYPENSCHILD', linked: true },
    {
      label: 'Verbrauch Gas',
      value: '19.400 kWh im Mittel · 2022 bis 2023',
      source: '',
      flag: '2024 FEHLT',
    },
    { label: 'Anlass', value: 'Heizkosten senken · Dach dämmen', source: 'ANFRAGE' },
    { label: 'Budget', value: 'rund 40.000 €', source: 'AUFNAHME' },
  ],
  inquiryQuote: {
    date: '21.07.',
    text:
      '„Wir heizen mit Gas und zahlen dafür inzwischen über 2.400 € im Jahr. Das Dach ist von 1968 und nie gedämmt worden. Uns geht es darum, in welcher Reihenfolge wir was machen sollten — wir können nicht alles auf einmal."',
  },
  agentHeadline: 'Sie bereitet gerade den Vor-Ort-Termin vor.',
  agentLog: [
    { when: '04.08.', text: 'Ihre sieben Unterlagen gelesen und die Werte übernommen', state: 'erledigt' },
    { when: 'LÄUFT', text: 'Aufmaß-Unterlagen und Frageliste für den Termin am 19.08.', state: 'laeuft' },
    {
      when: 'AB 20.08.',
      text: 'Berechnung und Ihr Sanierungsfahrplan — rund drei Wochen Arbeit',
      state: 'kommt',
    },
  ],
  nextStep: {
    when: 'Mi 19.08., 10:00',
    text:
      'Vor-Ort-Termin · Aufmaß und Anlagentechnik, rund zwei Stunden. Die zwei fehlenden Unterlagen sollten bis Freitag da sein.',
  },
  clientHeadline: {
    title: 'Zwei Unterlagen fehlen. Sonst sind Sie durch.',
    sub:
      'Danach werden Sie erst am 19. August wieder gebraucht — beim Vor-Ort-Termin. Bis dahin arbeitet Frau Held.',
  },
}

// ─────────────────────────────────────────────────────────────── Fragen

/*
 * One array serves two lists, so the order has to satisfy both:
 *  · the client's thread (answered, case reuter) reads top to bottom
 *  · the consultant's queue (unanswered) reads most-urgent first
 * Hence: answered Reuter history, then the open questions.
 */
export const questions: Question[] = [
  {
    id: 'q-termin',
    caseId: 'reuter',
    question: 'Wann kommt Frau Held zum Termin?',
    asked: 'gestern · 19:41',
    age: 'gestern',
    author: 'ensera',
    answer:
      'Am Mittwoch, 19. August um 10:00 Uhr bei Ihnen. Eingeplant sind rund zwei Stunden. Sie brauchen dafür Zugang zu Keller und Dachboden.',
    provenance: 'ENSERA · SOFORT BEANTWORTET, OHNE FRAU HELD ZU STÖREN',
  },
  {
    id: 'q-waermepumpe',
    caseId: 'reuter',
    question: 'Lohnt sich bei uns eine Wärmepumpe überhaupt?',
    asked: '05.08. · 09:02',
    age: 'am 05.08.',
    author: 'katrin',
    answer:
      'Das kann ich Ihnen erst nach dem Vor-Ort-Termin seriös sagen — die Heizlast Ihres Hauses hängt an der Dämmung, und die habe ich noch nicht gesehen. Ich bringe die Zahlen zum Termin mit.',
    provenance: 'KATRIN HELD · PERSÖNLICH GESCHRIEBEN UND FREIGEGEBEN',
  },
  {
    id: 'q-fenster',
    caseId: 'reuter',
    question: 'Können wir die Fenster schon im Herbst tauschen lassen?',
    asked: 'heute · 08:12',
    age: 'seit 3 Std',
    author: 'offen',
    escalationTag: 'FÖRDERUNG IN GEFAHR',
    escalationReason:
      'Hier hängt Geld dran. Beginnen die Arbeiten vor dem Förderantrag, entfällt die Förderung — das ist eine Rechtsfolge, keine Auskunft aus den Unterlagen.',
    answer:
      'Diese Frage habe ich nicht selbst beantwortet: Wenn Sie vor dem Förderantrag mit den Arbeiten beginnen, kann die Förderung entfallen. Das muss Frau Held Ihnen sagen, nicht ich.',
    provenance: 'LIEGT BEI FRAU HELD · ANTWORT MEIST AM SELBEN TAG',
    draft: {
      greeting: 'Guten Tag Frau Reuter,',
      paragraphs: [
        'bitte warten Sie damit noch. Der Förderantrag muss bei der BAFA eingegangen sein, bevor der erste Handwerker anfängt. Wird vorher begonnen, ist die Förderung für die Fenster verloren — auch rückwirkend lässt sich das nicht heilen.',
        'Nach unserem Termin am 19. August stelle ich den Antrag. Sie dürfen aber jetzt schon Angebote einholen und einen Termin reservieren — das gilt noch nicht als Vorhabenbeginn.',
      ],
      signoff: 'Freundliche Grüße',
      signature: 'Katrin Held',
      evidence: 2,
      citations: [
        { kind: 'regel', label: 'Vorhabenbeginn vor Antragstellung', locator: 'EBW 2.4 · REGELSTAND 2026-01' },
        { kind: 'dokument', label: 'Beratungsvertrag Reuter · Terminplan', locator: 'S. 2 · ABSCHNITT 3' },
      ],
    },
  },
  {
    id: 'q-steuer',
    caseId: 'petersen',
    question: 'Muss ich den Zuschuss in der Steuererklärung angeben?',
    asked: 'gestern · 16:48',
    age: 'seit gestern',
    author: 'offen',
    escalationTag: 'KEINE STEUERAUSKUNFT',
    escalationReason:
      'Steuerrecht darf ich nicht auslegen — das ist Beratung, für die ich nicht zugelassen bin. Ich habe die Frage unbeantwortet gelassen, statt zu raten.',
    draft: {
      greeting: 'Guten Tag Frau Petersen,',
      paragraphs: [
        'die kurze Antwort: einen Zuschuss der BAFA müssen Sie nicht als Einkommen versteuern. Er mindert aber die Kosten, die Sie an anderer Stelle geltend machen können — Sie können denselben Betrag nicht doppelt ansetzen.',
        'Wie sich das in Ihrem Fall auswirkt, sagt Ihnen Ihre Steuerberatung verbindlich. Ich schicke Ihnen dafür gern die Zuschussbescheide gesammelt zu, sobald der Bescheid da ist.',
      ],
      signoff: 'Freundliche Grüße',
      signature: 'Katrin Held',
      evidence: 1,
      citations: [
        { kind: 'regel', label: 'Zuschuss und Steuerbonus nicht kombinierbar', locator: '§ 35c EStG · ABS. 3' },
      ],
    },
  },
  {
    id: 'q-verkauf',
    caseId: 'kowalski',
    question: 'Was passiert, wenn wir das Haus vorher verkaufen?',
    asked: '08.08. · 10:05',
    age: 'seit 2 Tagen',
    author: 'offen',
    escalationTag: 'NICHT IM REGELWERK',
    escalationReason:
      'Zum Eigentümerwechsel während des Bewilligungszeitraums steht im Programm nichts Eindeutiges. Ich rate hier nicht — das gehört in Ihre Hand.',
    draft: {
      greeting: 'Guten Tag Frau Kowalski,',
      paragraphs: [
        'ein Verkauf ist möglich, aber die Förderung geht nicht automatisch mit. Der Zuwendungsbescheid läuft auf Sie; überträgt man ihn nicht rechtzeitig, muss der Zuschuss zurückgezahlt werden.',
        'Wenn ein Verkauf im Raum steht, sagen Sie mir das bitte, bevor der Antrag raus ist. Dann stimmen wir die Reihenfolge ab — das ist deutlich einfacher als eine Übertragung im Nachgang.',
      ],
      signoff: 'Freundliche Grüße',
      signature: 'Katrin Held',
      evidence: 1,
      citations: [
        { kind: 'regel', label: 'Zweckbindung und Eigentümerwechsel', locator: 'EBW 5.1 · REGELSTAND 2026-01' },
      ],
    },
  },
]

/** Answered without her today — the count in the Fragen footer. */
export const answeredWithoutHer = 6

// ─────────────────────────────────────────────────────────────── Fristen

export const deadlines: Deadline[] = [
  {
    id: 'd-bafa',
    caseId: 'brendel',
    when: 'seit 08.08.',
    qualifier: '2 TAGE ÜBER',
    overdue: true,
    title: 'Antwort an die BAFA freigeben',
    detail: 'Lindenallee 3 · Rückfrage zur Heizlast, Entwurf liegt bereit',
    owner: 'sie',
    bucket: 'jetzt',
    action: 'Freigeben',
  },
  {
    id: 'd-rueckruf',
    caseId: 'brendel',
    when: 'heute 11:00',
    qualifier: 'IN 20 MINUTEN',
    title: 'Rückruf Hans-Jürgen Brendel',
    detail: 'Lindenallee 3 · hat gestern zweimal angerufen',
    owner: 'sie',
    bucket: 'jetzt',
    action: 'Anrufen',
  },
  {
    id: 'd-reuter-docs',
    caseId: 'reuter',
    when: 'Fr 15.08.',
    title: 'Unterlagen Reuter vollständig',
    detail: 'Buchenweg 14 · 2 von 9 fehlen',
    owner: 'kundschaft',
    bucket: 'woche',
    status: 'läuft automatisch',
  },
  {
    id: 'd-kfw',
    caseId: 'yildirim',
    when: 'Di 18.08.',
    title: 'Förderantrag KfW 458 einreichen',
    detail: 'Feldstraße 9 · muss vor dem Handwerkertermin am 20.08. raus',
    detailUrgent: true,
    owner: 'sie',
    bucket: 'woche',
    action: 'Antrag öffnen',
  },
  {
    id: 'd-vorort',
    caseId: 'reuter',
    when: 'Mi 19.08. 10:00',
    title: 'Vor-Ort-Termin Familie Reuter',
    detail: 'Buchenweg 14 · Aufmaß, rund zwei Stunden',
    owner: 'gemeinsam',
    bucket: 'woche',
    status: 'steht im Kalender',
  },
  {
    id: 'd-ergebnis',
    caseId: 'petersen',
    when: 'Mi 19.08. 14:30',
    title: 'Ergebnisgespräch Silke Petersen',
    detail: 'Hauptstraße 41 · Briefing liegt bereit',
    owner: 'gemeinsam',
    bucket: 'woche',
    status: 'steht im Kalender',
  },
  {
    id: 'd-kowalski',
    caseId: 'kowalski',
    when: 'Sa 22.08.',
    title: 'Unterlagen Kowalski · Am Wall 27, 5 von 9 fehlen',
    detail: '',
    owner: 'kundschaft',
    bucket: 'spaeter',
    status: 'seit 11 Tagen still',
  },
  {
    id: 'd-verwendung',
    caseId: 'petersen',
    when: 'Mi 02.09.',
    title: 'Verwendungsnachweis Petersen · Hauptstraße 41',
    detail: '',
    owner: 'sie',
    bucket: 'spaeter',
    status: 'noch drei Wochen',
  },
]

export const deadlineFooter = {
  text:
    'Fünf Nachfassungen gehen diese Woche automatisch raus — die nächste am 12.08. an Familie Reuter.',
  action: 'Nachfass-Plan ansehen',
}

/** „9 FRISTEN · 5 MANDATE" — more than the eight rows shown. */
export const deadlineSummary = { deadlines: 9, cases: 5 }

// ─────────────────────────────────────────────────────────────── Postfach

export const messages: Message[] = [
  {
    id: 'm1',
    recipient: 'Familie Reuter',
    recipientDetail: 'Buchenweg 14',
    subject: 'Zwei Unterlagen fehlen noch — Frist Freitag',
    author: 'ensera',
    sent: 'heute 07:00',
    delivery: 'gelesen',
    deliveryLabel: 'gelesen 07:14',
  },
  {
    id: 'm2',
    recipient: 'Anja Kowalski',
    recipientDetail: 'Am Wall 27',
    subject: 'Dritte Erinnerung: fünf Unterlagen fehlen',
    author: 'ensera',
    sent: 'heute 07:00',
    delivery: 'ungeoeffnet',
    deliveryLabel: 'nicht geöffnet',
  },
  {
    id: 'm3',
    recipient: 'Hans-Jürgen Brendel',
    recipientDetail: 'Lindenallee 3',
    subject: 'Antwort zur Rückfrage der BAFA',
    author: 'katrin',
    sent: 'heute 09:14',
    delivery: 'gelesen',
    deliveryLabel: 'gelesen 09:31',
  },
  {
    id: 'm4',
    recipient: 'Silke Petersen',
    recipientDetail: 'Hauptstraße 41',
    subject: 'Bestätigung Ergebnisgespräch, 19.08. 14:30',
    author: 'ensera',
    sent: 'gestern 16:20',
    delivery: 'gelesen',
    deliveryLabel: 'gelesen 18:02',
  },
  {
    id: 'm5',
    recipient: 'Mert Yildirim',
    recipientDetail: 'Feldstraße 9',
    subject: 'Ihr Zugang zu Feldstraße 9',
    author: 'ensera',
    sent: 'gestern 11:02',
    delivery: 'gelesen',
    deliveryLabel: 'gelesen 11:40',
  },
  {
    id: 'm6',
    recipient: 'Sabine Sander',
    recipientDetail: 'Miteigentümerin · Ringstraße 8',
    subject: 'Bitte um Ihre Vollmacht',
    author: 'ensera',
    sent: '08.08. 08:00',
    delivery: 'zugestellt',
    deliveryLabel: 'zugestellt',
  },
  {
    id: 'm7',
    recipient: 'Familie Novak',
    recipientDetail: 'Kastanienweg 6',
    subject: 'Ihr Sanierungsfahrplan liegt bereit',
    author: 'katrin',
    sent: '07.08. 17:40',
    delivery: 'gelesen',
    deliveryLabel: 'gelesen 08.08.',
  },
  {
    id: 'm8',
    recipient: 'Marion Deibel',
    recipientDetail: 'Ilsede · Anfrage abgelehnt',
    subject: 'Absage mit Empfehlung eines Kollegen',
    author: 'katrin',
    sent: '07.08. 09:30',
    delivery: 'unzustellbar',
    deliveryLabel: 'nicht zustellbar',
  },
]

// ─────────────────────────────────────────────────────────────── Kalender

export const slots: Slot[] = [
  { id: 's1', day: 'DONNERSTAG · 13. AUGUST', start: '09:00', end: '09:45' },
  { id: 's2', day: 'DONNERSTAG · 13. AUGUST', start: '15:30', end: '16:15' },
  { id: 's3', day: 'FREITAG · 14. AUGUST', start: '11:00', end: '11:45' },
  { id: 's4', day: 'MONTAG · 17. AUGUST', start: '09:30', end: '10:15' },
  { id: 's5', day: 'MONTAG · 17. AUGUST', start: '14:00', end: '14:45' },
  { id: 's6', day: 'DIENSTAG · 18. AUGUST', start: '16:00', end: '16:45' },
]

export const appointments: Appointment[] = []

// ─────────────────────────────────────────────────────────────── Einrichtung

export const workflowTemplates: WorkflowTemplate[] = [
  {
    id: 'ebw',
    label: 'BAFA EBW · iSFP',
    caseCount: 8,
    draft: false,
    ruleVersion: 'BAFA EBW, STAND 2026-01',
    derivedFrom:
      'Ich habe sechs Schritte, neun Unterlagen und drei Fristen aus dem Programm abgeleitet. Prüfen Sie es — nichts davon läuft, bevor Sie die Vorlage aktivieren.',
    steps: [
      {
        id: 'ebw-1',
        title: 'Anfrage und Vorauswahl',
        owner: 'kundschaft',
        duration: '1 Tag',
        clientSees: 'Ihre Anfrage ist angekommen',
        enseraDoes: 'Gegen Ihre sechs Regeln prüfen',
      },
      {
        id: 'ebw-2',
        title: 'Erstgespräch und Beauftragung',
        owner: 'gemeinsam',
        duration: '1 Woche',
        clientSees: 'Termin steht · Vertrag prüfen',
        enseraDoes: 'Vertrag und Vollmacht anfordern, Signatur nachfassen',
      },
      {
        id: 'ebw-3',
        title: 'Unterlagen',
        owner: 'kundschaft',
        duration: '2 Wochen',
        clientSees: 'Unterlagen zusammentragen',
        enseraDoes: '9 Stück anfordern, nach 4 / 9 / 14 Tagen nachfassen',
      },
      {
        id: 'ebw-4',
        title: 'Vor-Ort-Termin und Aufmaß',
        owner: 'gemeinsam',
        duration: '1 Tag',
        clientSees: 'Vor-Ort-Termin am ...',
        enseraDoes: 'Erinnerung 2 Tage vorher, Frageliste vorbereiten',
      },
      {
        id: 'ebw-5',
        title: 'Berechnung und Fahrplan',
        owner: 'sie',
        duration: '3 Wochen',
        clientSees: 'Frau Held rechnet · bis ...',
        enseraDoes: 'Wochenstand schreiben, ohne dass Sie etwas tun',
      },
      {
        id: 'ebw-6',
        title: 'Ergebnisgespräch und Antrag',
        owner: 'gemeinsam',
        duration: '1 Woche',
        clientSees: 'Gespräch, dann Förderantrag',
        enseraDoes: 'Vorhabenbeginn prüfen, Fristen setzen',
      },
    ],
  },
  {
    id: 'kfw',
    label: 'KfW 458 · Heizungstausch',
    caseCount: 3,
    draft: false,
    ruleVersion: 'KfW 458, STAND 2026-01',
    derivedFrom:
      'Fünf Schritte, sieben Unterlagen, zwei harte Fristen. Der Antrag muss vor dem ersten Handwerkertermin raus — das habe ich als blockierende Regel eingetragen.',
    steps: [
      {
        id: 'kfw-1',
        title: 'Anfrage und Vorauswahl',
        owner: 'kundschaft',
        duration: '1 Tag',
        clientSees: 'Ihre Anfrage ist angekommen',
        enseraDoes: 'Heizungsart und Baujahr gegen die Förderfähigkeit prüfen',
      },
      {
        id: 'kfw-2',
        title: 'Heizlast und Angebote',
        owner: 'gemeinsam',
        duration: '2 Wochen',
        clientSees: 'Angebote einholen · noch nicht beauftragen',
        enseraDoes: 'Heizlast nach DIN 12831 rechnen, Angebote gegenlesen',
      },
      {
        id: 'kfw-3',
        title: 'Förderantrag',
        owner: 'sie',
        duration: '1 Woche',
        clientSees: 'Antrag liegt bei der KfW',
        enseraDoes: 'Vorhabenbeginn sperren, bis der Antrag eingegangen ist',
      },
      {
        id: 'kfw-4',
        title: 'Einbau und Abgleich',
        owner: 'kundschaft',
        duration: '6 Wochen',
        clientSees: 'Einbau läuft · Termine beim Handwerk',
        enseraDoes: 'Hydraulischen Abgleich einfordern, Fotos anfordern',
      },
      {
        id: 'kfw-5',
        title: 'Verwendungsnachweis',
        owner: 'sie',
        duration: '2 Wochen',
        clientSees: 'Nachweis ist raus',
        enseraDoes: 'Rechnungen sammeln, Frist überwachen',
      },
    ],
  },
  {
    id: 'beg',
    label: 'BEG EM · Einzelmaßnahme',
    caseCount: 1,
    draft: false,
    ruleVersion: 'BEG EM, STAND 2025-07',
    derivedFrom:
      'Vier Schritte. Ohne Sanierungsfahrplan fehlen fünf Prozentpunkte Zuschuss — ich weise beim Erstgespräch darauf hin.',
    steps: [
      {
        id: 'beg-1',
        title: 'Anfrage und Vorauswahl',
        owner: 'kundschaft',
        duration: '1 Tag',
        clientSees: 'Ihre Anfrage ist angekommen',
        enseraDoes: 'Maßnahme gegen die Förderliste prüfen',
      },
      {
        id: 'beg-2',
        title: 'Bestätigung zum Antrag',
        owner: 'sie',
        duration: '1 Woche',
        clientSees: 'Bestätigung ist ausgestellt',
        enseraDoes: 'BzA erzeugen, Fristen setzen',
      },
      {
        id: 'beg-3',
        title: 'Umsetzung',
        owner: 'kundschaft',
        duration: '8 Wochen',
        clientSees: 'Umsetzung läuft',
        enseraDoes: 'Alle vier Wochen nachfassen, Belege einsammeln',
      },
      {
        id: 'beg-4',
        title: 'Nachweis und Auszahlung',
        owner: 'sie',
        duration: '2 Wochen',
        clientSees: 'Nachweis ist raus',
        enseraDoes: 'BnD erstellen, Auszahlung verfolgen',
      },
    ],
  },
  {
    id: 'foerder',
    label: 'Fördermittelbegleitung',
    caseCount: 0,
    draft: true,
    ruleVersion: 'ENTWURF · NOCH KEIN REGELSTAND',
    derivedFrom:
      'Diesen Entwurf habe ich aus Ihren letzten vier Begleitungen abgeleitet, nicht aus einem Regelwerk. Bitte lesen Sie ihn genauer als die anderen.',
    steps: [
      {
        id: 'foerder-1',
        title: 'Antragsprüfung',
        owner: 'sie',
        duration: '3 Tage',
        clientSees: 'Ihre Unterlagen werden geprüft',
        enseraDoes: 'Vollständigkeit prüfen, fehlende Stücke einzeln anfordern',
      },
      {
        id: 'foerder-2',
        title: 'Einreichung',
        owner: 'sie',
        duration: '1 Woche',
        clientSees: 'Antrag ist eingereicht',
        enseraDoes: 'Eingangsbestätigung ablegen, Frist im Kalender setzen',
      },
      {
        id: 'foerder-3',
        title: 'Rückfragen der Behörde',
        owner: 'gemeinsam',
        duration: 'offen',
        clientSees: 'Es gibt eine Rückfrage',
        enseraDoes: 'Antwort entwerfen, Ihnen zur Freigabe vorlegen',
      },
    ],
  },
]

/** Owner options in the „Wer ist dran" dropdown, in the design's order. */
export const ownerOptions: Owner[] = ['kundschaft', 'gemeinsam', 'sie', 'niemand']

/** Offered when she adds a step, so the demo doesn't need typing to be legible. */
export const newStepDefaults = {
  title: 'Neuer Schritt',
  owner: 'sie' as Owner,
  duration: '1 Woche',
  clientSees: 'Wird noch festgelegt',
  enseraDoes: 'Nichts — bis Sie es hier eintragen',
}

// ─────────────────────────────────────────────────────── Anfrage-Formular

export const inquiryOptions = {
  building: ['Einfamilienhaus', 'Zweifamilienhaus', 'Mehrfamilienhaus', 'Gewerbe'],
  intent: ['Sanierungsfahrplan', 'Einzelne Maßnahme', 'Heizung tauschen', 'Weiß ich noch nicht'],
  timeframe: ['So schnell wie möglich', 'In drei bis sechs Monaten', 'Erst mal nur informieren'],
}

/** Prefilled so a presenter can send the inquiry in one click — matches the design. */
export const inquiryDefaults = {
  building: 'Einfamilienhaus',
  intent: 'Heizung tauschen',
  timeframe: 'In drei bis sechs Monaten',
  story:
    'Unsere Ölheizung ist von 1998 und war letzten Winter zweimal aus. Wir würden auf Wärmepumpe wechseln, wissen aber nicht, ob das Haus dafür überhaupt gedämmt genug ist. Baujahr 1972, wir haben 1998 neue Fenster einbauen lassen.',
  name: 'Tobias Sander',
  email: 't.sander@posteo.de',
  place: '31224 Peine',
}

// ─────────────────────────────────────────────────────── Aufnahme-Formular

export const intakeDefaults = {
  address: 'Ringstraße 8, Peine',
  person: 'Tobias Sander',
  year: '1972',
  area: '148 m²',
  units: '1',
  monument: 'Nein',
  ownership: 'Mehreren Personen',
  coOwner: { name: 'Sabine Sander', email: 's.sander@posteo.de' },
  heating: 'Öl',
  boilerYear: '1998',
  lastService: '',
  plans: ['Heizung erneuern', 'Heizkosten senken'],
  note:
    'Uns geht es vor allem um Betriebssicherheit — wenn die Heizung nochmal im Januar ausfällt, haben wir ein Problem mit meiner Mutter im Erdgeschoss. Budget haben wir grob 35.000 € eingeplant.',
  atHand: ['Grundriss', 'Grundbuchauszug', 'Heizkostenabrechnungen'],
  meetingKind: 'Bei mir zu Hause',
  slotId: 's3',
}

export const intakeOptions = {
  monument: ['Ja', 'Nein', 'Weiß ich nicht'],
  ownership: ['Mir allein', 'Mehreren Personen', 'Einer Eigentümergemeinschaft'],
  heating: ['Öl', 'Gas', 'Wärmepumpe', 'Holz oder Pellets', 'Fernwärme'],
  plans: ['Heizung erneuern', 'Heizkosten senken', 'Dach oder Fassade', 'Fenster', 'Verkauf geplant'],
  atHand: [
    'Grundriss',
    'Grundbuchauszug',
    'Fotos der Heizung',
    'Heizkostenabrechnungen',
    'Wohnflächenberechnung',
    'Handwerker-Angebote',
    'Energieausweis',
    'Baugenehmigung',
    'Nichts davon zur Hand',
  ],
  meetingKind: ['Bei mir zu Hause', 'Telefon', 'Video', 'Im Büro in Peine'],
}
