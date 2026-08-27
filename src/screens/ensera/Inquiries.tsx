import { AnimatePresence, motion } from 'motion/react'
import { useDemo } from '@/store/demo'
import { listVariants, rowVariants, transition } from '@/motion/tokens'
import { Button, Dot, Eyebrow } from '@/components/primitives'
import { Orb } from '@/components/chrome/Orb'
import { CheckIcon, EnvelopeIcon } from '@/icons'
import type { Inquiry } from '@/store/types'

/*
 * Anfragen — the consultant's front door.
 *
 * Three panels: her rail, the queue, and the one inquiry she's reading. The
 * pre-check against her six rules is what makes the decision quick, so it gets
 * the visual weight; the accept button is the only brand-coloured thing here.
 */
export function Inquiries() {
  const inquiries = useDemo((s) => s.inquiries)
  const selectedId = useDemo((s) => s.selectedInquiryId)
  const select = useDemo((s) => s.selectInquiry)

  const selected = inquiries.find((i) => i.id === selectedId) ?? inquiries[0]
  // Split rather than sort: „was habe ich schon entschieden" is the question
  // the queue gets asked most, and a heading answers it faster than a badge.
  const waiting = inquiries.filter((i) => i.state === 'neu')
  const decided = inquiries.filter((i) => i.state !== 'neu')

  return (
    <div className="flex h-screen">
      <section className="flex w-[400px] shrink-0 flex-col border-r border-border px-[20px] pt-[20px] pb-lg">
        <header className="flex items-baseline justify-between pb-lg">
          <h1 className="font-display text-xl font-semibold tracking-tight">Anfragen</h1>
          <Eyebrow>
            {waiting.length} OFFEN · {decided.length} ENTSCHIEDEN
          </Eyebrow>
        </header>

        <motion.div
          variants={listVariants}
          initial="initial"
          animate="animate"
          className="scroll-quiet -mx-[4px] flex flex-1 flex-col overflow-y-auto px-[4px]"
        >
          <AnimatePresence initial={false}>
            {waiting.length > 0 && (
              <GroupLabel key="h-offen">WARTET AUF SIE · {waiting.length}</GroupLabel>
            )}
            {waiting.map((inquiry) => (
              <InquiryRow
                key={inquiry.id}
                inquiry={inquiry}
                active={inquiry.id === selected?.id}
                onSelect={() => select(inquiry.id)}
              />
            ))}

            {decided.length > 0 && (
              <GroupLabel key="h-entschieden">ENTSCHIEDEN · {decided.length}</GroupLabel>
            )}
            {decided.map((inquiry) => (
              <InquiryRow
                key={inquiry.id}
                inquiry={inquiry}
                active={inquiry.id === selected?.id}
                onSelect={() => select(inquiry.id)}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      </section>

      {selected && <InquiryDetail inquiry={selected} />}
    </div>
  )
}

/** A heading inside the queue. Sticky, so it stays true while scrolling. */
function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      layout
      className="sticky top-0 z-10 -mx-[4px] bg-surface px-[4px] pt-md pb-xs first:pt-0"
    >
      <Eyebrow>{children}</Eyebrow>
    </motion.div>
  )
}

function InquiryRow({
  inquiry,
  active,
  onSelect,
}: {
  inquiry: Inquiry
  active: boolean
  onSelect: () => void
}) {
  const decided = inquiry.state !== 'neu'
  const accepted = inquiry.state === 'angenommen'
  const tagTone =
    inquiry.tagState === 'neu'
      ? 'text-fg-muted'
      : inquiry.tagState === 'ausserhalb'
        ? 'text-feedback-error'
        : 'text-fg-subtle'

  return (
    <motion.button
      layout
      type="button"
      onClick={onSelect}
      variants={inquiry.isNew ? undefined : rowVariants}
      initial={inquiry.isNew ? { opacity: 0, y: -10 } : undefined}
      animate={inquiry.isNew ? { opacity: 1, y: 0 } : undefined}
      transition={transition.emphasis}
      className={`relative flex flex-col gap-xs px-md py-md text-left transition-colors ${
        active ? '' : 'border-b border-border-subtle hover:bg-surface-sunken'
      }`}
    >
      {active && (
        <motion.span
          layoutId="inquiry-active"
          transition={transition.base}
          className="absolute inset-0 rounded-lg border border-border bg-surface
                     shadow-[0_1px_3px_rgba(18,22,27,0.07)]"
        />
      )}
      {/* A decided row keeps a spine in the margin — accepted reads as brand,
          the other two outcomes stay quiet. It survives the active fill because
          the fill sits behind it. */}
      {decided && (
        <span
          className={`absolute inset-y-[10px] left-0 w-[3px] rounded-full ${
            accepted ? 'bg-brand' : 'bg-border-strong'
          }`}
        />
      )}
      <span className="relative flex items-baseline justify-between gap-sm">
        <span className="flex min-w-0 items-baseline gap-sm">
          <span
            className={`truncate text-base leading-[18px] ${active ? 'font-medium text-fg' : 'text-fg'}`}
          >
            {inquiry.name}
          </span>
          {decided && <RowBadge state={inquiry.state} />}
        </span>
        <span className="label-caps shrink-0 text-fg-subtle">
          {inquiry.listDate}
          {inquiry.listTime && <span className="text-fg-muted"> · {inquiry.listTime}</span>}
        </span>
      </span>
      <span className="relative text-base leading-[22px] text-fg-muted">{inquiry.summary}</span>
      <span className={`label-caps relative flex items-center gap-xs ${tagTone}`}>
        {inquiry.tagState === 'erledigt' ? (
          <CheckIcon size={11} strokeWidth={1.8} />
        ) : (
          <Dot state={inquiry.tagState === 'ausserhalb' ? 'fehlt' : 'brand'} size={5} />
        )}
        {inquiry.tag}
      </span>
    </motion.button>
  )
}

/** The outcome, said in one word next to the name. */
function RowBadge({ state }: { state: Inquiry['state'] }) {
  if (state === 'neu') return null
  const styles = {
    angenommen: 'bg-brand-surface text-brand',
    abgelehnt: 'bg-surface-sunken text-fg-muted',
    nachgefragt: 'bg-surface-sunken text-fg-muted',
  }
  const labels = {
    angenommen: 'ANGENOMMEN',
    abgelehnt: 'ABGESAGT',
    nachgefragt: 'NACHGEFRAGT',
  }
  return (
    <span className={`label-caps shrink-0 rounded-xs px-[5px] py-[3px] ${styles[state]}`}>
      {labels[state]}
    </span>
  )
}

function InquiryDetail({ inquiry }: { inquiry: Inquiry }) {
  const accept = useDemo((s) => s.acceptInquiry)
  const decline = useDemo((s) => s.declineInquiry)
  const followUp = useDemo((s) => s.followUpInquiry)

  const clear = inquiry.rules.filter((r) => r.state === 'erfuellt').length
  const open = inquiry.rules.filter((r) => r.state === 'offen').length
  const broken = inquiry.rules.filter((r) => r.state === 'verletzt').length
  const decided = inquiry.state !== 'neu'

  // Two columns of three, filled down then across — as in the design.
  const left = inquiry.rules.slice(0, 3)
  const right = inquiry.rules.slice(3)

  return (
    <motion.section
      key={inquiry.id}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={transition.base}
      className="scroll-quiet flex min-w-0 flex-1 flex-col overflow-y-auto px-2xl pt-[20px] pb-xl"
    >
      <header className="flex items-start justify-between gap-lg border-b border-border pb-lg">
        <div className="flex flex-col gap-[6px]">
          <h2 className="font-display text-2xl font-semibold tracking-tight">{inquiry.name}</h2>
          <p className="text-sm text-fg-muted">
            {inquiry.location} · über Ihre Website · {inquiry.arrived}
          </p>
        </div>
        <StateBadge inquiry={inquiry} />
      </header>

      <div className="grid grid-cols-3 gap-lg border-b border-border py-lg">
        <Fact label="GEBÄUDE" value={inquiry.buildingType} />
        <Fact label="VORHABEN" value={inquiry.intent} />
        <Fact label="ZEITRAUM" value={inquiry.timeframe} />
      </div>

      <blockquote className="flex gap-lg py-lg">
        <span className="w-[2px] shrink-0 self-stretch bg-border-strong" />
        <p className="text-md leading-[30px] text-fg">{inquiry.quote}</p>
      </blockquote>

      {/* The pre-check. Six rules, always all six, so a gap reads as a gap. */}
      <div className="rounded-xl bg-surface-sunken px-lg py-[22px]">
        <div className="flex items-center justify-between pb-[14px]">
          <div className="flex items-center gap-[11px]">
            <Orb size={22} />
            <Eyebrow tone="fg">GEGEN IHRE SECHS REGELN GEPRÜFT</Eyebrow>
          </div>
          <Eyebrow tone="muted">
            {broken > 0 && `${broken} VERLETZT · `}
            {clear} KLAR{open > 0 && ` · ${open} OFFEN`}
          </Eyebrow>
        </div>

        <div className="flex gap-lg border-t border-border pt-[14px]">
          <div className="flex w-[330px] shrink-0 flex-col gap-[9px]">
            {left.map((r) => (
              <RuleRow key={r.label} {...r} />
            ))}
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-[9px]">
            {right.map((r) => (
              <RuleRow key={r.label} {...r} />
            ))}
          </div>
        </div>

        {inquiry.suggestion && (
          <div className="mt-md flex items-start gap-[11px] border-t border-border pt-md">
            <span className="mt-[7px] size-[6px] shrink-0 rounded-full bg-brand" />
            <p className="flex-1 text-[14px] leading-[22px] text-fg-muted">{inquiry.suggestion}</p>
          </div>
        )}
      </div>

      <div className="mt-auto pt-2xl">
        {decided ? (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={transition.base}
            className="flex items-center gap-sm rounded-lg border border-border bg-surface-sunken px-lg py-md"
          >
            <CheckIcon size={14} />
            <span className="text-base text-fg">
              {inquiry.state === 'angenommen' && `Angenommen. Der Zugang ist an ${inquiry.email} raus.`}
              {inquiry.state === 'abgelehnt' && 'Abgesagt, mit der Empfehlung eines Kollegen.'}
              {inquiry.state === 'nachgefragt' && 'Rückfrage ist raus. Die Anfrage bleibt offen.'}
            </span>
          </motion.div>
        ) : (
          <>
            <div className="flex items-center gap-sm">
              <Button variant="primary" onClick={() => accept(inquiry.id)}>
                Annehmen und Zugang senden
              </Button>
              <Button variant="secondary" onClick={() => followUp(inquiry.id)}>
                Erst nachfragen
              </Button>
              <span className="flex-1" />
              <Button variant="quiet" onClick={() => decline(inquiry.id)}>
                Absagen
              </Button>
            </div>
            <div className="flex items-start gap-[11px] pt-lg">
              <span className="mt-[3px] shrink-0 text-fg-subtle">
                <EnvelopeIcon size={14} />
              </span>
              <p className="max-w-[680px] text-[14px] leading-[22px] text-fg-muted">
                Beim Annehmen geht der Zugangslink automatisch an {inquiry.email} — mit Ihrem Namen
                als Absender. Sie sehen die Mail vorher und können sie ändern.
              </p>
            </div>
          </>
        )}
      </div>
    </motion.section>
  )
}

function StateBadge({ inquiry }: { inquiry: Inquiry }) {
  if (inquiry.state === 'neu') {
    return (
      <span className="label-caps shrink-0 rounded-xs bg-surface-sunken px-[7px] py-[5px] text-fg-muted">
        NEU
      </span>
    )
  }
  const labels = {
    angenommen: 'ANGENOMMEN',
    abgelehnt: 'ABGESAGT',
    nachgefragt: 'NACHGEFRAGT',
    neu: 'NEU',
  }
  return (
    <span className="label-caps shrink-0 rounded-xs bg-brand-surface px-[7px] py-[5px] text-brand">
      {labels[inquiry.state]}
    </span>
  )
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-xs">
      <Eyebrow>{label}</Eyebrow>
      <span className="text-md text-fg">{value}</span>
    </div>
  )
}

function RuleRow({ label, state }: { label: string; state: 'erfuellt' | 'offen' | 'verletzt' }) {
  return (
    <div className="flex items-center gap-[11px]">
      <span className="flex size-[13px] shrink-0 items-center justify-center">
        {state === 'erfuellt' && (
          <span className="text-fg">
            <CheckIcon size={13} strokeWidth={1.6} />
          </span>
        )}
        {state === 'offen' && <span className="size-[7px] rounded-full border border-border-strong" />}
        {state === 'verletzt' && (
          <span className="text-feedback-error">
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path
                d="M3.5 3.5l7 7M10.5 3.5l-7 7"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </span>
        )}
      </span>
      <span
        className={`flex-1 text-[14px] leading-[18px] ${
          state === 'erfuellt' ? 'text-fg-muted' : state === 'verletzt' ? 'text-feedback-error' : 'text-fg'
        }`}
      >
        {label}
      </span>
    </div>
  )
}
