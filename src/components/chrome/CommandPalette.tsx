import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { useDemo } from '@/store/demo'
import {
  askPractice,
  kindLabels,
  kindOrder,
  looksLikeQuestion,
  search,
  type PracticeAnswer,
  type SearchResult,
} from '@/store/search'
import { transition } from '@/motion/tokens'
import { useCalmMotion } from '@/motion/useReducedMotion'
import { Eyebrow } from '@/components/primitives'
import { Orb } from './Orb'
import { ArrowRightIcon, CheckIcon } from '@/icons'

/*
 * „Suchen oder fragen" — the one input in the rail, doing two jobs.
 *
 * The design gives it the agent orb rather than a magnifying glass, which is the
 * whole brief: typing a name searches, typing a question gets answered. The
 * switch happens on the shape of the input, and the header says which mode
 * you're in so it never feels like a guess.
 */
export function CommandPalette() {
  const open = useDemo((s) => s.paletteOpen)
  const setOpen = useDemo((s) => s.setPaletteOpen)

  // ⌘K from anywhere on the consultant side; Escape closes.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen(!useDemo.getState().paletteOpen)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setOpen])

  return (
    <AnimatePresence>
      {open && <PaletteBody onClose={() => setOpen(false)} />}
    </AnimatePresence>
  )
}

function PaletteBody({ onClose }: { onClose: () => void }) {
  const state = useDemo()
  const navigate = useNavigate()
  const calm = useCalmMotion()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [cursor, setCursor] = useState(0)
  const [answer, setAnswer] = useState<PracticeAnswer | null>(null)

  const asking = looksLikeQuestion(query)
  const results = useMemo(() => (asking ? [] : search(state, query)), [state, query, asking])

  // Flat list drives keyboard navigation; groups are only a rendering concern.
  const grouped = useMemo(() => {
    const byKind = new Map<SearchResult['kind'], SearchResult[]>()
    for (const r of results) {
      const list = byKind.get(r.kind) ?? []
      list.push(r)
      byKind.set(r.kind, list)
    }
    return kindOrder.filter((k) => byKind.has(k)).map((k) => [k, byKind.get(k)!] as const)
  }, [results])
  const flat = useMemo(() => grouped.flatMap(([, rs]) => rs), [grouped])

  useEffect(() => inputRef.current?.focus(), [])
  useEffect(() => setCursor(0), [query])

  function commit(r: SearchResult) {
    navigate(r.to)
    onClose()
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setCursor((c) => Math.min(c + 1, flat.length - 1))
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setCursor((c) => Math.max(c - 1, 0))
    }
    if (e.key === 'Enter') {
      e.preventDefault()
      if (asking) setAnswer(askPractice(state, query))
      else if (flat[cursor]) commit(flat[cursor])
    }
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={transition.fast}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-[rgba(11,13,16,0.28)]"
      />

      <motion.div
        role="dialog"
        aria-label="Suchen oder fragen"
        initial={calm ? { opacity: 0 } : { opacity: 0, y: -12, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={calm ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.99, transition: transition.exit }}
        transition={transition.base}
        className="fixed top-[88px] left-1/2 z-50 flex w-[680px] -translate-x-1/2 flex-col
                   overflow-hidden rounded-xl border border-border bg-surface
                   shadow-[0_24px_64px_rgba(18,22,27,0.22)]"
      >
        <div className="flex items-center gap-sm border-b border-border px-lg py-md">
          <Orb size={24} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setAnswer(null)
            }}
            onKeyDown={onKeyDown}
            placeholder="Suchen oder fragen …"
            className="h-7 flex-1 bg-transparent text-md text-fg placeholder:text-fg-subtle focus:outline-none"
          />
          <Eyebrow tone={asking ? 'brand' : 'subtle'}>{asking ? 'FRAGE' : 'SUCHE'}</Eyebrow>
        </div>

        <div className="scroll-quiet max-h-[440px] overflow-y-auto">
          {asking ? (
            <AskPane
              query={query}
              answer={answer}
              onAsk={() => setAnswer(askPractice(state, query))}
              onGo={(to) => {
                navigate(to)
                onClose()
              }}
            />
          ) : flat.length === 0 ? (
            <p className="px-lg py-xl text-base text-fg-muted">
              Nichts gefunden. Stellen Sie eine Frage — etwa „Was ist heute überfällig?" — dann
              antworte ich aus Ihren Fällen.
            </p>
          ) : (
            grouped.map(([kind, rows]) => (
              <div key={kind} className="border-b border-border-subtle last:border-0">
                <div className="px-lg pt-sm pb-xs">
                  <Eyebrow>{kindLabels[kind]}</Eyebrow>
                </div>
                {rows.map((r) => {
                  const index = flat.indexOf(r)
                  const active = index === cursor
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onMouseEnter={() => setCursor(index)}
                      onClick={() => commit(r)}
                      className={`flex w-full items-center gap-sm px-lg py-[10px] text-left transition-colors ${
                        active ? 'bg-surface-sunken' : ''
                      }`}
                    >
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate text-base text-fg">{r.title}</span>
                        <span className="truncate text-sm text-fg-muted">{r.detail}</span>
                      </span>
                      {r.meta && (
                        <span
                          className={`label-caps shrink-0 ${
                            r.urgent ? 'text-feedback-error' : 'text-fg-subtle'
                          }`}
                        >
                          {r.meta}
                        </span>
                      )}
                      <span
                        className={`shrink-0 transition-opacity ${active ? 'text-fg-muted opacity-100' : 'opacity-0'}`}
                      >
                        <ArrowRightIcon size={14} />
                      </span>
                    </button>
                  )
                })}
              </div>
            ))
          )}
        </div>

        <div className="flex items-center justify-between border-t border-border bg-surface-sunken px-lg py-xs">
          <Eyebrow>
            {asking ? 'ANTWORTET NUR AUS IHREN FÄLLEN' : 'KUNDSCHAFT · ANFRAGEN · FRISTEN · UNTERLAGEN'}
          </Eyebrow>
          <span className="label-caps flex items-center gap-sm text-fg-subtle">
            <span>↑↓ WÄHLEN</span>
            <span>↵ {asking ? 'FRAGEN' : 'ÖFFNEN'}</span>
            <span>ESC SCHLIESSEN</span>
          </span>
        </div>
      </motion.div>
    </>
  )
}

/** The asking half. Nothing is answered until she presses ↵ — no guessing mid-typing. */
function AskPane({
  query,
  answer,
  onAsk,
  onGo,
}: {
  query: string
  answer: PracticeAnswer | null
  onAsk: () => void
  onGo: (to: string) => void
}) {
  const calm = useCalmMotion()

  if (!answer) {
    return (
      <button
        type="button"
        onClick={onAsk}
        className="flex w-full items-center gap-sm px-lg py-lg text-left transition-colors hover:bg-surface-sunken"
      >
        <span className="flex min-w-0 flex-1 flex-col gap-[2px]">
          <span className="truncate text-base text-fg">„{query}"</span>
          <span className="text-sm text-fg-muted">
            Aus Ihren Fällen beantworten — ohne etwas zu verschicken.
          </span>
        </span>
        <span className="label-caps shrink-0 text-fg-subtle">↵ FRAGEN</span>
      </button>
    )
  }

  return (
    <div className="px-lg py-lg">
      <motion.p
        initial={calm ? { opacity: 0 } : { opacity: 0, filter: 'blur(4px)', y: 4 }}
        animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
        transition={transition.slow}
        className="max-w-[600px] text-md leading-[28px] text-fg"
      >
        {answer.text}
      </motion.p>
      <div className="flex items-center justify-between gap-lg pt-md">
        <span className="label-caps flex items-center gap-xs text-brand">
          <CheckIcon size={12} />
          {answer.provenance}
        </span>
        {answer.action && (
          <button
            type="button"
            onClick={() => onGo(answer.action!.to)}
            className="flex shrink-0 items-center gap-xs rounded-full border border-border-strong px-md py-[7px]
                       text-sm font-medium text-fg transition-colors hover:bg-surface-sunken"
          >
            {answer.action.label}
            <ArrowRightIcon size={13} />
          </button>
        )}
      </div>
    </div>
  )
}
