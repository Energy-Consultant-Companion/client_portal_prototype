/*
 * The prototype's data model. It mirrors what the two sides of the product
 * actually share: one case, seen twice. Every field that appears in a screen
 * lives here, so a click on one side can move the other.
 */

/** Who has to act next. Shown verbatim on both sides — that's the point. */
export type Owner = 'sie' | 'kundschaft' | 'gemeinsam' | 'niemand'

/** How a document is doing. `laeuft` = OCR is reading it right now. */
export type DocState = 'gelesen' | 'laeuft' | 'fehlt'

export type PhaseState = 'erledigt' | 'laeuft' | 'kommt'

export type Program = 'BAFA EBW · iSFP' | 'KfW 458' | 'BEG EM'

export interface CaseDocument {
  id: string
  /** Label the consultant sees: „Vollmacht Jens Reuter". */
  label: string
  /** Label the client sees: „Vollmacht Ihres Bruders". Falls back to `label`. */
  clientLabel?: string
  state: DocState
  /** Date it arrived, e.g. „28.07." — absent while missing. */
  arrived?: string
  /** Why it is needed, shown to the client when it's overdue. */
  reason?: string
  /** Missing documents can be someone else's signature rather than a file. */
  action?: 'hochladen' | 'weiterleiten'
}

export interface CasePhase {
  id: string
  index: string
  /** „21. Juli", „seit 28. Juli", „ca. 9. September" */
  date: string
  title: string
  /** One-line status shown to the client. */
  note: string
  owner: Owner
  state: PhaseState
  /** Step 3 opens to reveal the document grid. */
  expandable?: boolean
}

/** A row in the „Aus Anfrage und Aufnahme" table, with where the value came from. */
export interface CaseFact {
  label: string
  value: string
  /** „ANFRAGE", „AUFNAHME", „GRUNDRISS · S. 1" */
  source: string
  /** Source points at a document page the consultant can open. */
  linked?: boolean
  /** e.g. „2024 FEHLT" — rendered in the error colour. */
  flag?: string
}

export interface CaseAgentEntry {
  /** „04.08.", „LÄUFT", „AB 20.08." */
  when: string
  text: string
  state: PhaseState
}

export type AnswerAuthor = 'ensera' | 'katrin' | 'offen'

export interface Question {
  id: string
  caseId: string
  question: string
  /** „gestern · 19:41" */
  asked: string
  /** Relative age used in the consultant's queue: „seit 3 Std". */
  age: string
  answer?: string
  author: AnswerAuthor
  /** The provenance line under an answer. */
  provenance?: string
  /** Why ENSERA refused to answer it alone. */
  escalationTag?: string
  escalationReason?: string
  /** Draft the consultant can release, edit, or discard. */
  draft?: {
    greeting: string
    paragraphs: string[]
    signoff: string
    signature: string
    /** How well the draft is backed by documents — 0..3 segments. */
    evidence: number
    citations: { kind: 'regel' | 'dokument'; label: string; locator: string }[]
  }
  /** Set once the consultant releases it, so the client thread can show it. */
  releasedAt?: string
}

export interface Deadline {
  id: string
  caseId?: string
  /** „seit 08.08.", „heute 11:00", „Fr 15.08." */
  when: string
  /** „2 TAGE ÜBER", „IN 20 MINUTEN" — the mono line under `when`. */
  qualifier?: string
  overdue?: boolean
  title: string
  detail: string
  /** Marks the detail line with a dot and error colour. */
  detailUrgent?: boolean
  owner: Owner
  ownerNote?: string
  bucket: 'jetzt' | 'woche' | 'spaeter'
  /** Either a button label, or a passive status like „läuft automatisch". */
  action?: string
  status?: string
}

export interface Client {
  id: string
  name: string
  address: string
  program: Program
  docsTotal: number
  openQuestions: number
  lastContact: string
  lastContactStale?: boolean
  owner: Owner
  ownerNote?: string
  nextDeadline: { date: string; label: string; overdue?: boolean }
}

/** Full case record. Only Reuter is fleshed out — it drives the client portal. */
export interface Case {
  id: string
  clientName: string
  /** „Familie Reuter" vs. „Marlene und Jens Reuter" */
  formalName: string
  address: string
  city: string
  program: Program
  /** „21. Juli 2026" */
  commissioned: string
  /** Pinned rule version — the design makes a point of this being frozen. */
  ruleVersion: string
  phaseIndex: number
  phaseLabel: string
  since: string
  daysRunning: number
  documents: CaseDocument[]
  phases: CasePhase[]
  facts: CaseFact[]
  /** What they wrote in the original inquiry, quoted back at them. */
  inquiryQuote?: { date: string; text: string }
  agentLog: CaseAgentEntry[]
  agentHeadline: string
  nextStep: { when: string; text: string }
  /** Headline on the client portal, recomputed as documents arrive. */
  clientHeadline: { title: string; sub: string }
}

export type InquiryState = 'neu' | 'angenommen' | 'abgelehnt' | 'nachgefragt'

export interface InquiryRule {
  label: string
  /** `offen` = the client didn't answer it; not a failure. */
  state: 'erfuellt' | 'offen' | 'verletzt'
}

export interface Inquiry {
  id: string
  name: string
  email: string
  location: string
  /** „heute, 09:12" */
  arrived: string
  /** Right-aligned day + time in the list. */
  listDate: string
  listTime?: string
  summary: string
  /** The mono tag line under a list row. */
  tag: string
  tagState: 'neu' | 'ausserhalb' | 'erledigt'
  state: InquiryState
  buildingType: string
  intent: string
  timeframe: string
  quote: string
  rules: InquiryRule[]
  suggestion?: string
  /** Set for inquiries created during the demo, so we can animate arrival. */
  isNew?: boolean
}

export type MessageAuthor = 'ensera' | 'katrin'
export type Delivery = 'gelesen' | 'zugestellt' | 'ungeoeffnet' | 'unzustellbar'

export interface Message {
  id: string
  recipient: string
  recipientDetail: string
  subject: string
  author: MessageAuthor
  sent: string
  delivery: Delivery
  /** „gelesen 07:14" — the rendered right-hand cell. */
  deliveryLabel: string
  isNew?: boolean
}

export interface Slot {
  id: string
  /** „DONNERSTAG · 13. AUGUST" */
  day: string
  start: string
  end: string
}

export interface Appointment {
  id: string
  caseId: string
  day: string
  start: string
  kind: string
}

export interface Toast {
  id: string
  /** Mail moments get the envelope and the emphasised entrance. */
  kind: 'mail' | 'plain'
  title: string
  detail?: string
  action?: { label: string; to: string }
}
