import { AnimatePresence, motion } from 'motion/react'
import { useDemo } from '@/store/demo'
import { listVariants, rowVariants, transition } from '@/motion/tokens'
import { Button, Dot, Eyebrow, Switch } from '@/components/primitives'
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
  const autoAccept = useDemo((s) => s.autoAccept)
  const setAutoAccept = useDemo((s) => s.setAutoAccept)

  const selected = inquiries.find((i) => i.id === selectedId) ?? inquiries[0]
  const open = inquiries.filter((i) => i.state === 'neu').length
  const done = inquiries.length - open

  return (
    <div className="flex h-screen">
      <section className="flex w-[400px] shrink-0 flex-col border-r border-border px-[20px] pt-[20px]">
        <header className="flex items-baseline justify-between pb-lg">
          <h1 className="font-display text-xl font-semibold tracking-tight">Anfragen</h1>
          <Eyebrow>
            {open} NEU · {done} ERLEDIGT
          </Eyebrow>
        </header>

        <motion.div
          variants={listVariants}
          initial="initial"
          animate="animate"
          className="scroll-quiet -mx-[4px] flex flex-1 flex-col overflow-y-auto px-[4px]"
        >
          <AnimatePresence initial={false}>
            {inquiries.map((inquiry) => (
              <InquiryRow
                key={inquiry.id}
                inquiry={inquiry}
                active={inquiry.id === selected?.id}
                onSelect={() => select(inquiry.id)}
              />
            ))}
          </AnimatePresence>
        </motion.div>

        <footer className="border-t border-border py-lg">
          <div className="flex items-center gap-sm pb-xs">
            <Switch on={autoAccept} onChange={setAutoAccept} />
            <span className="text-base text-fg">Passende Anfragen selbst annehmen</span>
          </div>
          <p className="text-sm leading-[21px] text-fg-muted">
            {autoAccept
              ? 'Ein: erfüllt eine Anfrage alle sechs Regeln, geht der Zugang ohne Sie raus — Sie sehen es im Protokoll.'
              : 'Aus: jede Anfrage geht über Ihren Tisch. Ein: erfüllt eine Anfrage alle sechs Regeln, geht der Zugang ohne Sie raus — Sie sehen es im Protokoll.'}
          </p>
        </footer>
      </section>

      {selected && <InquiryDetail inquiry={selected} />}
    </div>
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
      <span className="relative flex items-baseline justify-between gap-sm">
        <span className={`text-base leading-[18px] ${active ? 'font-medium text-fg' : 'text-fg'}`}>
          {inquiry.name}
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
