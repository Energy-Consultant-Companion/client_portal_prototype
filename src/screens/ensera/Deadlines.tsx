import { motion } from 'motion/react'
import { useDemo, seed } from '@/store/demo'
import { listVariants, rowVariants, transition } from '@/motion/tokens'
import { Button, Dot, Eyebrow, OwnerTag } from '@/components/primitives'
import type { Client, Deadline } from '@/store/types'

/*
 * Fristen — what is actually due.
 *
 * Grouped by how soon rather than by case, because that is the order she works
 * in. „Jetzt" carries buttons; everything further out is deliberately passive,
 * with a status instead of an action, so the page can't nag about four things
 * at once.
 *
 * Rows and the column header share one template, so „WER IST DRAN" sits over
 * the column it names instead of floating at the right edge of the group.
 */
const COLUMNS = 'grid-cols-[148px_1fr_150px_170px]'

export function Deadlines() {
  const deadlines = useDemo((s) => s.deadlines)
  const clients = useDemo((s) => s.clients)
  // Each row is about a person, not an address — so it says who, read from the
  // one place their name is stored.
  const names = Object.fromEntries(clients.map((c: Client) => [c.id, c.name]))
  const buckets = {
    jetzt: deadlines.filter((d) => d.bucket === 'jetzt'),
    woche: deadlines.filter((d) => d.bucket === 'woche'),
    spaeter: deadlines.filter((d) => d.bucket === 'spaeter'),
  }
  // „Jetzt" is what the headline counts — two things are past the point where
  // waiting is a choice, whether or not the date itself has slipped.
  const pressing = buckets.jetzt.length
  const total = Math.max(seed.baseline.deadlines - (seed.deadlines.length - deadlines.length), 0)

  return (
    <div className="flex h-screen flex-col">
      <div className="scroll-quiet flex-1 overflow-y-auto px-2xl pt-[20px] pb-lg">
        <header className="flex items-start justify-between gap-lg pb-md">
          <div className="flex flex-col gap-sm">
            <Eyebrow>FRISTEN · {seed.TODAY.toUpperCase()}</Eyebrow>
            <h1 className="max-w-[760px] font-display text-3xl font-semibold tracking-tight leading-[46px]">
              {headline(pressing, buckets.woche.length)}
            </h1>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-[6px]">
            <Eyebrow>AUS IHREM KALENDER · {seed.NOW}</Eyebrow>
            <Eyebrow>
              {total} FRISTEN · {seed.deadlineSummary.cases} MANDATE
            </Eyebrow>
          </div>
        </header>

        <Group title="JETZT" rows={buckets.jetzt} names={names} showOwnerHeader />
        <Group title="DIESE WOCHE" rows={buckets.woche} names={names} />
        <Group title="SPÄTER" rows={buckets.spaeter} names={names} />

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...transition.slow, delay: 0.2 }}
          className="mt-lg flex items-center gap-md rounded-lg bg-brand-surface px-lg py-md"
        >
          <span className="label-caps flex shrink-0 items-center gap-xs text-brand">
            <Dot state="brand" size={5} />
            OHNE SIE
          </span>
          <p className="flex-1 text-base text-fg">{seed.deadlineFooter.text}</p>
          <button type="button" className="shrink-0 text-base text-fg-muted transition-colors hover:text-fg">
            {seed.deadlineFooter.action}
          </button>
        </motion.div>
      </div>
    </div>
  )
}

function headline(pressing: number, thisWeek: number): string {
  if (pressing === 0) {
    return thisWeek > 0
      ? 'Nichts brennt. Diese Woche steht noch etwas an.'
      : 'Nichts brennt. Sie haben freie Bahn.'
  }
  const word =
    pressing === 1 ? 'Eine Sache ist' : pressing === 2 ? 'Zwei Sachen sind' : `${pressing} Sachen sind`
  return `${word} überfällig. Danach haben Sie bis Freitag Luft.`
}

function Group({
  title,
  rows,
  names,
  showOwnerHeader,
}: {
  title: string
  rows: Deadline[]
  names: Record<string, string>
  showOwnerHeader?: boolean
}) {
  if (!rows.length) return null
  return (
    <section className="pt-md first:pt-0">
      <div className={`grid ${COLUMNS} items-baseline gap-lg pb-xs`}>
        <Eyebrow className="col-span-2">{title}</Eyebrow>
        {showOwnerHeader && <Eyebrow>WER IST DRAN</Eyebrow>}
      </div>
      <div className="h-px w-full bg-border" />
      <motion.div variants={listVariants} initial="initial" animate="animate">
        {rows.map((d) => (
          <Row key={d.id} deadline={d} who={d.caseId ? names[d.caseId] : undefined} />
        ))}
      </motion.div>
    </section>
  )
}

function Row({ deadline: d, who }: { deadline: Deadline; who?: string }) {
  const resolve = useDemo((s) => s.resolveDeadline)
  const subline = [who, d.detail].filter(Boolean).join(' · ')

  return (
    <motion.div
      variants={rowVariants}
      layout
      exit={{ opacity: 0, height: 0, transition: transition.exit }}
      className={`grid ${COLUMNS} items-center gap-lg border-b border-border-subtle py-[13px]`}
    >
      <span className="flex flex-col gap-[2px]">
        <span className={`numeric-mono text-sm ${d.overdue ? 'text-feedback-error' : 'text-fg'}`}>
          {d.when}
        </span>
        {d.qualifier && (
          <span className={`label-caps ${d.overdue ? 'text-feedback-error' : 'text-fg-subtle'}`}>
            {d.qualifier}
          </span>
        )}
      </span>

      <span className="flex min-w-0 flex-col gap-[3px]">
        <span className="text-md font-medium leading-[22px] text-fg">{d.title}</span>
        {subline && (
          <span
            className={`flex items-center gap-[6px] text-sm ${
              d.detailUrgent ? 'text-feedback-error' : 'text-fg-muted'
            }`}
          >
            {d.detailUrgent && <Dot state="fehlt" size={5} />}
            {subline}
          </span>
        )}
      </span>

      <OwnerTag owner={d.owner} />

      <span className="flex justify-end">
        {d.action ? (
          <Button
            variant={d.overdue ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => resolve(d.id)}
          >
            {d.action}
          </Button>
        ) : (
          <span className="text-base text-fg-muted">{d.status}</span>
        )}
      </span>
    </motion.div>
  )
}
