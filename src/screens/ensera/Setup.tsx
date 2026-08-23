import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, Reorder, useDragControls } from 'motion/react'
import { useDemo, seed } from '@/store/demo'
import { transition } from '@/motion/tokens'
import { Button, Eyebrow, OwnerTag, Rule } from '@/components/primitives'
import { Orb } from '@/components/chrome/Orb'
import { CaretIcon, ChevronDownIcon, DragHandleIcon, PlusIcon, TrashIcon } from '@/icons'
import type { Owner, WorkflowStep, WorkflowTemplate } from '@/store/types'

/*
 * Einrichtung — where the whole system gets its behaviour.
 *
 * The two right-hand columns are the honest part: for every step, what the
 * client is told and what the agent does unasked. Nobody has to guess what
 * happens in their name — and because that is a promise, all of it is editable
 * here rather than baked in.
 *
 * Steps reorder by dragging the handle, or with the arrows that appear on hover
 * so it also works from the keyboard.
 */

const COLS = 'grid-cols-[24px_24px_222px_124px_88px_1fr_218px_24px]'

export function Setup() {
  const templates = useDemo((s) => s.templates)
  const activeId = useDemo((s) => s.selectedTemplateId)
  const select = useDemo((s) => s.selectTemplate)
  const reorder = useDemo((s) => s.reorderSteps)
  const addStep = useDemo((s) => s.addStep)
  const activate = useDemo((s) => s.activateTemplate)
  const regenerate = useDemo((s) => s.regenerateTemplate)
  const createTemplate = useDemo((s) => s.createTemplate)

  const [naming, setNaming] = useState(false)
  const [newName, setNewName] = useState('')

  const template = templates.find((t) => t.id === activeId) ?? templates[0]

  return (
    <div className="scroll-quiet h-screen overflow-y-auto px-2xl pt-[20px] pb-2xl">
      <header className="flex flex-col gap-sm pb-lg">
        <Eyebrow>EINRICHTUNG · ABLAUFVORLAGEN</Eyebrow>
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Einmal festlegen, wie ein Fall bei Ihnen läuft.
        </h1>
        <p className="max-w-[660px] text-base leading-[24px] text-fg-muted">
          Jede Vorlage bestimmt drei Dinge: welche Schritte es gibt, wer bei jedem Schritt dran ist,
          und was Ihre Kundschaft davon zu sehen bekommt.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-xs pb-lg">
        {templates.map((t) => (
          <TemplateTab
            key={t.id}
            template={t}
            selected={t.id === template.id}
            onSelect={() => select(t.id)}
          />
        ))}

        <AnimatePresence mode="wait" initial={false}>
          {naming ? (
            <motion.form
              key="naming"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={transition.fast}
              onSubmit={(e) => {
                e.preventDefault()
                createTemplate(newName)
                setNewName('')
                setNaming(false)
              }}
              className="overflow-hidden"
            >
              <input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onBlur={() => {
                  if (!newName.trim()) setNaming(false)
                }}
                onKeyDown={(e) => e.key === 'Escape' && setNaming(false)}
                placeholder="Name der Vorlage"
                className="h-[34px] w-[220px] rounded-full border border-brand bg-surface px-[14px]
                           text-[14px] placeholder:text-fg-subtle focus:outline-none"
              />
            </motion.form>
          ) : (
            <motion.button
              key="add"
              type="button"
              onClick={() => setNaming(true)}
              whileTap={{ scale: 0.98 }}
              transition={transition.fast}
              className="inline-flex h-[34px] shrink-0 items-center gap-[6px] rounded-full border border-border
                         px-[14px] text-[14px] text-fg-muted transition-colors hover:bg-surface-sunken hover:text-fg"
            >
              <PlusIcon size={13} />
              Neue Vorlage
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* The agent explaining where the template came from — and that it is inert. */}
      <motion.div
        key={template.id}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={transition.base}
        className="flex items-center gap-lg rounded-xl bg-surface-inverse px-lg py-lg"
      >
        <Orb size={40} />
        <div className="flex min-w-0 flex-1 flex-col gap-xs">
          <Eyebrow tone="inverse">
            {template.draft ? 'ENTWURF' : 'AUS DEM REGELWERK ERZEUGT'} · {template.ruleVersion}
          </Eyebrow>
          <p className="max-w-[660px] text-base leading-[24px] text-fg-inverse">
            {template.derivedFrom}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-sm">
          <button
            type="button"
            onClick={() => regenerate(template.id)}
            className="rounded-full border border-border-inverse-strong px-md py-[10px] text-base
                       text-fg-inverse transition-colors hover:bg-surface-inverse-active"
          >
            Neu erzeugen
          </button>
          <button
            type="button"
            className="rounded-full bg-surface px-md py-[10px] text-base font-medium text-fg
                       transition-colors hover:bg-fg-inverse-muted"
          >
            Änderungen ansehen
          </button>
        </div>
      </motion.div>

      <div className={`grid ${COLS} items-center gap-sm pt-xl pb-sm`}>
        <span />
        <span />
        <Eyebrow>SCHRITT</Eyebrow>
        <Eyebrow>WER IST DRAN</Eyebrow>
        <Eyebrow>DAUER</Eyebrow>
        <Eyebrow>WAS DIE KUNDSCHAFT SIEHT</Eyebrow>
        <Eyebrow>WAS ENSERA TUT</Eyebrow>
        <span />
      </div>
      <Rule />

      <Reorder.Group
        axis="y"
        values={template.steps}
        onReorder={(steps) => reorder(template.id, steps as WorkflowStep[])}
        as="div"
      >
        {template.steps.map((step, i) => (
          <StepRow
            key={step.id}
            template={template}
            step={step}
            index={i}
            total={template.steps.length}
          />
        ))}
      </Reorder.Group>

      <div className="flex items-start justify-between gap-2xl pt-xl">
        <div className="flex shrink-0 items-center gap-sm">
          <Button variant="primary" onClick={() => activate(template.id)}>
            {template.draft ? 'Vorlage aktivieren' : 'Änderungen speichern'}
          </Button>
          <Button variant="secondary" onClick={() => addStep(template.id)}>
            Schritt hinzufügen
          </Button>
        </div>
        <p className="max-w-[420px] text-right text-[14px] leading-[22px] text-fg-muted">
          Gilt für neue Fälle.{' '}
          {template.caseCount
            ? `Die ${numberWord(template.caseCount)} laufenden Fälle behalten ihre Version — Regeln werden beim Antrag festgeschrieben, nicht rückwirkend geändert.`
            : 'Auf dieser Vorlage läuft noch kein Fall.'}
        </p>
      </div>
    </div>
  )
}

function TemplateTab({
  template,
  selected,
  onSelect,
}: {
  template: WorkflowTemplate
  selected: boolean
  onSelect: () => void
}) {
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      whileTap={{ scale: 0.98 }}
      transition={transition.fast}
      className={`relative inline-flex h-[34px] shrink-0 items-center gap-xs rounded-full px-[14px]
        text-[14px] transition-colors ${
          selected
            ? 'font-medium text-fg-inverse'
            : template.draft
              ? 'border border-dashed border-border-strong text-fg-subtle hover:text-fg-muted'
              : 'border border-border text-fg-muted hover:bg-surface-sunken hover:text-fg'
        }`}
    >
      {selected && (
        <motion.span
          layoutId="template-tab"
          transition={transition.base}
          className="absolute inset-0 rounded-full bg-fg"
        />
      )}
      <span className="relative">
        {template.label}
        {template.draft && ' · Entwurf'}
      </span>
      {/* Drafts carry no cases, so they carry no count — a „0" would invite the
          question of what happened to them. */}
      {template.caseCount > 0 && (
        <span
          className={`label-caps relative ${selected ? 'text-fg-inverse-muted' : 'text-fg-subtle'}`}
        >
          {template.caseCount}
          {selected && ' FÄLLE'}
        </span>
      )}
    </motion.button>
  )
}

function StepRow({
  template,
  step,
  index,
  total,
}: {
  template: WorkflowTemplate
  step: WorkflowStep
  index: number
  total: number
}) {
  const reorder = useDemo((s) => s.reorderSteps)
  const update = useDemo((s) => s.updateStep)
  const remove = useDemo((s) => s.removeStep)
  const controls = useDragControls()

  /** Nudge by one place — the keyboard-reachable equivalent of dragging. */
  function move(delta: number) {
    const to = index + delta
    if (to < 0 || to >= total) return
    const next = [...template.steps]
    const [moved] = next.splice(index, 1)
    next.splice(to, 0, moved)
    reorder(template.id, next)
  }

  return (
    <Reorder.Item
      value={step}
      dragListener={false}
      dragControls={controls}
      as="div"
      layout
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      transition={transition.base}
      whileDrag={{
        // Lifted off the page while held, so it reads as a thing being moved
        // rather than a row that happens to be highlighted.
        boxShadow: '0 12px 28px rgba(18,22,27,0.14)',
        backgroundColor: 'var(--color-surface)',
        zIndex: 10,
        position: 'relative',
      }}
      data-step-row
      data-step-title={step.title}
      className={`group grid ${COLS} items-center gap-sm border-b border-border-subtle py-[10px]`}
    >
      <span className="flex flex-col items-center">
        <button
          type="button"
          onPointerDown={(e) => controls.start(e)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowUp') {
              e.preventDefault()
              move(-1)
            }
            if (e.key === 'ArrowDown') {
              e.preventDefault()
              move(1)
            }
          }}
          aria-label={`${step.title} verschieben`}
          title="Ziehen, oder mit ↑ ↓ verschieben"
          className="cursor-grab touch-none text-border-strong transition-colors
                     group-hover:text-fg-subtle active:cursor-grabbing"
        >
          <DragHandleIcon size={14} />
        </button>
      </span>

      <span className="relative flex items-center">
        <span className="numeric-mono text-sm text-fg-subtle transition-opacity group-hover:opacity-0">
          {String(index + 1).padStart(2, '0')}
        </span>
        {/* On hover the index makes way for the two nudge buttons. */}
        <span className="absolute -left-[2px] flex flex-col opacity-0 transition-opacity group-hover:opacity-100">
          <button
            type="button"
            onClick={() => move(-1)}
            disabled={index === 0}
            aria-label="Nach oben"
            className="text-fg-subtle transition-colors hover:text-fg disabled:opacity-25"
          >
            <CaretIcon up size={13} />
          </button>
          <button
            type="button"
            onClick={() => move(1)}
            disabled={index === total - 1}
            aria-label="Nach unten"
            className="text-fg-subtle transition-colors hover:text-fg disabled:opacity-25"
          >
            <CaretIcon size={13} />
          </button>
        </span>
      </span>

      <InlineText
        value={step.title}
        onChange={(v) => update(template.id, step.id, { title: v })}
        className="text-md font-medium leading-[22px] text-fg"
        label="Schritt"
      />

      <OwnerSelect
        owner={step.owner}
        onChange={(owner) => update(template.id, step.id, { owner })}
      />

      <InlineText
        value={step.duration}
        onChange={(v) => update(template.id, step.id, { duration: v })}
        className="text-base text-fg-muted"
        label="Dauer"
      />

      {/* Quoted, because the client reads this string verbatim. */}
      <InlineText
        value={step.clientSees}
        onChange={(v) => update(template.id, step.id, { clientSees: v })}
        className="text-base leading-[22px] text-fg-muted"
        label="Was die Kundschaft sieht"
        quoted
      />

      <InlineText
        value={step.enseraDoes}
        onChange={(v) => update(template.id, step.id, { enseraDoes: v })}
        className="text-base leading-[22px] text-fg-muted"
        label="Was ENSERA tut"
      />

      <button
        type="button"
        onClick={() => remove(template.id, step.id)}
        aria-label={`${step.title} entfernen`}
        title="Schritt entfernen"
        className="flex size-7 items-center justify-center rounded-md text-border-strong opacity-0
                   transition-all group-hover:opacity-100 hover:bg-feedback-error-surface
                   hover:text-feedback-error"
      >
        <TrashIcon size={13} />
      </button>
    </Reorder.Item>
  )
}

/**
 * Click-to-edit text that looks exactly like the surrounding copy until focused.
 * The table is the design; an input on every cell would turn it into a form.
 */
function InlineText({
  value,
  onChange,
  className,
  label,
  quoted,
}: {
  value: string
  onChange: (v: string) => void
  className: string
  label: string
  quoted?: boolean
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => setDraft(value), [value])
  useEffect(() => {
    if (editing) ref.current?.select()
  }, [editing])

  function commit() {
    setEditing(false)
    const next = draft.trim()
    if (next && next !== value) onChange(next)
    else setDraft(value)
  }

  if (editing) {
    return (
      <input
        ref={ref}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit()
          if (e.key === 'Escape') {
            setDraft(value)
            setEditing(false)
          }
        }}
        aria-label={label}
        className={`${className} -mx-[6px] w-[calc(100%+12px)] rounded-xs bg-surface px-[5px]
                    outline-2 outline-brand`}
      />
    )
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      title={`${label} bearbeiten`}
      className={`${className} -mx-[6px] rounded-xs px-[5px] text-left transition-colors
                  hover:bg-[rgba(18,22,27,0.04)]`}
    >
      {quoted ? `„${value}"` : value}
    </button>
  )
}

/** The „Wer ist dran" dropdown. Four owners, the design's order. */
function OwnerSelect({ owner, onChange }: { owner: Owner; onChange: (o: Owner) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onDown(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    window.addEventListener('mousedown', onDown)
    return () => window.removeEventListener('mousedown', onDown)
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="inline-flex items-center gap-[6px] rounded-xs border border-border px-xs py-[5px]
                   transition-colors hover:bg-surface-sunken"
      >
        <OwnerTag owner={owner} />
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={transition.fast}
          className="text-fg-subtle"
        >
          <ChevronDownIcon size={11} />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="listbox"
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98, transition: transition.exit }}
            transition={transition.fast}
            className="absolute top-[calc(100%+4px)] left-0 z-20 w-[164px] overflow-hidden rounded-md
                       border border-border bg-surface py-[4px] shadow-[0_12px_28px_rgba(18,22,27,0.16)]"
          >
            {seed.ownerOptions.map((o) => (
              <button
                key={o}
                type="button"
                role="option"
                aria-selected={o === owner}
                onClick={() => {
                  onChange(o)
                  setOpen(false)
                }}
                className={`flex w-full items-center gap-xs px-sm py-[6px] text-left transition-colors ${
                  o === owner ? 'bg-surface-sunken' : 'hover:bg-surface-sunken'
                }`}
              >
                <OwnerTag owner={o} />
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function numberWord(n: number): string {
  return ['null', 'einen', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun'][n] ?? String(n)
}
