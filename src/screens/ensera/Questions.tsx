import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useDemo, useOpenQuestions, seed } from '@/store/demo'
import { listVariants, rowVariants, transition } from '@/motion/tokens'
import { Button, Dot, Eyebrow, Meter, TextArea } from '@/components/primitives'
import { Orb } from '@/components/chrome/Orb'
import { useCalmMotion } from '@/motion/useReducedMotion'
import { DocumentIcon, ChevronRightIcon, QuestionMarkIcon, ShieldIcon } from '@/icons'
import type { Question } from '@/store/types'

/*
 * Fragen — the escalation queue.
 *
 * The interesting part isn't the draft, it's the line above it: why the system
 * refused to answer. That refusal is the product's promise, so it sits at the
 * top of the panel, before she reads a word of the proposed reply.
 */
export function Questions() {
  const questions = useDemo((s) => s.questions)
  const open = useOpenQuestions()
  const selectedId = useDemo((s) => s.selectedQuestionId)
  const select = useDemo((s) => s.selectQuestion)
  const clients = useDemo((s) => s.clients)

  const selected = questions.find((q) => q.id === selectedId && q.author === 'offen') ?? open[0]

  return (
    <div className="flex h-screen">
      <section className="flex w-[380px] shrink-0 flex-col border-r border-border px-[20px] pt-[20px]">
        <header className="flex items-baseline justify-between pb-lg">
          <h1 className="font-display text-xl font-semibold tracking-tight">Fragen an Sie</h1>
          <Eyebrow>{open.length} OFFEN</Eyebrow>
        </header>

        <motion.div
          variants={listVariants}
          initial="initial"
          animate="animate"
          className="scroll-quiet -mx-[4px] flex flex-1 flex-col overflow-y-auto px-[4px]"
        >
          <AnimatePresence initial={false}>
            {open.map((q) => (
              <motion.button
                key={q.id}
                layout
                type="button"
                variants={rowVariants}
                exit={{ opacity: 0, height: 0, marginBottom: 0, transition: transition.exit }}
                onClick={() => select(q.id)}
                className={`relative flex flex-col gap-xs overflow-hidden px-md py-md text-left transition-colors ${
                  q.id === selected?.id ? '' : 'border-b border-border-subtle hover:bg-surface-sunken'
                }`}
              >
                {q.id === selected?.id && (
                  <motion.span
                    layoutId="question-active"
                    transition={transition.base}
                    className="absolute inset-0 rounded-lg border border-border bg-surface
                               shadow-[0_1px_3px_rgba(18,22,27,0.07)]"
                  />
                )}
                <span className="relative flex items-baseline justify-between gap-sm">
                  <span className="text-base leading-[18px] text-fg">
                    {clients.find((c) => c.id === q.caseId)?.name ?? q.caseId}
                  </span>
                  <span className="label-caps shrink-0 text-fg-subtle">{q.age.toUpperCase()}</span>
                </span>
                <span className="relative text-base leading-[22px] text-fg-muted">{q.question}</span>
                <span className="label-caps relative flex items-center gap-xs text-feedback-error">
                  <Dot state="fehlt" size={5} />
                  {q.escalationTag}
                </span>
              </motion.button>
            ))}
          </AnimatePresence>

          {open.length === 0 && (
            <div className="flex flex-1 flex-col items-center justify-center gap-sm px-md text-center">
              <Orb size={32} />
              <p className="text-base text-fg-muted">
                Nichts liegt bei Ihnen. Alles Weitere hat ENSERA aus dem Fall beantwortet.
              </p>
            </div>
          )}
        </motion.div>

        <footer className="border-t border-border py-lg">
          <div className="flex items-center justify-between pb-xs">
            <span className="label-caps flex items-center gap-xs text-brand">
              <Dot state="brand" size={5} />
              HEUTE OHNE SIE BEANTWORTET
            </span>
            <span className="numeric-mono text-sm text-fg-muted">{seed.answeredWithoutHer}</span>
          </div>
          <p className="text-sm leading-[21px] text-fg-muted">
            Termine, Fristen, fehlende Unterlagen, Begriffe. Alles aus dem, was im Fall liegt.
          </p>
        </footer>
      </section>

      {selected ? <QuestionDetail question={selected} /> : <EmptyDetail />}
    </div>
  )
}

function EmptyDetail() {
  return (
    <section className="flex flex-1 flex-col items-center justify-center gap-md px-2xl text-center">
      <h2 className="font-display text-xl font-semibold tracking-tight">Keine Frage offen.</h2>
      <p className="max-w-[420px] text-base text-fg-muted">
        Sobald etwas kommt, das ENSERA nicht aus den Unterlagen belegen kann, liegt es hier — mit
        einem Entwurf, den Sie freigeben oder überschreiben.
      </p>
    </section>
  )
}

function QuestionDetail({ question }: { question: Question }) {
  const release = useDemo((s) => s.releaseAnswer)
  const clients = useDemo((s) => s.clients)
  const cases = useDemo((s) => s.cases)
  const [editing, setEditing] = useState(false)
  const [body, setBody] = useState('')

  const draft = question.draft
  const client = clients.find((c) => c.id === question.caseId)
  const kase = cases[question.caseId]

  // Reset the editor whenever she moves to a different question.
  useEffect(() => {
    setEditing(false)
    setBody(draft?.paragraphs.join('\n\n') ?? '')
  }, [question.id, draft])

  if (!draft) return <EmptyDetail />

  return (
    <motion.section
      key={question.id}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={transition.base}
      className="scroll-quiet relative flex min-w-0 flex-1 flex-col overflow-y-auto px-[40px] pt-[20px]"
    >
      <header className="flex items-baseline justify-between gap-lg pb-xs">
        <Eyebrow>
          {(client?.name ?? '').toUpperCase()} · {client?.address.toUpperCase()} ·{' '}
          {(kase?.program ?? client?.program ?? '').toUpperCase()}
        </Eyebrow>
        <Eyebrow>{question.asked.toUpperCase()}</Eyebrow>
      </header>
      <h1 className="max-w-[820px] pb-md font-display text-xl font-semibold tracking-tight leading-[32px]">
        {question.question}
      </h1>

      {/* Why it landed here at all. */}
      <div className="flex items-start gap-sm rounded-lg bg-surface-sunken px-lg py-md">
        <span className="mt-[2px] shrink-0 text-fg-subtle">
          <QuestionMarkIcon size={14} />
        </span>
        <div className="flex flex-col gap-[6px]">
          <Eyebrow>WARUM ICH DAS NICHT SELBST BEANTWORTET HABE</Eyebrow>
          <p className="max-w-[700px] text-base leading-[24px] text-fg">{question.escalationReason}</p>
        </div>
      </div>

      {/* The draft. Written in her name, so it is presented as a letter. */}
      <div className="mt-md rounded-xl border border-border bg-surface shadow-[0_1px_3px_rgba(18,22,27,0.06)]">
        <div className="flex items-center justify-between border-b border-border px-lg py-sm">
          <span className="flex items-center gap-[11px]">
            <Orb size={22} />
            <Eyebrow tone="fg">ENTWURF VON ENSERA · IN IHREM NAMEN</Eyebrow>
          </span>
          <span className="flex items-center gap-sm">
            <Eyebrow>BELEGLAGE</Eyebrow>
            <Meter total={3} filled={draft.evidence} width={12} height={4} gap={3} />
          </span>
        </div>

        <div className="px-lg py-lg">
          {editing ? (
            <TextArea value={body} onChange={setBody} rows={9} />
          ) : (
            <DraftBody draft={draft} />
          )}
        </div>

        {draft.citations.length > 0 && (
          <div className="border-t border-border px-lg py-md">
            <Eyebrow className="pb-xs">BELEGE {draft.citations.length}</Eyebrow>
            {draft.citations.map((c) => (
              <button
                key={c.label}
                type="button"
                className="group flex w-full items-center gap-sm border-b border-border-subtle py-sm last:border-0"
              >
                <span className="shrink-0 text-fg-subtle">
                  {c.kind === 'regel' ? <ShieldIcon size={14} /> : <DocumentIcon size={14} />}
                </span>
                <span className="flex-1 text-left text-base text-fg">{c.label}</span>
                <span className="label-caps shrink-0 text-fg-subtle">{c.locator}</span>
                <span className="shrink-0 text-border-strong transition-colors group-hover:text-fg-muted">
                  <ChevronRightIcon size={12} />
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Sticky, so a long draft never pushes her decision below the fold. */}
      <div className="sticky bottom-0 mt-auto flex items-center gap-xs border-t border-border bg-surface py-lg">
        <Button
          variant="dark"
          onClick={() =>
            release(
              question.id,
              editing ? body.split(/\n{2,}/).filter(Boolean) : undefined,
            )
          }
        >
          {editing ? 'Geänderte Antwort senden' : 'Freigeben und senden'}
        </Button>
        <Button variant="secondary" onClick={() => setEditing((e) => !e)}>
          {editing ? 'Entwurf zurücksetzen' : 'Bearbeiten'}
        </Button>
        <Button
          variant="quiet"
          onClick={() => {
            setEditing(true)
            setBody('')
          }}
        >
          Selbst schreiben
        </Button>
        <span className="flex-1" />
        <span className="label-caps w-[196px] shrink-0 text-right leading-[16px] text-fg-subtle">
          GEHT ALS IHRE NACHRICHT RAUS MIT IHRER EEE-NUMMER IM FUSS
        </span>
      </div>
    </motion.section>
  )
}

/**
 * The draft reveals line by line the first time it's shown. It is generated
 * text and reading it carefully is the point — a blur-in that resolves top to
 * bottom encourages that, where an instant paste-in invites skimming.
 */
function DraftBody({ draft }: { draft: NonNullable<Question['draft']> }) {
  const calm = useCalmMotion()
  const lines = [draft.greeting, ...draft.paragraphs, draft.signoff, draft.signature]

  return (
    <div className="flex max-w-[700px] flex-col gap-md">
      {lines.map((line, i) => (
        <motion.p
          key={`${line}-${i}`}
          initial={calm ? { opacity: 0 } : { opacity: 0, filter: 'blur(4px)', y: 4 }}
          animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
          transition={{ ...transition.slow, delay: calm ? 0 : i * 0.09 }}
          className={`text-md leading-[28px] text-fg ${
            i === lines.length - 1 ? 'mt-[-8px]' : ''
          }`}
        >
          {line}
        </motion.p>
      ))}
    </div>
  )
}
