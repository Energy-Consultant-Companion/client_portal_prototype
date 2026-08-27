import type { DemoState } from './demo'
import type { Deadline } from './types'
import * as seed from './seed'

/*
 * What the rail's „Suchen oder fragen" actually does.
 *
 * Two jobs behind one input, which is why the design gave it the agent orb
 * rather than a magnifying glass:
 *
 *  · search  — find a case, an inquiry, a deadline, a document, a message
 *  · ask     — answer a question about her own practice from what's in the state
 *
 * The asking half deliberately mirrors the client portal's rule: answer only
 * from what is actually there, and say so when there is nothing.
 */

export type ResultKind =
  | 'kundschaft'
  | 'anfrage'
  | 'frist'
  | 'frage'
  | 'unterlage'
  | 'nachricht'
  | 'seite'

export interface SearchResult {
  id: string
  kind: ResultKind
  title: string
  detail: string
  to: string
  /** Right-aligned mono hint — a date, a state, a count. */
  meta?: string
  urgent?: boolean
}

export const kindLabels: Record<ResultKind, string> = {
  kundschaft: 'KUNDSCHAFT',
  anfrage: 'ANFRAGEN',
  frist: 'FRISTEN',
  frage: 'FRAGEN',
  unterlage: 'UNTERLAGEN',
  nachricht: 'POSTFACH',
  seite: 'SEITEN',
}

/** Order the groups appear in — cases first, chrome last. */
export const kindOrder: ResultKind[] = [
  'kundschaft',
  'anfrage',
  'frage',
  'frist',
  'unterlage',
  'nachricht',
  'seite',
]

const pages: SearchResult[] = [
  { id: 'p-anfragen', kind: 'seite', title: 'Anfragen', detail: 'Neue Anfragen prüfen und annehmen', to: '/ensera/anfragen' },
  { id: 'p-kundschaft', kind: 'seite', title: 'Kundschaft', detail: 'Alle laufenden Mandate', to: '/ensera/kundschaft' },
  { id: 'p-kalender', kind: 'seite', title: 'Fristen und Kalender', detail: 'Was heute und diese Woche ansteht', to: '/ensera/kalender' },
  { id: 'p-postfach', kind: 'seite', title: 'Postfach', detail: 'Was in Ihrem Namen rausgegangen ist', to: '/ensera/postfach' },
  { id: 'p-fragen', kind: 'seite', title: 'Fragen an Sie', detail: 'Entwürfe freigeben oder selbst schreiben', to: '/ensera/fragen' },
  { id: 'p-einrichtung', kind: 'seite', title: 'Einrichtung · Ablaufvorlagen', detail: 'Festlegen, wie ein Fall bei Ihnen läuft', to: '/ensera/einrichtung' },
]

const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/ä/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/ü/g, 'u')
    .replace(/ß/g, 'ss')

function hit(needle: string, ...haystack: string[]): boolean {
  const n = norm(needle)
  return haystack.some((h) => norm(h).includes(n))
}

export function search(state: DemoState, query: string): SearchResult[] {
  const q = query.trim()
  if (!q) {
    // Empty input offers the places worth going, not a dump of everything.
    return pages
  }

  const out: SearchResult[] = []

  for (const c of state.clients) {
    if (hit(q, c.name, c.address, c.program, c.ownerNote ?? '')) {
      out.push({
        id: `c-${c.id}`,
        kind: 'kundschaft',
        title: c.name,
        detail: `${c.address} · ${c.program} · ${c.docsTotal}/9 Unterlagen`,
        to: `/ensera/kundschaft/${c.id}`,
        meta: c.nextDeadline.date,
        urgent: c.nextDeadline.overdue,
      })
    }
  }

  for (const i of state.inquiries) {
    if (hit(q, i.name, i.summary, i.location, i.buildingType, i.intent)) {
      out.push({
        id: `i-${i.id}`,
        kind: 'anfrage',
        title: i.name,
        detail: i.summary,
        to: '/ensera/anfragen',
        meta: i.state === 'neu' ? 'NEU' : i.tag.split(' · ')[0],
      })
    }
  }

  // Questions and deadlines belong to a case, so the client's name has to match
  // them too — „Brendel" should surface everything of his, not just rows that
  // happen to spell his name out.
  for (const question of state.questions) {
    if (question.author !== 'offen') continue
    if (hit(q, question.question, question.escalationTag ?? '', nameOf(state, question.caseId))) {
      out.push({
        id: `q-${question.id}`,
        kind: 'frage',
        title: question.question,
        detail: `${nameOf(state, question.caseId)} · ${question.escalationTag ?? ''}`,
        to: '/ensera/fragen',
        meta: question.age,
        urgent: true,
      })
    }
  }

  for (const d of state.deadlines) {
    const owner = d.caseId ? nameOf(state, d.caseId) : ''
    if (hit(q, d.title, d.detail, owner)) {
      out.push({
        id: `d-${d.id}`,
        kind: 'frist',
        title: d.title,
        // The deadline itself no longer names anyone — „Vor-Ort-Termin" alone
        // is not a search result, so the detail line has to carry the whose.
        detail: [owner, d.detail || d.status].filter(Boolean).join(' · '),
        to: '/ensera/kalender',
        meta: d.when,
        urgent: d.overdue,
      })
    }
  }

  // Documents are searched per case, so „Vollmacht" finds whose is missing.
  for (const kase of Object.values(state.cases)) {
    for (const doc of kase.documents) {
      if (hit(q, doc.label, doc.clientLabel ?? '')) {
        out.push({
          id: `doc-${kase.id}-${doc.id}`,
          kind: 'unterlage',
          title: doc.label,
          detail: `${kase.clientName} · ${kase.address}`,
          to: `/ensera/kundschaft/${kase.id}`,
          meta: doc.state === 'fehlt' ? 'FEHLT' : doc.state === 'laeuft' ? 'LÄUFT' : doc.arrived,
          urgent: doc.state === 'fehlt',
        })
      }
    }
  }

  for (const m of state.messages) {
    if (hit(q, m.recipient, m.subject, m.recipientDetail)) {
      out.push({
        id: `m-${m.id}`,
        kind: 'nachricht',
        title: m.subject,
        detail: `${m.recipient} · ${m.author === 'ensera' ? 'ENSERA' : 'Katrin Held'}`,
        to: '/ensera/postfach',
        meta: m.sent,
      })
    }
  }

  for (const p of pages) {
    if (hit(q, p.title, p.detail)) out.push(p)
  }

  return out
}

// ───────────────────────────────────────────────────────────── asking

export interface PracticeAnswer {
  text: string
  /** Where the answer came from, in the design's mono-caps provenance style. */
  provenance: string
  /** Optional jump-to for the thing being talked about. */
  action?: { label: string; to: string }
}

/**
 * Does this look like a question rather than a search term?
 *
 * A question mark is decisive. Otherwise: several words, and one of them is
 * interrogative. Single words are always treated as search, because „Vollmacht"
 * means „find it", not „explain it".
 */
export function looksLikeQuestion(input: string): boolean {
  const q = input.trim()
  if (!q) return false
  if (q.endsWith('?')) return true
  if (q.split(/\s+/).length < 3) return false
  return /^(wer|was|wie|wann|wo|warum|wieso|welche|welcher|wieviel|wie viele|gibt|habe|hab|muss|soll|kann|steht|liegt|fehlt|fehlen)\b/i.test(
    q,
  )
}

/**
 * Answer from the live state. Every branch reads the store rather than a script,
 * so the answers stay true after the presenter has changed something.
 */
export function askPractice(state: DemoState, question: string): PracticeAnswer {
  const q = norm(question)
  const openQuestions = state.questions.filter((x) => x.author === 'offen')
  const overdue = state.deadlines.filter((d) => d.overdue)
  const jetzt = state.deadlines.filter((d) => d.bucket === 'jetzt')
  const mine = state.clients.filter((c) => c.owner === 'sie')
  const theirs = state.clients.filter((c) => c.owner === 'kundschaft')
  const newInquiries = state.inquiries.filter((i) => i.state === 'neu')

  if (/wartet auf mich|auf mich|bin ich dran|meine aufgaben|was muss ich/.test(q)) {
    return {
      text:
        `${up(count(mine.length, 'Mandat', 'Mandate'))} ${verb(mine.length, 'wartet', 'warten')} auf Sie: ` +
        `${list(mine.map((c) => `${c.name} (${c.ownerTask ?? 'offen'})`))}. ` +
        `Dazu ${count(openQuestions.length, 'Frage', 'Fragen')} mit Entwurf und ${count(newInquiries.length, 'neue Anfrage', 'neue Anfragen')}.`,
      provenance: 'AUS IHREN MANDATEN · STAND JETZT',
      action: { label: 'Kundschaft öffnen', to: '/ensera/kundschaft' },
    }
  }

  if (/uberfallig|zu spat|verspatet|brennt/.test(q)) {
    return overdue.length
      ? {
          text: `${up(count(overdue.length, 'Frist', 'Fristen'))} ${verb(overdue.length)} überfällig: ${list(overdue.map((d) => `${deadlineTitle(state, d)} (${d.when})`))}.`,
          provenance: 'AUS IHREM KALENDER',
          action: { label: 'Fristen öffnen', to: '/ensera/kalender' },
        }
      : {
          text: `Nichts ist überfällig. Als Nächstes steht ${jetzt[0] ? deadlineTitle(state, jetzt[0]) : 'diese Woche nichts Dringendes'} an.`,
          provenance: 'AUS IHREM KALENDER',
          action: { label: 'Fristen öffnen', to: '/ensera/kalender' },
        }
  }

  if (/heute|jetzt|als nachstes|nachstes/.test(q)) {
    return {
      text: jetzt.length
        ? `Heute: ${list(jetzt.map((d) => `${deadlineTitle(state, d)} (${d.when})`))}.`
        : 'Für heute steht nichts Dringendes an. Die nächste Frist ist ' + (state.deadlines[0]?.when ?? 'offen') + '.',
      provenance: `AUS IHREM KALENDER · ${seed.NOW}`,
      action: { label: 'Fristen öffnen', to: '/ensera/kalender' },
    }
  }

  if (/unterlagen|dokument|fehlt|fehlen/.test(q)) {
    // Grouped per case, so the client's name is said once rather than after
    // every document.
    const gaps = Object.values(state.cases)
      .map((c) => ({
        name: c.clientName,
        missing: c.documents.filter((d) => d.state === 'fehlt').map((d) => d.label),
      }))
      .filter((g) => g.missing.length)
    const behind = state.clients.filter((c) => c.docsTotal < 9)
    return {
      text: gaps.length
        ? `${list(gaps.map((g) => `${g.name}: ${list(g.missing)}`))}. Insgesamt ${verb(behind.length)} ${count(behind.length, 'Mandat', 'Mandate')} noch nicht vollständig.`
        : `In den ausgearbeiteten Fällen liegt alles vor. ${up(count(behind.length, 'Mandat', 'Mandate'))} ${verb(behind.length)} nach Zählung noch nicht vollständig.`,
      provenance: 'AUS DEN FÄLLEN · OHNE NACHZUFRAGEN',
      action: { label: 'Fall Reuter öffnen', to: '/ensera/kundschaft/reuter' },
    }
  }

  if (/frage|entwurf|freigeben|freigabe/.test(q)) {
    return openQuestions.length
      ? {
          text: `${up(count(openQuestions.length, 'Frage', 'Fragen'))} ${verb(openQuestions.length, 'liegt', 'liegen')} bei Ihnen: ${list(openQuestions.map((x) => `„${x.question}" (${nameOf(state, x.caseId)})`))}. Für jede liegt ein Entwurf bereit.`,
          provenance: `HEUTE OHNE SIE BEANTWORTET · ${seed.answeredWithoutHer}`,
          action: { label: 'Fragen öffnen', to: '/ensera/fragen' },
        }
      : {
          text: `Keine Frage offen. Heute habe ich ${seed.answeredWithoutHer} selbst beantwortet — alles aus dem, was in den Fällen liegt.`,
          provenance: 'AUS DEN FÄLLEN',
        }
  }

  if (/anfrage|neukunde|neue kunden/.test(q)) {
    return {
      text: newInquiries.length
        ? `${up(count(newInquiries.length, 'Anfrage', 'Anfragen'))} ${verb(newInquiries.length)} offen: ${list(newInquiries.map((i) => `${i.name} (${i.summary})`))}.`
        : 'Keine offene Anfrage. Alles geprüft und beantwortet.',
      provenance: 'AUS IHREM POSTEINGANG',
      action: { label: 'Anfragen öffnen', to: '/ensera/anfragen' },
    }
  }

  if (/wartet auf kundschaft|auf die kundschaft|still|nichts gehort/.test(q)) {
    return {
      text: `${up(count(theirs.length, 'Mandat', 'Mandate'))} ${verb(theirs.length, 'wartet', 'warten')} auf die Kundschaft: ${list(theirs.map((c) => `${c.name} (${c.lastContact})`))}. Ich fasse automatisch nach.`,
      provenance: 'AUS IHREN MANDATEN',
      action: { label: 'Kundschaft öffnen', to: '/ensera/kundschaft' },
    }
  }

  if (/termin|kalender|vor.?ort/.test(q)) {
    const dates = state.deadlines.filter((d) => d.status === 'steht im Kalender')
    return {
      text: dates.length
        ? `Feste Termine: ${list(dates.map((d) => `${deadlineTitle(state, d)} (${d.when})`))}.`
        : 'Im Kalender steht derzeit kein fester Termin.',
      provenance: 'AUS IHREM KALENDER',
      action: { label: 'Fristen öffnen', to: '/ensera/kalender' },
    }
  }

  if (/rausgegangen|nachricht|protokoll|geschickt|gesendet/.test(q)) {
    const undelivered = state.messages.filter((m) => m.delivery === 'unzustellbar')
    return {
      text: `Diese Woche sind ${seed.baseline.outboxWeek + Math.max(0, state.messages.length - seed.messages.length)} Nachrichten in Ihrem Namen rausgegangen. ${
        undelivered.length
          ? `${up(count(undelivered.length, 'davon', 'davon'))} ${verb(undelivered.length, 'war', 'waren')} nicht zustellbar: ${list(undelivered.map((m) => m.recipient))}.`
          : 'Alle sind zugestellt.'
      }`,
      provenance: 'AUS DEM PROTOKOLL · UNVERÄNDERLICH',
      action: { label: 'Postfach öffnen', to: '/ensera/postfach' },
    }
  }

  if (/vorlage|ablauf|einrichtung|schritte/.test(q)) {
    const t = state.templates.find((x) => x.id === state.selectedTemplateId) ?? state.templates[0]
    return {
      text: `Sie haben ${count(state.templates.length, 'Ablaufvorlage', 'Ablaufvorlagen')}. „${t.label}" hat ${count(t.steps.length, 'Schritt', 'Schritte')}${t.draft ? ' und ist noch ein Entwurf' : ` und trägt ${count(t.caseCount, 'laufenden Fall', 'laufende Fälle')}`}.`,
      provenance: 'AUS IHRER EINRICHTUNG',
      action: { label: 'Einrichtung öffnen', to: '/ensera/einrichtung' },
    }
  }

  // Same discipline as the client side: no grounds, no answer.
  return {
    text:
      'Dazu finde ich in Ihren Fällen nichts Belastbares. Fragen Sie mich nach Fristen, offenen Unterlagen, wer gerade dran ist, oder nach dem, was rausgegangen ist — oder tippen Sie einen Namen, dann suche ich.',
    provenance: 'KEINE GRUNDLAGE IN DEN DATEN',
  }
}

function nameOf(state: DemoState, caseId: string): string {
  return state.clients.find((c) => c.id === caseId)?.name ?? caseId
}

/**
 * „Vor-Ort-Termin · Familie Reuter". Deadline titles stopped naming anyone when
 * the whose moved out of the row and into the case it points at, so anything
 * quoting a deadline outside the Kalender has to put the name back.
 */
function deadlineTitle(state: DemoState, d: Deadline): string {
  const who = d.caseId ? nameOf(state, d.caseId) : ''
  return who ? `${d.title} · ${who}` : d.title
}

/** „zwei Mandate". Lowercase, because most uses are mid-sentence; see `up`. */
function count(n: number, one: string, many: string): string {
  const words = ['keine', 'eine', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun']
  return `${words[n] ?? n} ${n === 1 ? one : many}`
}

/** Capitalise a phrase that happens to start a sentence. */
function up(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

/** German agrees the verb with the count: „eine Frist ist" but „zwei Fristen sind". */
function verb(n: number, singular = 'ist', plural = 'sind'): string {
  return n === 1 ? singular : plural
}

/** „a, b und c" — German lists take „und" before the last item. */
function list(items: string[]): string {
  if (items.length <= 1) return items[0] ?? ''
  return `${items.slice(0, -1).join(', ')} und ${items.at(-1)}`
}
