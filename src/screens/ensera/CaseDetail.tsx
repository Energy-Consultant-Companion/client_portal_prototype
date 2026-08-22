import { Link, useParams } from 'react-router-dom'
import { motion } from 'motion/react'
import { useDemo } from '@/store/demo'
import { listVariants, rowVariants, transition } from '@/motion/tokens'
import { Button, Dot, Eyebrow, Segments } from '@/components/primitives'
import { CheckIcon, ChevronRightIcon } from '@/icons'
import type { CaseDocument } from '@/store/types'

/*
 * Der Fall — one client, everything known about them.
 *
 * The left column is deliberately a provenance table rather than a form: every
 * value carries where it came from, so she can tell at a glance which numbers
 * she can trust and which one is still a client's guess.
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

  const arrived = kase.documents.filter((d) => d.state !== 'fehlt').length
  const openQuestion = questions.find((q) => q.caseId === id && q.author === 'offen')

  return (
    <div className="flex h-screen">
      <section className="scroll-quiet min-w-0 flex-1 overflow-y-auto border-r border-border px-2xl pt-[20px] pb-xl">
        <Eyebrow className="pb-sm">KUNDSCHAFT · {kase.clientName.toUpperCase()}</Eyebrow>
        <h1 className="pb-md font-display text-2xl font-semibold tracking-tight">
          {kase.address}, {kase.city}
        </h1>

        <div className="flex items-center justify-between pb-lg">
          <Segments total={6} current={kase.phaseIndex} width={112} />
        </div>
        <div className="flex items-center justify-between pb-lg">
          <Eyebrow tone="brand">
            {kase.phaseLabel.toUpperCase()} · SCHRITT {kase.phaseIndex} VON 6
          </Eyebrow>
          <Eyebrow>
            SEIT {kase.since} · {kase.daysRunning} TAGE
          </Eyebrow>
        </div>

        <div className="grid grid-cols-3 gap-lg border-y border-border py-lg">
          <Meta label="FÖRDERUNG" value={kase.program} />
          <Meta label="BEAUFTRAGT" value={kase.commissioned} />
          <Meta label="REGELSTAND · GEPINNT" value={kase.ruleVersion} />
        </div>

        <div className="flex items-center justify-between pt-xl pb-sm">
          <Eyebrow>AUS ANFRAGE UND AUFNAHME</Eyebrow>
          <Eyebrow>HERKUNFT</Eyebrow>
        </div>

        <motion.dl variants={listVariants} initial="initial" animate="animate">
          {kase.facts.map((f) => (
            <motion.div
              key={f.label}
              variants={rowVariants}
              className="grid grid-cols-[200px_1fr_auto] items-baseline gap-md border-b border-border-subtle py-sm"
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
            </motion.div>
          ))}
        </motion.dl>

        {kase.inquiryQuote && (
          <div className="mt-xl flex gap-md">
            <span className="w-[2px] shrink-0 self-stretch bg-border-strong" />
            <div className="flex flex-col gap-xs">
              <Eyebrow>WAS SIE IN DER ANFRAGE GESCHRIEBEN HABEN · {kase.inquiryQuote.date}</Eyebrow>
              <p className="max-w-[680px] text-md leading-[28px] text-fg">{kase.inquiryQuote.text}</p>
            </div>
          </div>
        )}
      </section>

      <aside className="scroll-quiet flex w-[400px] shrink-0 flex-col overflow-y-auto px-lg pt-[20px] pb-lg">
        <div className="flex items-center justify-between pb-sm">
          <Eyebrow>UNTERLAGEN</Eyebrow>
          <Eyebrow tone="muted">
            {arrived} VON {kase.documents.length}
          </Eyebrow>
        </div>

        <motion.ul variants={listVariants} initial="initial" animate="animate">
          {kase.documents.map((d) => (
            <DocRow key={d.id} doc={d} />
          ))}
        </motion.ul>

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
      className="flex items-center gap-sm border-b border-border-subtle py-[10px]"
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
