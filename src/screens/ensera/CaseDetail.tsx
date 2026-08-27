import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { useDemo } from '@/store/demo'
import { listVariants, rowVariants, transition } from '@/motion/tokens'
import { Button, Dot, Eyebrow, Meter, Segments } from '@/components/primitives'
import { CheckIcon, ChevronDownIcon, ChevronRightIcon } from '@/icons'
import type { Case, CaseDocument } from '@/store/types'

/*
 * Der Fall — one client, everything known about them.
 *
 * „Everything known" used to mean everything on screen at once: nine facts with
 * their provenance, nine documents, three meta cards and a paragraph of quote,
 * none of it more urgent than the rest. Opening the case told her nothing,
 * because it told her all of it.
 *
 * So the page now answers one question on sight — where does this case stand,
 * and what is the next move — and folds the rest into rows that say enough to
 * decide whether opening them is worth it. Nothing was removed; the summary on
 * a closed row is generated from the same data it hides, so it cannot lie about
 * what is behind it. The provenance table in particular is still one click away:
 * every value still carries where it came from, which is what lets her tell a
 * measured number from a client's guess.
 */
export function CaseDetail() {
  const { id = 'reuter' } = useParams()
  const kase = useDemo((s) => s.cases[id])
  const clients = useDemo((s) => s.clients)
  const questions = useDemo((s) => s.questions)

  const client = clients.find((c) => c.id === id)

  if (!kase) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-md px-2xl text-center">
        <Eyebrow>KUNDSCHAFT · {client?.name ?? id}</Eyebrow>
        <h1 className="max-w-[520px] font-display text-xl font-semibold tracking-tight">
          Dieser Fall ist im Prototyp nicht ausgearbeitet.
        </h1>
        <p className="max-w-[460px] text-base text-fg-muted">
          Der Fall Buchenweg 14 zeigt die vollständige Ansicht — inklusive Unterlagen, Herkunft der
          Werte und offener Frage.
        </p>
        <Link to="/ensera/kundschaft/reuter">
          <Button variant="secondary">Fall Reuter öffnen</Button>
        </Link>
      </div>
    )
  }

  const gaps = kase.facts.filter((f) => f.flag).length
  const openQuestion = questions.find((q) => q.caseId === id && q.author === 'offen')

  return (
    <div className="flex h-screen">
      <section className="scroll-quiet min-w-0 flex-1 overflow-y-auto border-r border-border px-2xl pt-[20px] pb-xl">
        <Eyebrow className="pb-sm">KUNDSCHAFT · {kase.clientName.toUpperCase()}</Eyebrow>
        <h1 className="pb-md font-display text-2xl font-semibold tracking-tight">
          {kase.address}, {kase.city}
        </h1>

        <div className="flex items-center justify-between gap-lg pb-xl">
          <span className="flex items-center gap-md">
            <Segments total={6} current={kase.phaseIndex} width={40} />
            <Eyebrow tone="brand" className="whitespace-nowrap">
              SCHRITT {kase.phaseIndex} VON 6 · {kase.phaseLabel.toUpperCase()}
            </Eyebrow>
          </span>
          <Eyebrow className="whitespace-nowrap">
            SEIT {kase.since} · {kase.daysRunning} TAGE
          </Eyebrow>
        </div>

        {/* Everything below is folded. The right-hand summary is the whole
            reason that's tolerable — it has to carry the gist by itself. */}
        <motion.div variants={listVariants} initial="initial" animate="animate">
          <Fold
            title="Eckdaten"
            summary={summarise(kase)}
            badge={gaps > 0 ? `${gaps} LÜCKE` : undefined}
          >
            <div className="flex items-center justify-between pb-xs">
              <Eyebrow>AUS ANFRAGE UND AUFNAHME</Eyebrow>
              <Eyebrow>HERKUNFT</Eyebrow>
            </div>
            <dl>
              {kase.facts.map((f) => (
                <div
                  key={f.label}
                  className="grid grid-cols-[200px_1fr_auto] items-baseline gap-md border-t border-border-subtle py-sm"
                >
                  <dt className="text-base text-fg-muted">{f.label}</dt>
                  <dd className="text-base text-fg">{f.value}</dd>
                  <dd className="label-caps flex items-center gap-[5px] text-right">
                    {f.flag ? (
                      <span className="text-feedback-error">{f.flag}</span>
                    ) : (
                      <>
                        <span className="text-fg-subtle">{f.source}</span>
                        {f.linked && (
                          <span className="text-border-strong">
                            <ChevronRightIcon size={12} />
                          </span>
                        )}
                      </>
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </Fold>

          <Fold title="Förderung und Auftrag" summary={kase.program}>
            <dl className="grid grid-cols-3 gap-lg">
              <Meta label="FÖRDERUNG" value={kase.program} />
              <Meta label="BEAUFTRAGT" value={kase.commissioned} />
              <Meta label="REGELSTAND · GEPINNT" value={kase.ruleVersion} />
            </dl>
          </Fold>

          {kase.inquiryQuote && (
            <Fold
              title="Aus der Anfrage"
              summary={kase.inquiryQuote.text}
              badge={kase.inquiryQuote.date}
            >
              <div className="flex gap-md">
                <span className="w-[2px] shrink-0 self-stretch bg-border-strong" />
                <p className="max-w-[680px] text-md leading-[28px] text-fg">
                  {kase.inquiryQuote.text}
                </p>
              </div>
            </Fold>
          )}
        </motion.div>
      </section>

      <aside className="scroll-quiet flex w-[400px] shrink-0 flex-col overflow-y-auto px-lg pt-[20px] pb-lg">
        <Documents kase={kase} />

        {openQuestion && (
          <div className="pt-xl">
            <div className="flex items-center justify-between pb-xs">
              <Eyebrow>OFFENE FRAGE</Eyebrow>
              <Eyebrow tone="error">SEIT {openQuestion.age.replace('seit ', '').toUpperCase()}</Eyebrow>
            </div>
            <p className="pb-xs text-md leading-[26px] text-fg">„{openQuestion.question}"</p>
            <Link
              to="/ensera/fragen"
              className="label-caps flex items-center gap-[6px] text-fg-muted transition-colors hover:text-fg"
            >
              <Dot state="brand" size={5} />
              {openQuestion.draft ? 'ENTWURF LIEGT ZUR FREIGABE BEREIT' : 'WARTET AUF SIE'}
            </Link>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...transition.slow, delay: 0.16 }}
          className="mt-auto rounded-xl border border-border bg-surface p-lg
                     shadow-[0_1px_3px_rgba(18,22,27,0.06)]"
        >
          <Eyebrow className="pb-xs">NÄCHSTER SCHRITT</Eyebrow>
          <p className="pb-xs font-display text-lg font-semibold tracking-tight">
            {kase.nextStep.when}
          </p>
          <p className="pb-md text-base leading-[22px] text-fg-muted">{kase.nextStep.text}</p>
          <Link to="/bereich" className="block">
            <Button variant="primary" className="w-full">
              Ansicht der Kundschaft
            </Button>
          </Link>
        </motion.div>
      </aside>
    </div>
  )
}

/** The one line a closed „Eckdaten" has to earn its place with. */
function summarise(kase: Case): string {
  const value = (label: string) => kase.facts.find((f) => f.label === label)?.value
  return [value('Gebäudetyp'), value('Baujahr') && `Baujahr ${value('Baujahr')}`, value('Wohnfläche')]
    .filter(Boolean)
    .join(' · ')
}

/**
 * A collapsed section. Closed it is one line: what's inside, and enough of the
 * content to judge whether it needs opening. There is no „mehr anzeigen" here —
 * the whole row is the target.
 */
function Fold({
  title,
  summary,
  badge,
  children,
}: {
  title: string
  /** Rendered on one truncated line while closed. */
  summary: string
  /** A short count or date, right-aligned — „1 LÜCKE", „21.07." */
  badge?: string
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)

  return (
    <motion.div variants={rowVariants} layout className="border-b border-border first:border-t">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="group grid w-full grid-cols-[190px_1fr_auto_16px] items-center gap-md py-md text-left"
      >
        <span className="text-md font-medium text-fg">{title}</span>
        <span
          className={`min-w-0 truncate text-base transition-colors ${
            open ? 'text-fg-subtle' : 'text-fg-muted'
          }`}
        >
          {summary}
        </span>
        <span className={`label-caps ${badge?.includes('LÜCKE') ? 'text-feedback-error' : 'text-fg-subtle'}`}>
          {badge}
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={transition.base}
          className="flex justify-end text-border-strong transition-colors group-hover:text-fg-muted"
        >
          <ChevronDownIcon size={14} />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={transition.base}
            className="overflow-hidden"
          >
            <div className="pb-lg">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/**
 * Closed, the list shows only what is missing — the rows she can act on. The
 * six that arrived and were read need no attention, so they wait behind
 * „Alle neun anzeigen".
 */
function Documents({ kase }: { kase: Case }) {
  const [all, setAll] = useState(false)

  const arrived = kase.documents.filter((d) => d.state !== 'fehlt').length
  const missing = kase.documents.length - arrived
  const shown = all ? kase.documents : kase.documents.filter((d) => d.state === 'fehlt')

  return (
    <>
      <div className="flex items-center justify-between pb-sm">
        <Eyebrow>UNTERLAGEN</Eyebrow>
        <span className="flex items-center gap-sm">
          <Meter total={kase.documents.length} filled={arrived} failed={missing} />
          <Eyebrow tone="muted">
            {arrived} VON {kase.documents.length}
          </Eyebrow>
        </span>
      </div>

      <motion.ul layout variants={listVariants} initial="initial" animate="animate">
        <AnimatePresence initial={false}>
          {shown.map((d) => (
            <DocRow key={d.id} doc={d} />
          ))}
        </AnimatePresence>
      </motion.ul>

      {missing > 0 && !all && (
        <p className="pt-sm text-sm text-fg-muted">
          {arrived} weitere sind da und ausgelesen.
        </p>
      )}

      <button
        type="button"
        onClick={() => setAll((a) => !a)}
        className="label-caps flex items-center gap-[6px] pt-sm text-fg-subtle transition-colors hover:text-fg"
      >
        {all ? 'NUR OFFENE ZEIGEN' : `ALLE ${kase.documents.length} ANZEIGEN`}
        <motion.span animate={{ rotate: all ? 180 : 0 }} transition={transition.base}>
          <ChevronDownIcon size={12} />
        </motion.span>
      </button>
    </>
  )
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-[6px]">
      <Eyebrow>{label}</Eyebrow>
      <span className="text-md text-fg">{value}</span>
    </div>
  )
}

function DocRow({ doc }: { doc: CaseDocument }) {
  return (
    <motion.li
      variants={rowVariants}
      layout
      exit={{ opacity: 0, height: 0, transition: transition.exit }}
      className="flex items-center gap-sm overflow-hidden border-b border-border-subtle py-[10px]"
    >
      <span className="flex size-[14px] shrink-0 items-center justify-center">
        {doc.state === 'gelesen' && (
          <span className="text-fg">
            <CheckIcon size={13} strokeWidth={1.6} />
          </span>
        )}
        {doc.state === 'laeuft' && <Dot state="laeuft" size={7} />}
        {doc.state === 'fehlt' && <Dot state="fehlt" size={7} />}
      </span>
      <span className="min-w-0 flex-1 truncate text-base text-fg">{doc.label}</span>
      <span
        className={`label-caps shrink-0 ${
          doc.state === 'fehlt'
            ? 'text-feedback-error'
            : doc.state === 'laeuft'
              ? 'text-brand'
              : 'text-fg-subtle'
        }`}
      >
        {doc.state === 'fehlt' ? 'FEHLT' : doc.state === 'laeuft' ? 'LÄUFT' : doc.arrived}
      </span>
    </motion.li>
  )
}
