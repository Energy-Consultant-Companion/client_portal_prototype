import { useState } from 'react'
import { motion } from 'motion/react'
import { useDemo, seed } from '@/store/demo'
import { arrivalVariants, listVariants, rowVariants, transition } from '@/motion/tokens'
import { Button, Dot, Eyebrow, FilterTabs, Rule } from '@/components/primitives'
import { ChevronRightIcon } from '@/icons'
import type { Message } from '@/store/types'

/*
 * Postfach — everything that went out in her name.
 *
 * This is the accountability screen: the agent writes to her clients, so she
 * needs to see exactly what they received and whether it arrived. Nothing here
 * is editable, and the footer says so.
 */
export function Outbox() {
  const messages = useDemo((s) => s.messages)
  const [filter, setFilter] = useState('woche')

  const rows = messages.filter((m) => {
    if (filter === 'ensera') return m.author === 'ensera'
    if (filter === 'sie') return m.author === 'katrin'
    if (filter === 'problem') return m.delivery === 'unzustellbar'
    return true
  })

  // The filters count the whole week, not just the eight rows on screen —
  // so they start from the design's totals and grow with the demo.
  const extra = Math.max(0, messages.length - seed.messages.length)
  const extraFromEnsera = messages
    .slice(0, extra)
    .filter((m) => m.author === 'ensera').length
  const counts = {
    week: seed.baseline.outboxWeek + extra,
    ensera: seed.baseline.outboxFromEnsera + extraFromEnsera,
    sie: seed.baseline.outboxFromHer + (extra - extraFromEnsera),
    problem: messages.filter((m) => m.delivery === 'unzustellbar').length,
  }

  return (
    <div className="flex h-screen flex-col">
      <div className="scroll-quiet flex-1 overflow-y-auto px-2xl pt-[20px]">
        <header className="flex items-start justify-between gap-lg pb-lg">
          <div className="flex flex-col gap-xs">
            <h1 className="font-display text-2xl font-semibold tracking-tight">
              Was rausgegangen ist
            </h1>
            <p className="text-base text-fg-muted">
              Jede Nachricht, die Ihre Kundschaft in Ihrem Namen bekommen hat — von ENSERA oder von
              Ihnen.
            </p>
          </div>
          <Button variant="secondary">Protokoll exportieren</Button>
        </header>

        <div className="flex items-center justify-between pb-lg">
          <FilterTabs
            name="outbox"
            value={filter}
            onChange={setFilter}
            options={[
              { id: 'woche', label: 'Diese Woche', count: String(counts.week) },
              { id: 'ensera', label: 'Von ENSERA', count: String(counts.ensera), dot: 'brand' },
              { id: 'sie', label: 'Von Ihnen', count: String(counts.sie), dot: 'fg' },
              {
                id: 'problem',
                label: 'Nicht angekommen',
                count: String(counts.problem),
                danger: true,
              },
            ]}
          />
          <Eyebrow>NEUESTE ZUERST</Eyebrow>
        </div>

        <div className="grid grid-cols-[230px_1fr_130px_120px_130px_16px] items-center gap-md pb-sm">
          <Eyebrow>AN WEN</Eyebrow>
          <Eyebrow>WORUM ES GING</Eyebrow>
          <Eyebrow>GESCHRIEBEN VON</Eyebrow>
          <Eyebrow className="text-right">RAUS</Eyebrow>
          <Eyebrow className="text-right">ANGEKOMMEN</Eyebrow>
          <span />
        </div>
        <Rule />

        <motion.div variants={listVariants} initial="initial" animate="animate">
          {rows.map((m) => (
            <Row key={m.id} message={m} />
          ))}
        </motion.div>
      </div>

      <motion.footer
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...transition.slow, delay: 0.1 }}
        className="flex shrink-0 items-center gap-xl bg-surface-inverse px-2xl py-xl"
      >
        <div className="flex flex-1 flex-col gap-xs">
          <Eyebrow tone="inverse">PROTOKOLL · UNVERÄNDERLICH</Eyebrow>
          <p className="max-w-[620px] text-base leading-[24px] text-fg-inverse">
            Jede Nachricht liegt im Volltext beim Fall, mit Absender, Zeitpunkt und Zustellung.
            Nichts davon lässt sich nachträglich ändern — auch nicht von mir.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-sm">
          <button
            type="button"
            className="rounded-full border border-border-inverse-strong px-lg py-[11px] text-base
                       text-fg-inverse transition-colors hover:bg-surface-inverse-active"
          >
            Nicht zustellbar klären
          </button>
          <button
            type="button"
            className="rounded-full bg-surface px-lg py-[11px] text-base font-medium text-fg
                       transition-colors hover:bg-fg-inverse-muted"
          >
            Als PDF exportieren
          </button>
        </div>
      </motion.footer>
    </div>
  )
}

function Row({ message: m }: { message: Message }) {
  const undeliverable = m.delivery === 'unzustellbar'
  const unopened = m.delivery === 'ungeoeffnet'

  return (
    <motion.button
      type="button"
      layout
      variants={m.isNew ? arrivalVariants : rowVariants}
      className="group grid w-full grid-cols-[230px_1fr_130px_120px_130px_16px] items-center gap-md
                 border-b border-border-subtle py-sm text-left transition-colors hover:bg-surface-sunken"
    >
      <span className="flex min-w-0 items-start gap-sm">
        {/* Only the agent's messages get a marker. Hers are the default case,
            and „nicht zustellbar" already speaks for itself on the right. */}
        <span className="mt-[7px] w-[5px] shrink-0">
          {m.author === 'ensera' && <Dot state="brand" size={5} />}
        </span>
        <span className="flex min-w-0 flex-col gap-[2px]">
          <span className="truncate text-base font-medium leading-[20px] text-fg">{m.recipient}</span>
          <span className="truncate text-sm text-fg-muted">{m.recipientDetail}</span>
        </span>
      </span>

      <span className="min-w-0 truncate text-base text-fg">{m.subject}</span>

      <span className={`label-caps ${m.author === 'ensera' ? 'text-brand' : 'text-fg'}`}>
        {m.author === 'ensera' ? 'ENSERA' : 'KATRIN HELD'}
      </span>

      <span className="numeric-mono text-right text-sm text-fg-muted">{m.sent}</span>

      <span
        className={`numeric-mono text-right text-sm ${
          undeliverable ? 'text-feedback-error' : unopened ? 'text-fg-subtle' : 'text-fg-muted'
        }`}
      >
        {m.deliveryLabel}
      </span>

      <span className="text-border-strong transition-colors group-hover:text-fg-muted">
        <ChevronRightIcon size={14} />
      </span>
    </motion.button>
  )
}
