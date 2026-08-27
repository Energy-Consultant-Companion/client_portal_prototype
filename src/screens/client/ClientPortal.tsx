import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useDemo, useThread, seed } from '@/store/demo'
import { listVariants, rowVariants, transition } from '@/motion/tokens'
import { Button, Dot, Eyebrow, Meter, OwnerTag } from '@/components/primitives'
import { HeldHeader, HeldFooter } from '@/components/chrome/HeldHeader'
import { Orb } from '@/components/chrome/Orb'
import { ArrowUpIcon, CheckIcon, ChevronDownIcon, UploadIcon } from '@/icons'
import type { Case, CaseDocument, CasePhase } from '@/store/types'

/*
 * Ihr Bereich — the client's whole relationship on one page.
 *
 * The organising idea, stated in the design as a label: „beide Seiten sehen das
 * gleiche". So this page renders from the same case record the consultant reads,
 * and the split at the top says plainly who is holding things up. Nothing is
 * hidden behind a login-shaped wall of tabs.
 */
export function ClientPortal() {
  const kase = useDemo((s) => s.cases.reuter)
  const thread = useThread('reuter')
  const ask = useDemo((s) => s.askQuestion)
  const pushToast = useDemo((s) => s.pushToast)
  const [question, setQuestion] = useState('')

  const missing = kase.documents.filter((d) => d.state === 'fehlt')

  function onAsk() {
    const text = question.trim()
    if (!text) return
    const { escalated } = ask('reuter', text)
    setQuestion('')
    pushToast(
      escalated
        ? {
            kind: 'plain',
            title: 'Die Frage liegt bei Frau Held.',
            detail: 'Der KI-Assistent hat sie nicht selbst beantwortet — dafür hängt zu viel daran.',
            action: { label: 'Als Beraterin ansehen', to: '/ensera/fragen' },
          }
        : { kind: 'plain', title: 'Sofort beantwortet.', detail: 'Aus dem, was in Ihrem Fall liegt.' },
    )
  }

  return (
    <div className="min-h-screen bg-surface">
      <HeldHeader variant="portal" address={`${kase.address}, Peine`} person={kase.clientName} />

      {/* ── Begrüßung. The headline greets; the line under it says what this
          page is for, and each promise it makes links to where it is kept. */}
      <section className="flex justify-between gap-2xl px-[60px] pt-[68px] pb-2xl">
        <div className="max-w-[620px]">
          <h1 className="pb-md font-display text-3xl font-semibold leading-[46px] tracking-tight">
            Guten Tag, {kase.clientName}.
          </h1>
          <p className="text-md leading-[28px] text-fg-muted">
            Hier sehen Sie <PortalLink to="stand">den aktuellen Stand Ihres Vorhabens</PortalLink>,{' '}
            <PortalLink to="unterlagen">welche Unterlagen schon da sind</PortalLink> — und können{' '}
            <PortalLink to="fragen">jederzeit Ihre Fragen stellen</PortalLink>.
          </p>
        </div>

        <dl className="flex w-[300px] shrink-0 flex-col">
          <MetaRow label="FÖRDERUNG" value={kase.program} />
          <MetaRow label="IHRE ENERGIEBERATERIN" value={seed.consultant.name} last />
        </dl>
      </section>

      {/* ── Wie es gerade steht */}
      <section id="stand" className="scroll-mt-lg px-[60px] pb-[72px]">
        <div className="flex items-baseline justify-between pb-xs">
          <Eyebrow>WIE ES GERADE STEHT</Eyebrow>
          <Eyebrow>BEIDE SEITEN SEHEN DAS GLEICHE</Eyebrow>
        </div>

        <AnimatePresence mode="wait">
          <motion.h2
            key={kase.clientHeadline.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={transition.base}
            className="pb-xs font-display text-2xl font-semibold tracking-tight"
          >
            {kase.clientHeadline.title}
          </motion.h2>
        </AnimatePresence>
        <p className="max-w-[620px] pb-lg text-base leading-[24px] text-fg-muted">
          {kase.clientHeadline.sub}
        </p>

        <div className="grid grid-cols-2 gap-lg">
          <YourSide docs={missing} />
          <HerSide kase={kase} />
        </div>
      </section>

      {/* ── Ablauf */}
      <section id="unterlagen" className="scroll-mt-lg bg-surface-sunken px-[60px] py-[72px]">
        <Eyebrow className="pb-sm">ABLAUF UND UNTERLAGEN</Eyebrow>
        <div className="flex items-end justify-between pb-lg">
          <h2 className="font-display text-2xl font-semibold tracking-tight">
            Sechs Schritte. Sie sind bei Schritt {numberWord(kase.phaseIndex)}.
          </h2>
          <span className="flex items-center gap-md">
            <Legend state="erledigt" label="ERLEDIGT" />
            <Legend state="laeuft" label="LÄUFT" />
            <Legend state="kommt" label="KOMMT NOCH" />
          </span>
        </div>

        <motion.div variants={listVariants} initial="initial" animate="animate">
          {kase.phases.map((p) => (
            <PhaseRow key={p.id} phase={p} kase={kase} />
          ))}
        </motion.div>
      </section>

      {/* ── Fragen */}
      <section id="fragen" className="scroll-mt-lg px-[60px] py-[72px]">
        <Eyebrow className="pb-sm">IHRE FRAGEN</Eyebrow>
        <div className="flex items-end justify-between gap-2xl pb-lg">
          <h2 className="font-display text-2xl font-semibold tracking-tight">
            Fragen Sie. Die meisten sind sofort beantwortet.
          </h2>
          <p className="max-w-[430px] text-base leading-[22px] text-fg-muted">
            Die meisten Fragen beantwortet Ihnen der KI-Assistent sofort aus Ihren Unterlagen. Geht
            es tiefer, antwortet Frau Held Ihnen persönlich.
          </p>
        </div>

        <div className="flex items-center gap-sm rounded-xl border border-border bg-surface px-lg py-sm
                        shadow-[0_1px_3px_rgba(18,22,27,0.06)] transition-colors focus-within:border-brand">
          <Orb size={22} />
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onAsk()}
            placeholder="Frage zu Ihrem Vorhaben …"
            className="h-[38px] flex-1 bg-transparent text-md text-fg placeholder:text-fg-subtle focus:outline-none"
          />
          <motion.button
            type="button"
            onClick={onAsk}
            disabled={!question.trim()}
            whileTap={{ scale: 0.94 }}
            transition={transition.fast}
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand text-brand-fg
                       transition-opacity disabled:opacity-30"
            aria-label="Frage senden"
          >
            <ArrowUpIcon size={14} />
          </motion.button>
        </div>

        <div className="pt-lg">
          <AnimatePresence initial={false}>
            {thread.map((q) => (
              <motion.article
                key={q.id}
                layout
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={transition.emphasis}
                className="border-b border-border py-lg last:border-0"
              >
                <div className="flex items-baseline justify-between gap-lg pb-xs">
                  <h3 className="text-md font-medium leading-[24px] text-fg">{q.question}</h3>
                  <Eyebrow>{q.asked.toUpperCase()}</Eyebrow>
                </div>
                <p className="max-w-[880px] pb-sm text-base leading-[24px] text-fg-muted">
                  {q.answer}
                </p>
                <div className="flex items-baseline justify-between gap-lg">
                  <span
                    className={`label-caps flex items-center gap-xs ${
                      q.author === 'katrin' ? 'text-fg-muted' : 'text-brand'
                    }`}
                  >
                    <Dot state={q.author === 'katrin' ? 'erledigt' : 'brand'} size={5} />
                    {q.provenance}
                  </span>
                  {q.author === 'offen' && <Eyebrow tone="subtle">{q.age.toUpperCase()}</Eyebrow>}
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </div>
      </section>

      <HeldFooter portal />
    </div>
  )
}

/** An in-page link, styled as prose rather than as chrome. */
function PortalLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <a
      href={`#${to}`}
      className="text-fg underline decoration-border-strong underline-offset-[5px]
                 transition-colors hover:decoration-fg"
    >
      {children}
    </a>
  )
}

function MetaRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div
      className={`flex items-baseline justify-between gap-md py-sm ${
        last ? '' : 'border-b border-border-subtle'
      }`}
    >
      <dt className="label-caps text-fg-subtle">{label}</dt>
      <dd className="text-base text-fg">{value}</dd>
    </div>
  )
}

/** The client's own list of obligations — the only card with buttons on it. */
function YourSide({ docs }: { docs: CaseDocument[] }) {
  const upload = useDemo((s) => s.uploadDocument)
  const allDone = docs.length === 0

  return (
    <div className="flex flex-col rounded-xl border border-border bg-surface p-lg shadow-[0_1px_3px_rgba(18,22,27,0.06)]">
      <div className="flex items-baseline justify-between pb-md">
        <span className="label-caps flex items-center gap-xs text-fg">
          <Dot state={allDone ? 'erledigt' : 'fehlt'} size={5} />
          {allDone ? 'NICHTS MEHR OFFEN' : 'IHRE AUFGABEN'}
        </span>
        {!allDone && <Eyebrow tone="error">FRIST FR 15.08.</Eyebrow>}
      </div>

      <AnimatePresence initial={false} mode="popLayout">
        {docs.map((doc) => (
          <motion.div
            key={doc.id}
            layout
            exit={{ opacity: 0, x: 16, height: 0, transition: transition.exit }}
            className="flex items-start gap-sm border-t border-border-subtle py-md"
          >
            <span className="mt-[6px] flex size-[14px] shrink-0 items-center justify-center rounded-full bg-feedback-error-surface">
              <Dot state="fehlt" size={6} />
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-[3px]">
              <span className="text-base font-medium leading-[20px] text-fg">
                {doc.clientLabel ?? doc.label}
              </span>
              <span className="text-sm leading-[20px] text-fg-muted">{doc.reason}</span>
            </span>
            <Button variant="secondary" size="sm" onClick={() => upload('reuter', doc.id)}>
              {doc.action === 'weiterleiten' ? 'Weiterleiten' : 'Hochladen'}
            </Button>
          </motion.div>
        ))}
      </AnimatePresence>

      {allDone ? (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="border-t border-border-subtle pt-md text-base leading-[22px] text-fg-muted"
        >
          Alle neun Unterlagen liegen vor. Sie werden erst beim Vor-Ort-Termin am 19. August wieder
          gebraucht.
        </motion.p>
      ) : (
        <div className="mt-auto flex items-center gap-md border-t border-border-subtle pt-md">
          <Button
            variant="primary"
            onClick={() => docs[0] && upload('reuter', docs[0].id)}
            className="shrink-0"
          >
            <UploadIcon size={15} />
            Unterlagen hochladen
          </Button>
          <p className="text-sm leading-[20px] text-fg-subtle">
            Fotografieren genügt. Wir erkennen selbst, was es ist.
          </p>
        </div>
      )}
    </div>
  )
}

/** Her side. No buttons at all — the point is that the client needn't act. */
function HerSide({ kase }: { kase: Case }) {
  return (
    <div className="flex flex-col rounded-xl bg-surface-sunken p-lg">
      <div className="flex items-baseline justify-between pb-md">
        <span className="label-caps flex items-center gap-xs text-fg-muted">
          <Dot state="brand" size={5} />
          FRAU HELD ARBEITET DARAN
        </span>
        <Eyebrow>SIE MÜSSEN NICHTS TUN</Eyebrow>
      </div>

      <p className="pb-md font-display text-lg font-semibold tracking-tight">{kase.agentHeadline}</p>

      <motion.div variants={listVariants} initial="initial" animate="animate">
        {kase.agentLog.map((entry) => (
          <motion.div
            key={entry.when}
            variants={rowVariants}
            className="flex items-start gap-md border-t border-border py-sm"
          >
            <span className="label-caps w-[64px] shrink-0 pt-[4px] text-fg-subtle">{entry.when}</span>
            <span
              className={`flex-1 text-base leading-[22px] ${
                entry.state === 'kommt' ? 'text-fg-muted' : 'text-fg'
              }`}
            >
              {entry.text}
            </span>
            <span className="flex size-[14px] shrink-0 items-center justify-center pt-[4px]">
              {entry.state === 'erledigt' && (
                <span className="text-fg">
                  <CheckIcon size={12} strokeWidth={1.6} />
                </span>
              )}
              {entry.state === 'laeuft' && <Dot state="laeuft" size={6} />}
              {entry.state === 'kommt' && <Dot state="kommt" size={7} />}
            </span>
          </motion.div>
        ))}
      </motion.div>

      <div className="mt-auto flex items-center gap-xs border-t border-border pt-md">
        <Orb size={18} />
        <p className="text-sm text-fg-muted">
          Diese Zeile schreibt der KI-Assistent automatisch mit — Frau Held muss nichts eintragen.
        </p>
      </div>
    </div>
  )
}

/** A step in the six-phase run. Step three opens to the document grid. */
function PhaseRow({ phase, kase }: { phase: CasePhase; kase: Case }) {
  const upload = useDemo((s) => s.uploadDocument)
  const [open, setOpen] = useState(phase.state === 'laeuft' && Boolean(phase.expandable))

  const arrived = kase.documents.filter((d) => d.state !== 'fehlt').length
  const missing = kase.documents.length - arrived

  return (
    <motion.div variants={rowVariants} layout className="border-b border-border last:border-0">
      <button
        type="button"
        onClick={() => phase.expandable && setOpen((o) => !o)}
        className={`grid w-full grid-cols-[36px_18px_150px_1fr_260px_150px_20px] items-center gap-md py-md text-left
          ${phase.expandable ? 'cursor-pointer' : 'cursor-default'}`}
      >
        <span className="numeric-mono text-2xs text-fg-subtle">{phase.index}</span>
        <span className="flex justify-center">
          <Dot state={phase.state} size={phase.state === 'kommt' ? 7 : 6} />
        </span>
        <span
          className={`text-base ${
            phase.state === 'laeuft'
              ? 'font-medium text-brand'
              : phase.state === 'kommt'
                ? 'font-medium text-fg'
                : 'text-fg'
          }`}
        >
          {phase.date}
        </span>
        <span className={`text-md ${phase.state === 'laeuft' ? 'font-medium text-fg' : 'text-fg'}`}>
          {phase.title}
        </span>
        <span className="text-base text-fg-muted">{phase.note}</span>
        <OwnerTag
          owner={phase.owner}
          audience="kundschaft"
          note={phase.state === 'laeuft' && phase.owner === 'kundschaft' ? 'SIND DRAN' : undefined}
          separator=" "
          align="right"
        />
        <span className="flex justify-end">
          {phase.expandable && (
            <motion.span
              animate={{ rotate: open ? 180 : 0 }}
              transition={transition.base}
              className="text-fg-subtle"
            >
              <ChevronDownIcon size={14} />
            </motion.span>
          )}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && phase.expandable && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={transition.base}
            className="overflow-hidden"
          >
            <div className="mb-md rounded-lg bg-surface px-lg py-md">
              <div className="flex items-center justify-between pb-md">
                <span className="flex items-center gap-sm">
                  <Eyebrow>NEUN UNTERLAGEN</Eyebrow>
                  <Meter total={9} filled={arrived} failed={missing} />
                  <span className="text-sm text-fg-muted">
                    {arrived} angekommen{missing > 0 && `, ${missing} ${missing === 1 ? 'fehlt' : 'fehlen'}`}
                  </span>
                </span>
                {missing > 0 && (
                  <span className="flex items-center gap-sm">
                    <span className="text-base text-feedback-error">bis Freitag, 15. August</span>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        const next = kase.documents.find((d) => d.state === 'fehlt')
                        if (next) upload('reuter', next.id)
                      }}
                    >
                      Hochladen
                    </Button>
                  </span>
                )}
              </div>

              {/* Column-major, as in the design: reading down a column keeps
                  the three Heizkostenabrechnungen together. */}
              <div className="grid grid-flow-col grid-rows-3 gap-x-lg">
                {kase.documents.map((doc) => (
                  <DocCell key={doc.id} doc={doc} onUpload={() => upload('reuter', doc.id)} />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function DocCell({ doc, onUpload }: { doc: CaseDocument; onUpload: () => void }) {
  const missing = doc.state === 'fehlt'
  return (
    <button
      type="button"
      onClick={missing ? onUpload : undefined}
      className={`flex items-center gap-sm border-b border-border-subtle py-sm text-left ${
        missing ? 'group cursor-pointer' : 'cursor-default'
      }`}
    >
      <span className="flex size-[14px] shrink-0 items-center justify-center">
        {doc.state === 'gelesen' && (
          <motion.span
            key="ok"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={transition.base}
            className="text-fg"
          >
            <CheckIcon size={13} strokeWidth={1.6} />
          </motion.span>
        )}
        {doc.state === 'laeuft' && <Dot state="laeuft" size={7} />}
        {doc.state === 'fehlt' && <Dot state="fehlt" size={7} />}
      </span>
      <span className="min-w-0 flex-1 truncate text-base text-fg">{doc.clientLabel ?? doc.label}</span>
      <span
        className={`label-caps shrink-0 ${
          missing
            ? 'text-feedback-error group-hover:text-fg'
            : doc.state === 'laeuft'
              ? 'text-brand'
              : 'text-fg-subtle'
        }`}
      >
        {missing ? 'FEHLT' : doc.state === 'laeuft' ? 'WIRD GELESEN' : 'GELESEN'}
      </span>
    </button>
  )
}

function Legend({ state, label }: { state: 'erledigt' | 'laeuft' | 'kommt'; label: string }) {
  return (
    <span className="label-caps flex items-center gap-xs text-fg-subtle">
      <Dot state={state} size={state === 'kommt' ? 7 : 5} />
      {label}
    </span>
  )
}

function numberWord(n: number): string {
  return ['null', 'eins', 'zwei', 'drei', 'vier', 'fünf', 'sechs'][n] ?? String(n)
}
