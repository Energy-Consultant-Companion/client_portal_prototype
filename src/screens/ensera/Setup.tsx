import { useState } from 'react'
import { motion } from 'motion/react'
import { seed } from '@/store/demo'
import { listVariants, rowVariants, transition } from '@/motion/tokens'
import { Button, Eyebrow, Rule } from '@/components/primitives'
import { Orb } from '@/components/chrome/Orb'
import { ChevronDownIcon, DragHandleIcon } from '@/icons'

/*
 * Einrichtung — where the whole system gets its behaviour.
 *
 * The two right-hand columns are the honest part: for every step, what the
 * client is told and what the agent does unasked. Nobody has to guess what
 * happens in their name.
 */
export function Setup() {
  const [active, setActive] = useState('ebw')

  return (
    <div className="scroll-quiet h-screen overflow-y-auto px-2xl pt-[20px] pb-xl">
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
        {seed.workflowTemplates.map((t) => {
          const selected = t.id === active
          return (
            <motion.button
              key={t.id}
              type="button"
              onClick={() => setActive(t.id)}
              whileTap={{ scale: 0.98 }}
              transition={transition.fast}
              className={`relative inline-flex h-[34px] shrink-0 items-center gap-xs rounded-full px-[14px]
                text-[14px] transition-colors ${
                  selected
                    ? 'bg-fg font-medium text-fg-inverse'
                    : t.draft
                      ? 'border border-dashed border-border-strong text-fg-subtle hover:text-fg-muted'
                      : 'border border-border text-fg-muted hover:bg-surface-sunken hover:text-fg'
                }`}
            >
              {t.label}
              {t.count && (
                <span
                  className={`label-caps ${selected ? 'text-fg-inverse-muted' : 'text-fg-subtle'}`}
                >
                  {t.count}
                </span>
              )}
            </motion.button>
          )
        })}
        <button
          type="button"
          className="inline-flex h-[34px] shrink-0 items-center rounded-full border border-border px-[14px]
                     text-[14px] text-fg-muted transition-colors hover:bg-surface-sunken hover:text-fg"
        >
          + Neue Vorlage
        </button>
      </div>

      {/* The agent explaining where the template came from — and that it is inert. */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={transition.base}
        className="flex items-center gap-lg rounded-xl bg-surface-inverse px-lg py-lg"
      >
        <Orb size={40} />
        <div className="flex min-w-0 flex-1 flex-col gap-xs">
          <Eyebrow tone="inverse">AUS DEM REGELWERK ERZEUGT · BAFA EBW, STAND 2026-01</Eyebrow>
          <p className="max-w-[660px] text-base leading-[24px] text-fg-inverse">
            Ich habe sechs Schritte, neun Unterlagen und drei Fristen aus dem Programm abgeleitet.
            Prüfen Sie es — nichts davon läuft, bevor Sie die Vorlage aktivieren.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-sm">
          <button
            type="button"
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

      <div className="grid grid-cols-[24px_28px_206px_120px_92px_1fr_236px] items-center gap-md pt-xl pb-sm">
        <span />
        <span />
        <Eyebrow>SCHRITT</Eyebrow>
        <Eyebrow>WER IST DRAN</Eyebrow>
        <Eyebrow>DAUER</Eyebrow>
        <Eyebrow>WAS DIE KUNDSCHAFT SIEHT</Eyebrow>
        <Eyebrow>WAS ENSERA TUT</Eyebrow>
      </div>
      <Rule />

      <motion.div variants={listVariants} initial="initial" animate="animate">
        {seed.workflowSteps.map((s) => (
          <motion.div
            key={s.index}
            variants={rowVariants}
            className="group grid grid-cols-[24px_28px_206px_120px_92px_1fr_236px] items-center gap-md
                       border-b border-border-subtle py-sm"
          >
            <span className="cursor-grab text-border-strong transition-colors group-hover:text-fg-subtle">
              <DragHandleIcon size={14} />
            </span>
            <span className="numeric-mono text-sm text-fg-subtle">{s.index}</span>
            <span className="text-md font-medium leading-[22px] text-fg">{s.step}</span>
            <span>
              <button
                type="button"
                className="inline-flex items-center gap-[6px] rounded-xs border border-border px-xs py-[5px]
                           transition-colors hover:bg-surface-sunken"
              >
                <span className="label-caps text-fg-muted">{s.owner}</span>
                <span className="text-fg-subtle">
                  <ChevronDownIcon size={11} />
                </span>
              </button>
            </span>
            <span className="text-base text-fg-muted">{s.duration}</span>
            <span className="text-base leading-[22px] text-fg-muted">{s.clientSees}</span>
            <span className="text-base leading-[22px] text-fg-muted">{s.enseraDoes}</span>
          </motion.div>
        ))}
      </motion.div>

      <div className="flex items-start justify-between gap-2xl pt-xl">
        <div className="flex shrink-0 items-center gap-sm">
          <Button variant="dark">Vorlage aktivieren</Button>
          <Button variant="secondary">Schritt hinzufügen</Button>
        </div>
        <p className="max-w-[420px] text-right text-[14px] leading-[22px] text-fg-muted">
          Gilt für neue Fälle. Die acht laufenden Fälle behalten ihre Version — Regeln werden beim
          Antrag festgeschrieben, nicht rückwirkend geändert.
        </p>
      </div>
    </div>
  )
}
