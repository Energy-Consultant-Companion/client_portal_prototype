import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'
import * as seed from './seed'
import { triage } from './ai'
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
  Toast,
  WorkflowStep,
  WorkflowTemplate,
} from './types'

/*
 * One store standing in for the whole backend. Every action here is a move one
 * persona makes that the other one can see — that reciprocity is what the
 * prototype is for, so the actions are named after what a person did, not after
 * what a table row does.
 *
 * State is in-memory on purpose: a reload always returns to the seeded design
 * state, so a demo can never end up in a confusing half-finished shape.
 */

let counter = 0
const uid = (prefix: string) => `${prefix}-${++counter}`

/** The inquiry a presenter submits from the public form. */
export interface SubmittedInquiry {
  building: string
  intent: string
  timeframe: string
  story: string
  name: string
  email: string
  place: string
}

export interface DemoState {
  inquiries: Inquiry[]
  clients: Client[]
  cases: Record<string, Case>
  questions: Question[]
  deadlines: Deadline[]
  messages: Message[]
  slots: Slot[]
  appointments: Appointment[]
  toasts: Toast[]
  templates: WorkflowTemplate[]

  /** Which inquiry the consultant is reading. */
  selectedInquiryId: string
  /** Which question the consultant is reading. */
  selectedQuestionId: string
  /** Which workflow template is open in Einrichtung. */
  selectedTemplateId: string
  /** Set once the client has finished the intake, so screens can reflect it. */
  intakeDone: boolean
  /** The inquiry the presenter just sent, if any — drives the confirmation page. */
  ownInquiryId: string | null
  /** Rail collapsed to icons only. Lives here so it survives route changes. */
  railCollapsed: boolean
  /** ⌘K palette open. */
  paletteOpen: boolean

  // ── Kundschaft → Beraterin
  submitInquiry(input: SubmittedInquiry): void
  askQuestion(caseId: string, text: string): { escalated: boolean }
  uploadDocument(caseId: string, docId: string): void
  submitIntake(input: { slotId: string; meetingKind: string; coOwner?: string }): void

  // ── Beraterin → Kundschaft
  acceptInquiry(id: string): void
  declineInquiry(id: string): void
  followUpInquiry(id: string): void
  releaseAnswer(questionId: string, body?: string[]): void
  resolveDeadline(id: string): void

  // ── Einrichtung
  selectTemplate(id: string): void
  reorderSteps(templateId: string, steps: WorkflowStep[]): void
  setStepOwner(templateId: string, stepId: string, owner: Owner): void
  updateStep(templateId: string, stepId: string, patch: Partial<WorkflowStep>): void
  addStep(templateId: string): void
  removeStep(templateId: string, stepId: string): void
  activateTemplate(id: string): void
  regenerateTemplate(id: string): void
  createTemplate(label: string): void

  // ── Chrome
  selectInquiry(id: string): void
  selectQuestion(id: string): void
  toggleRail(): void
  setPaletteOpen(open: boolean): void
  pushToast(toast: Omit<Toast, 'id'>): void
  dismissToast(id: string): void
  reset(): void
}

function initial() {
  return {
    inquiries: structuredClone(seed.inquiries),
    clients: structuredClone(seed.clients),
    cases: { reuter: structuredClone(seed.reuterCase) } as Record<string, Case>,
    questions: structuredClone(seed.questions),
    deadlines: structuredClone(seed.deadlines),
    messages: structuredClone(seed.messages),
    slots: structuredClone(seed.slots),
    appointments: structuredClone(seed.appointments),
    toasts: [] as Toast[],
    templates: structuredClone(seed.workflowTemplates),
    selectedInquiryId: 'sander',
    selectedQuestionId: 'q-fenster',
    selectedTemplateId: 'ebw',
    intakeDone: false,
    ownInquiryId: null as string | null,
    railCollapsed: false,
    paletteOpen: false,
  }
}

/** The client portal headline is derived, so uploads visibly change the page. */
function headlineFor(c: Case): Case['clientHeadline'] {
  const missing = c.documents.filter((d) => d.state === 'fehlt').length
  if (missing === 0) {
    return {
      title: 'Alles da. Jetzt ist Frau Held dran.',
      sub: 'Sie werden erst am 19. August wieder gebraucht — beim Vor-Ort-Termin. Bis dahin müssen Sie nichts tun.',
    }
  }
  if (missing === 1) {
    return {
      title: 'Eine Unterlage fehlt. Sonst sind Sie durch.',
      sub: 'Danach werden Sie erst am 19. August wieder gebraucht — beim Vor-Ort-Termin. Bis dahin arbeitet Frau Held.',
    }
  }
  return {
    title: `${missing === 2 ? 'Zwei' : missing} Unterlagen fehlen. Sonst sind Sie durch.`,
    sub: 'Danach werden Sie erst am 19. August wieder gebraucht — beim Vor-Ort-Termin. Bis dahin arbeitet Frau Held.',
  }
}

/** Step 3's one-line status, kept in sync with the documents. */
function docNoteFor(c: Case): string {
  const have = c.documents.filter((d) => d.state !== 'fehlt').length
  const missing = c.documents.length - have
  if (missing === 0) return `${have} von ${c.documents.length} da · vollständig`
  return `${have} von ${c.documents.length} da · ${missing} ${missing === 1 ? 'fehlt' : 'fehlen'} bis Fr 15.08.`
}

export const useDemo = create<DemoState>((set, get) => ({
  ...initial(),

  // ───────────────────────────────────────────── Kundschaft → Beraterin

  submitInquiry(input) {
    const id = uid('inq')
    const inquiry: Inquiry = {
      id,
      name: input.name,
      email: input.email,
      location: input.place,
      arrived: `heute, ${seed.NOW}`,
      listDate: 'HEUTE',
      listTime: seed.NOW,
      summary: summarise(input),
      tag: `${abbreviate(input.building)} · ${cityOf(input.place)} · ${
        fitsProfile(input.building) ? 'ALLE REGELN ERFÜLLT' : 'AUSSERHALB IHRES ZUSCHNITTS'
      }`,
      tagState: fitsProfile(input.building) ? 'neu' : 'ausserhalb',
      state: 'neu',
      buildingType: input.building,
      intent: input.intent,
      timeframe: input.timeframe,
      quote: `„${input.story.trim()}"`,
      rules: rulesFor(input),
      suggestion: fitsProfile(input.building)
        ? 'Vorschlag: iSFP zuerst, dann KfW 458 — mit Fahrplan gibt es auf den Heizungstausch fünf Prozent mehr. Denkmalschutz klären Sie im Erstgespräch, dafür ist es kein Hindernis.'
        : 'Vorschlag: absagen und weiterempfehlen. Das Gebäude liegt außerhalb Ihres Zuschnitts.',
      isNew: true,
    }

    set((s) => ({
      // Newest first, and drop the seeded Sander row so the presenter's own
      // inquiry takes its place instead of sitting next to a duplicate.
      inquiries: [inquiry, ...s.inquiries.filter((i) => i.id !== 'sander')],
      selectedInquiryId: id,
      ownInquiryId: id,
    }))

    get().pushToast({
      kind: 'mail',
      title: 'Ihre Anfrage ist raus.',
      detail: `Eine Bestätigung liegt in ${input.email}. Frau Held liest sie in der Regel am selben Tag.`,
    })
  },

  askQuestion(caseId, text) {
    const verdict = triage(text)
    const id = uid('q')

    if (verdict.kind === 'auto') {
      const question: Question = {
        id,
        caseId,
        question: text.trim(),
        asked: `heute · ${seed.NOW}`,
        age: 'gerade',
        author: 'ensera',
        answer: verdict.result.answer,
        provenance: verdict.result.provenance,
      }
      set((s) => ({ questions: [...s.questions, question] }))
      return { escalated: false }
    }

    const esc = verdict.result
    const question: Question = {
      id,
      caseId,
      question: text.trim(),
      asked: `heute · ${seed.NOW}`,
      age: 'gerade',
      author: 'offen',
      escalationTag: esc.tag,
      escalationReason: esc.reason,
      answer:
        'Diese Frage habe ich nicht selbst beantwortet — sie geht an Frau Held. Sie bekommen die Antwort meist am selben Tag.',
      provenance: 'LIEGT BEI FRAU HELD · ANTWORT MEIST AM SELBEN TAG',
      draft: esc.draft,
    }

    set((s) => ({
      questions: [...s.questions, question],
      selectedQuestionId: id,
      clients: s.clients.map((c) =>
        c.id === caseId ? { ...c, openQuestions: c.openQuestions + 1 } : c,
      ),
    }))
    return { escalated: true }
  },

  uploadDocument(caseId, docId) {
    set((s) => {
      const c = s.cases[caseId]
      if (!c) return s

      const documents = c.documents.map((d) =>
        d.id === docId ? { ...d, state: 'gelesen' as const, arrived: 'heute' } : d,
      )
      const next: Case = { ...c, documents }
      next.clientHeadline = headlineFor(next)
      next.phases = next.phases.map((p) =>
        p.id === 'p3' ? { ...p, note: docNoteFor(next) } : p,
      )

      const have = documents.filter((d) => d.state !== 'fehlt').length
      const stillMissing = documents.filter((d) => d.state === 'fehlt').length
      const doc = c.documents.find((d) => d.id === docId)

      return {
        cases: { ...s.cases, [caseId]: next },
        clients: s.clients.map((cl) =>
          cl.id === caseId ? { ...cl, docsTotal: have, lastContact: `heute, ${seed.NOW}` } : cl,
        ),
        // The deadline row shrinks with each upload and clears when nothing is left.
        deadlines: stillMissing
          ? s.deadlines.map((d) =>
              d.caseId === caseId && d.id === 'd-reuter-docs'
                ? { ...d, detail: `${c.address} · ${stillMissing} von ${documents.length} fehlen` }
                : d,
            )
          : s.deadlines.filter((d) => d.id !== 'd-reuter-docs'),
        messages: [
          {
            id: uid('m'),
            recipient: c.clientName,
            recipientDetail: c.address,
            subject: `${doc?.label ?? 'Unterlage'} angekommen und ausgelesen`,
            author: 'ensera' as const,
            sent: `heute ${seed.NOW}`,
            delivery: 'zugestellt' as const,
            deliveryLabel: 'zugestellt',
            isNew: true,
          },
          ...s.messages,
        ],
      }
    })
  },

  submitIntake({ slotId, meetingKind, coOwner }) {
    const slot = get().slots.find((s) => s.id === slotId)
    set((s) => ({
      intakeDone: true,
      // The chosen time leaves her free list and becomes a fixed appointment.
      slots: s.slots.filter((x) => x.id !== slotId),
      appointments: slot
        ? [
            ...s.appointments,
            {
              id: uid('app'),
              caseId: 'sander',
              day: slot.day,
              start: slot.start,
              kind: `Erstgespräch · ${meetingKind}`,
            },
          ]
        : s.appointments,
      deadlines: slot
        ? [
            {
              id: uid('d'),
              caseId: 'sander',
              when: shortDay(slot.day, slot.start),
              title: 'Erstgespräch Tobias Sander',
              detail: `Ringstraße 8 · ${meetingKind.toLowerCase()}, rund 45 Minuten`,
              owner: 'gemeinsam' as const,
              bucket: bucketFor(slot.day),
              status: 'steht im Kalender',
            },
            ...s.deadlines,
          ]
        : s.deadlines,
      messages: [
        {
          id: uid('m'),
          recipient: 'Tobias Sander',
          recipientDetail: 'Ringstraße 8',
          subject: slot
            ? `Bestätigung Erstgespräch, ${shortDay(slot.day, slot.start)}`
            : 'Ihre Angaben sind angekommen',
          author: 'ensera' as const,
          sent: `heute ${seed.NOW}`,
          delivery: 'zugestellt' as const,
          deliveryLabel: 'zugestellt',
          isNew: true,
        },
        ...(coOwner
          ? [
              {
                id: uid('m'),
                recipient: coOwner,
                recipientDetail: 'Miteigentümerin · Ringstraße 8',
                subject: 'Bitte um Ihre Vollmacht',
                author: 'ensera' as const,
                sent: `heute ${seed.NOW}`,
                delivery: 'zugestellt' as const,
                deliveryLabel: 'zugestellt',
                isNew: true,
              },
            ]
          : []),
        ...s.messages,
      ],
    }))

    get().pushToast({
      kind: 'mail',
      title: 'Ihre Angaben sind bei Frau Held.',
      detail: slot
        ? `Der Termin am ${shortDay(slot.day, slot.start)} ist in ihrem Kalender geblockt. Die Bestätigung liegt in Ihrem Postfach.`
        : 'Die Bestätigung liegt in Ihrem Postfach.',
      action: { label: 'Ihren Bereich öffnen', to: '/bereich' },
    })
  },

  // ───────────────────────────────────────────── Beraterin → Kundschaft

  acceptInquiry(id) {
    const inquiry = get().inquiries.find((i) => i.id === id)
    if (!inquiry) return

    set((s) => ({
      inquiries: s.inquiries.map((i) =>
        i.id === id
          ? { ...i, state: 'angenommen', tag: 'ANGENOMMEN · ZUGANG RAUS', tagState: 'erledigt' }
          : i,
      ),
      messages: [
        {
          id: uid('m'),
          recipient: inquiry.name,
          recipientDetail: inquiry.location,
          subject: `Ihr Zugang zu ${inquiry.location.replace(/^\d+\s*/, '')}`,
          author: 'ensera' as const,
          sent: `heute ${seed.NOW}`,
          delivery: 'zugestellt' as const,
          deliveryLabel: 'zugestellt',
          isNew: true,
        },
        ...s.messages,
      ],
    }))

    // The toast action *is* the magic link — it's how the demo crosses back
    // over to the client without inventing a mail client.
    get().pushToast({
      kind: 'mail',
      title: `Zugang an ${inquiry.email} raus.`,
      detail: 'Mit Ihrem Namen als Absender. Der Link führt direkt in die Aufnahme.',
      action: { label: 'Als Kundschaft öffnen', to: '/aufnahme' },
    })
  },

  declineInquiry(id) {
    const inquiry = get().inquiries.find((i) => i.id === id)
    if (!inquiry) return
    set((s) => ({
      inquiries: s.inquiries.map((i) =>
        i.id === id
          ? { ...i, state: 'abgelehnt', tag: 'ABGESAGT · EMPFEHLUNG RAUS', tagState: 'erledigt' }
          : i,
      ),
      messages: [
        {
          id: uid('m'),
          recipient: inquiry.name,
          recipientDetail: `${cityOf(inquiry.location)} · Anfrage abgelehnt`,
          subject: 'Absage mit Empfehlung eines Kollegen',
          author: 'katrin' as const,
          sent: `heute ${seed.NOW}`,
          delivery: 'zugestellt' as const,
          deliveryLabel: 'zugestellt',
          isNew: true,
        },
        ...s.messages,
      ],
    }))
    get().pushToast({
      kind: 'mail',
      title: `Absage an ${inquiry.name} raus.`,
      detail: 'Mit der Empfehlung eines Kollegen, der Mehrfamilienhäuser macht.',
    })
  },

  followUpInquiry(id) {
    const inquiry = get().inquiries.find((i) => i.id === id)
    if (!inquiry) return
    set((s) => ({
      inquiries: s.inquiries.map((i) =>
        i.id === id
          ? { ...i, state: 'nachgefragt', tag: 'NACHGEFRAGT · WARTET AUF ANTWORT', tagState: 'erledigt' }
          : i,
      ),
      messages: [
        {
          id: uid('m'),
          recipient: inquiry.name,
          recipientDetail: inquiry.location,
          subject: 'Eine Rückfrage zu Ihrer Anfrage',
          author: 'katrin' as const,
          sent: `heute ${seed.NOW}`,
          delivery: 'zugestellt' as const,
          deliveryLabel: 'zugestellt',
          isNew: true,
        },
        ...s.messages,
      ],
    }))
    get().pushToast({
      kind: 'mail',
      title: `Rückfrage an ${inquiry.name} raus.`,
      detail: 'Die Anfrage bleibt offen, bis die Antwort da ist.',
    })
  },

  releaseAnswer(questionId, body) {
    const q = get().questions.find((x) => x.id === questionId)
    if (!q?.draft) return

    const paragraphs = body ?? q.draft.paragraphs
    set((s) => ({
      questions: s.questions.map((x) =>
        x.id === questionId
          ? {
              ...x,
              author: 'katrin',
              answer: paragraphs.join(' '),
              provenance: 'KATRIN HELD · PERSÖNLICH GESCHRIEBEN UND FREIGEGEBEN',
              releasedAt: `heute · ${seed.NOW}`,
              draft: undefined,
              escalationTag: undefined,
            }
          : x,
      ),
      clients: s.clients.map((c) =>
        c.id === q.caseId ? { ...c, openQuestions: Math.max(0, c.openQuestions - 1) } : c,
      ),
      messages: [
        {
          id: uid('m'),
          recipient: nameOfCase(s.clients, q.caseId),
          recipientDetail: addressOfCase(s.clients, q.caseId),
          subject: `Antwort: ${q.question}`,
          author: 'katrin' as const,
          sent: `heute ${seed.NOW}`,
          delivery: 'zugestellt' as const,
          deliveryLabel: 'zugestellt',
          isNew: true,
        },
        ...s.messages,
      ],
      // Move on to whatever is still open, so the queue drains visibly.
      selectedQuestionId:
        s.questions.find((x) => x.id !== questionId && x.author === 'offen')?.id ?? questionId,
    }))

    get().pushToast({
      kind: 'mail',
      title: 'Antwort ist raus.',
      detail: `Als Ihre Nachricht, mit Ihrer EEE-Nummer im Fuß. ${nameOfCase(
        get().clients,
        q.caseId,
      )} sieht sie sofort.`,
      action: q.caseId === 'reuter' ? { label: 'Als Kundschaft ansehen', to: '/bereich' } : undefined,
    })
  },

  resolveDeadline(id) {
    const d = get().deadlines.find((x) => x.id === id)
    set((s) => ({ deadlines: s.deadlines.filter((x) => x.id !== id) }))
    if (d) {
      get().pushToast({ kind: 'plain', title: `Erledigt: ${d.title}` })
    }
  },

  // ───────────────────────────────────────────── Einrichtung

  selectTemplate: (id) => set({ selectedTemplateId: id }),

  /** Whole new order in one write — Reorder hands us the finished array. */
  reorderSteps(templateId, steps) {
    set((s) => ({
      templates: s.templates.map((t) => (t.id === templateId ? { ...t, steps } : t)),
    }))
  },

  setStepOwner(templateId, stepId, owner) {
    get().updateStep(templateId, stepId, { owner })
  },

  updateStep(templateId, stepId, patch) {
    set((s) => ({
      templates: s.templates.map((t) =>
        t.id === templateId
          ? { ...t, steps: t.steps.map((st) => (st.id === stepId ? { ...st, ...patch } : st)) }
          : t,
      ),
    }))
  },

  addStep(templateId) {
    set((s) => ({
      templates: s.templates.map((t) =>
        t.id === templateId
          ? { ...t, steps: [...t.steps, { id: uid('step'), ...seed.newStepDefaults }] }
          : t,
      ),
    }))
  },

  removeStep(templateId, stepId) {
    const t = get().templates.find((x) => x.id === templateId)
    // A workflow with no steps isn't a workflow; refuse rather than allow it.
    if (!t || t.steps.length <= 1) {
      get().pushToast({
        kind: 'plain',
        title: 'Der letzte Schritt bleibt.',
        detail: 'Eine Vorlage ohne Schritte würde für keinen Fall etwas bedeuten.',
      })
      return
    }
    set((s) => ({
      templates: s.templates.map((x) =>
        x.id === templateId ? { ...x, steps: x.steps.filter((st) => st.id !== stepId) } : x,
      ),
    }))
  },

  activateTemplate(id) {
    const t = get().templates.find((x) => x.id === id)
    if (!t) return
    set((s) => ({
      templates: s.templates.map((x) => (x.id === id ? { ...x, draft: false } : x)),
    }))
    get().pushToast({
      kind: 'plain',
      title: t.draft ? `${t.label} ist aktiv.` : `${t.label} ist gespeichert.`,
      detail: t.caseCount
        ? `Gilt für neue Fälle. Die ${t.caseCount} laufenden behalten ihre Version.`
        : 'Gilt ab dem nächsten Fall.',
    })
  },

  regenerateTemplate(id) {
    const fresh = seed.workflowTemplates.find((t) => t.id === id)
    if (!fresh) {
      get().pushToast({
        kind: 'plain',
        title: 'Dafür gibt es kein Regelwerk.',
        detail: 'Diese Vorlage haben Sie selbst angelegt — ich kann sie nicht neu ableiten.',
      })
      return
    }
    set((s) => ({
      templates: s.templates.map((t) =>
        t.id === id ? { ...structuredClone(fresh), draft: t.draft, caseCount: t.caseCount } : t,
      ),
    }))
    get().pushToast({
      kind: 'plain',
      title: 'Neu aus dem Regelwerk erzeugt.',
      detail: 'Ihre Änderungen an dieser Vorlage sind damit überschrieben.',
    })
  },

  createTemplate(label) {
    const id = uid('tpl')
    set((s) => ({
      templates: [
        ...s.templates,
        {
          id,
          label: label.trim() || 'Neue Vorlage',
          caseCount: 0,
          draft: true,
          ruleVersion: 'ENTWURF · NOCH KEIN REGELSTAND',
          derivedFrom:
            'Diese Vorlage haben Sie selbst angelegt — ich habe nichts abgeleitet und tue nichts, solange kein Schritt mir etwas zuweist.',
          steps: [{ id: uid('step'), ...seed.newStepDefaults }],
        },
      ],
      selectedTemplateId: id,
    }))
  },

  // ───────────────────────────────────────────── Chrome

  selectInquiry: (id) => set({ selectedInquiryId: id }),
  selectQuestion: (id) => set({ selectedQuestionId: id }),
  toggleRail: () => set((s) => ({ railCollapsed: !s.railCollapsed })),
  setPaletteOpen: (open) => set({ paletteOpen: open }),

  pushToast(toast) {
    const id = uid('t')
    set((s) => ({ toasts: [...s.toasts, { ...toast, id }] }))
    // Toasts carrying an action stay long enough to be clicked.
    window.setTimeout(() => get().dismissToast(id), toast.action ? 9000 : 5000)
  },

  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  reset: () => set(initial()),
}))

// ───────────────────────────────────────────────────────────────── helpers

/**
 * The one-line précis in the inquiry list.
 *
 * Composed from the structured answers rather than truncated from the prose —
 * a cut-off sentence reads like a bug, and the whole point of the pre-check is
 * that the system understood the inquiry rather than merely stored it.
 */
function summarise(i: SubmittedInquiry): string {
  const year = buildYear(i.story)
  return `${i.intent} · ${i.building}${year ? `, Baujahr ${year}` : ''}`
}

/**
 * Pull the building's year of construction out of free text.
 *
 * People mention several years in one paragraph — the boiler, the windows, the
 * roof — so taking the first match gets it wrong. An explicit „Baujahr 1972"
 * wins; failing that, the earliest year mentioned, because a house cannot
 * predate its own parts.
 */
function buildYear(story: string): string | undefined {
  const explicit = story.match(/Baujahr\s*:?\s*(1[89]\d{2}|20[0-2]\d)/i)?.[1]
  if (explicit) return explicit
  const all = story.match(/\b(1[89]\d{2}|20[0-2]\d)\b/g)
  return all?.sort()[0]
}

function abbreviate(building: string): string {
  if (building.startsWith('Einfamilien')) return 'EFH'
  if (building.startsWith('Zweifamilien')) return 'ZFH'
  if (building.startsWith('Mehrfamilien')) return 'MFH'
  return 'GEWERBE'
}

function cityOf(place: string): string {
  return (place.replace(/^\d+\s*/, '').trim() || place).toUpperCase()
}

/** Her stated profile: one- and two-family homes, no commercial, no new builds. */
function fitsProfile(building: string): boolean {
  return building.startsWith('Einfamilien') || building.startsWith('Zweifamilien')
}

/** Six rules, always all six, ordered to fill the detail panel's two columns. */
function rulesFor(i: SubmittedInquiry): Inquiry['rules'] {
  const efh = fitsProfile(i.building)
  const year = buildYear(i.story)
  const mfh = i.building.startsWith('Mehrfamilien')
  return [
    { label: 'Ein- oder Zweifamilienhaus', state: efh ? 'erfuellt' : 'verletzt' },
    { label: 'kein Gewerbe', state: i.building === 'Gewerbe' ? 'verletzt' : 'erfuellt' },
    {
      label: year ? `kein Neubau — Baujahr ${year} aus dem Text` : 'Baujahr nicht genannt',
      state: year ? 'erfuellt' : 'offen',
    },
    {
      label: mfh ? 'kein MFH — Mehrfamilienhaus' : 'kein MFH',
      state: mfh ? 'verletzt' : 'erfuellt',
    },
    { label: 'keine größere Sanierung', state: 'erfuellt' },
    { label: 'Denkmalschutz nicht beantwortet', state: 'offen' },
  ]
}

/** „DONNERSTAG · 13. AUGUST" + „09:00" → „Do 13.08. 09:00" */
function shortDay(day: string, start: string): string {
  const [weekday, date] = day.split(' · ')
  const short = weekday.slice(0, 2).charAt(0) + weekday.slice(1, 2).toLowerCase()
  const dayNum = date.match(/\d+/)?.[0]?.padStart(2, '0') ?? ''
  return `${short} ${dayNum}.08. ${start}`
}

function bucketFor(day: string): Deadline['bucket'] {
  const dayNum = Number(day.match(/\d+/)?.[0] ?? 0)
  return dayNum <= 16 ? 'woche' : 'spaeter'
}

function nameOfCase(clients: Client[], id: string): string {
  return clients.find((c) => c.id === id)?.name ?? 'Kundschaft'
}

function addressOfCase(clients: Client[], id: string): string {
  return clients.find((c) => c.id === id)?.address ?? ''
}

// ───────────────────────────────────────────────────── derived selectors

/*
 * These derive fresh objects/arrays on every call, so they must be read through
 * `useShallow` — otherwise every store write looks like a change and React
 * re-renders forever. The hooks below are the only sanctioned way in.
 */

/** Rail badge counts, derived so they move when the personas act. */
export function useRailCounts() {
  return useDemo(
    useShallow((s) => ({
      anfragen: s.inquiries.filter((i) => i.state === 'neu').length,
      kundschaft: seed.baseline.mandates,
      // Deadlines that need her personally, plus anything the client booked.
      kalender:
        s.deadlines.filter((d) => d.owner === 'sie' && d.bucket !== 'spaeter').length +
        s.appointments.length,
      postfach: seed.baseline.outbox + newMessages(s),
      fragen: s.questions.filter((q) => q.author === 'offen').length,
    })),
  )
}

/** Messages created during this demo run, i.e. beyond the seeded eight. */
export function newMessages(s: DemoState): number {
  return Math.max(0, s.messages.length - seed.messages.length)
}

/** The escalation queue — questions ENSERA refused to answer alone. */
export function useOpenQuestions() {
  return useDemo(useShallow((s) => s.questions.filter((q) => q.author === 'offen')))
}

/** The client thread, oldest first — the design shows history top to bottom. */
export function useThread(caseId: string) {
  return useDemo(useShallow((s) => s.questions.filter((q) => q.caseId === caseId && q.answer)))
}

export { seed }
