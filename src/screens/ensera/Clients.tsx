import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { useDemo, seed } from '@/store/demo'
import { listVariants, rowVariants, transition } from '@/motion/tokens'
import { Button, Dot, Eyebrow, FilterTabs, Meter, OwnerTag, Rule } from '@/components/primitives'
import { CountUp } from '@/components/primitives/CountUp'
import { Orb } from '@/components/chrome/Orb'
import { ChevronRightIcon } from '@/icons'

/*
 * Kundschaft — the caseload as one table.
 *
 * Every column answers a question she'd otherwise have to open a case to ask:
 * how far are the documents, is anything asked of me, who is holding this up.
 * The dark bar at the bottom is the agent reporting what it did without her.
 */
export function Clients() {
  const clients = useDemo((s) => s.clients)
  const [filter, setFilter] = useState('alle')

  const summary = seed.caseloadSummary
  const counts = {
    sie: clients.filter((c) => c.owner === 'sie').length,
    kundschaft: clients.filter((c) => c.owner === 'kundschaft').length,
    niemand: clients.filter((c) => c.owner === 'niemand').length,
  }

  const rows = clients.filter((c) => {
    if (filter === 'sie') return c.owner === 'sie'
    if (filter === 'kundschaft') return c.owner === 'kundschaft'
    if (filter === 'niemand') return c.owner === 'niemand'
    return true
  })

  return (
    <div className="flex h-screen flex-col">
      <div className="flex-1 overflow-y-auto scroll-quiet px-2xl pt-[20px]">
        <header className="flex items-start justify-between gap-lg pb-lg">
          <div className="flex flex-col gap-xs">
            <h1 className="font-display text-2xl font-semibold tracking-tight">Kundschaft</h1>
            <p className="text-base text-fg-muted">
              {summary.total} laufende Mandate · {summary.waitingOnHer} warten auf Sie ·{' '}
              {summary.waitingOnClients} warten auf die Kundschaft
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-sm">
            <Button variant="secondary">Zugang verschicken</Button>
            <Button variant="primary">Neues Mandat</Button>
          </div>
        </header>

        <div className="flex items-center justify-between pb-lg">
          <FilterTabs
            name="clients"
            value={filter}
            onChange={setFilter}
            options={[
              { id: 'sie', label: 'Wartet auf Sie', count: String(summary.waitingOnHer || counts.sie) },
              {
                id: 'kundschaft',
                label: 'Wartet auf Kundschaft',
                count: String(summary.waitingOnClients || counts.kundschaft),
              },
              { id: 'niemand', label: 'Läuft ohne uns', count: String(summary.runningAlone || counts.niemand) },
              { id: 'alle', label: 'Alle', count: String(summary.total) },
            ]}
          />
          <Eyebrow>SORTIERT · DRINGLICHKEIT</Eyebrow>
        </div>

        {/* Fixed column widths, so every row's icons and dates share a lane. */}
        <div className="grid grid-cols-[1fr_132px_72px_132px_196px_150px_16px] items-center gap-md pb-sm">
          <Eyebrow>KUNDSCHAFT</Eyebrow>
          <Eyebrow>UNTERLAGEN</Eyebrow>
          <Eyebrow>FRAGEN</Eyebrow>
          <Eyebrow>LETZTER KONTAKT</Eyebrow>
          <Eyebrow>WER IST DRAN</Eyebrow>
          <Eyebrow className="text-right">NÄCHSTE FRIST</Eyebrow>
          <span />
        </div>
        <Rule />

        <motion.div variants={listVariants} initial="initial" animate="animate">
          {rows.map((c) => (
            <motion.div key={c.id} variants={rowVariants} layout>
              <Link
                to={`/ensera/kundschaft/${c.id}`}
                className="group grid grid-cols-[1fr_132px_72px_132px_196px_150px_16px] items-center gap-md
                           border-b border-border-subtle py-md transition-colors hover:bg-surface-sunken"
              >
                <span className="flex min-w-0 flex-col gap-[2px]">
                  <span className="truncate text-md font-medium leading-[22px] text-fg">{c.name}</span>
                  <span className="truncate text-sm text-fg-muted">
                    {c.address} · {shortProgram(c.program)}
                  </span>
                </span>

                {/* No red here: the table reports progress, not blame. Missing
                    documents get the error colour on the case itself. */}
                <span className="flex items-center gap-xs">
                  <Meter total={9} filled={c.docsTotal} width={7} height={12} />
                  <span className="numeric-mono text-sm text-fg-muted">{c.docsTotal}/9</span>
                </span>

                <span className="flex items-center gap-[6px]">
                  {c.openQuestions > 0 ? (
                    <>
                      <Dot state="brand" size={5} />
                      <span className="numeric-mono text-sm text-fg">{c.openQuestions}</span>
                    </>
                  ) : (
                    <span className="text-sm text-fg-subtle">–</span>
                  )}
                </span>

                <span
                  className={`text-sm ${c.lastContactStale ? 'text-feedback-error' : 'text-fg-muted'}`}
                >
                  {c.lastContact}
                </span>

                <OwnerTag owner={c.owner} note={c.ownerNote} />

                <span className="flex flex-col items-end gap-[2px] text-right">
                  <span
                    className={`numeric-mono text-2xs ${
                      c.nextDeadline.overdue ? 'text-feedback-error' : 'text-fg-muted'
                    }`}
                  >
                    {c.nextDeadline.date}
                  </span>
                  <span
                    className={`numeric-mono text-2xs ${
                      c.nextDeadline.overdue ? 'text-feedback-error' : 'text-fg-subtle'
                    }`}
                  >
                    {c.nextDeadline.label}
                  </span>
                </span>

                <span className="text-border-strong transition-colors group-hover:text-fg-muted">
                  <ChevronRightIcon size={14} />
                </span>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <AgentBar />
    </div>
  )
}

/** The table has no room for „BAFA EBW · iSFP", and the variant isn't the point
 *  at this altitude — the programme family is. */
function shortProgram(program: string): string {
  return program.split(' · ')[0]
}

/**
 * What the agent did today on her behalf. Inverse surface because it is a
 * different voice speaking — not her interface, but a report to her.
 */
function AgentBar() {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...transition.slow, delay: 0.1 }}
      className="shrink-0 bg-surface-inverse px-2xl py-xl"
    >
      <div className="flex items-center gap-xl">
        <Orb size={56} />
        <div className="flex min-w-0 flex-1 flex-col gap-md">
          <div className="flex items-center justify-between">
            <Eyebrow tone="inverse">AGENT · AN IHRE KUNDSCHAFT, HEUTE</Eyebrow>
            <span className="label-caps rounded-xs border border-border-inverse-strong px-[7px] py-[4px] text-fg-inverse-muted">
              L2 · ROUTINE SENDEN
            </span>
          </div>
          <div className="h-px w-full bg-border-inverse" />
          <div className="flex items-start gap-xl">
            {seed.caseloadSummary.agentStats.map((stat) => (
              <div key={stat.label} className="flex flex-1 items-start gap-sm">
                <CountUp
                  to={stat.value}
                  className="font-display text-2xl font-semibold tracking-tight text-fg-inverse"
                />
                <span className="max-w-[210px] text-base leading-[22px] text-fg-inverse">
                  {stat.label}
                </span>
              </div>
            ))}
            <Link
              to="/ensera/fragen"
              className="shrink-0 self-center rounded-full bg-surface px-lg py-[11px] text-base
                         font-medium text-fg transition-colors hover:bg-fg-inverse-muted"
            >
              Freigaben öffnen
            </Link>
          </div>
        </div>
      </div>
    </motion.footer>
  )
}
