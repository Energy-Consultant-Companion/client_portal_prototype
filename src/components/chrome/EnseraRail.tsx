import { NavLink, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { useRailCounts, seed } from '@/store/demo'
import { springPill, transition } from '@/motion/tokens'
import { CountBadge, Eyebrow } from '@/components/primitives'
import { Orb } from './Orb'
import {
  BubbleIcon,
  CalendarIcon,
  ChevronUpDownIcon,
  CompassIcon,
  EnvelopeIcon,
  HelpIcon,
  InboxIcon,
  PanelIcon,
  PeopleIcon,
  SettingsIcon,
} from '@/icons'

/*
 * The 264px rail every consultant screen sits in. It persists across route
 * changes, so its badge counts are the one place a presenter can watch the
 * client's actions land without navigating anywhere.
 */

const nav = [
  { to: '/ensera/anfragen', label: 'Anfragen', icon: InboxIcon, key: 'anfragen' },
  { to: '/ensera/kundschaft', label: 'Kundschaft', icon: PeopleIcon, key: 'kundschaft' },
  { to: '/ensera/kalender', label: 'Kalender', icon: CalendarIcon, key: 'kalender' },
  { to: '/ensera/postfach', label: 'Postfach', icon: EnvelopeIcon, key: 'postfach' },
  { to: '/ensera/fragen', label: 'Fragen', icon: BubbleIcon, key: 'fragen' },
] as const

/** Counts that mean "needs you" get the brand badge; the rest stay quiet. */
const urgent = new Set(['anfragen', 'fragen'])

export function EnseraRail() {
  const counts = useRailCounts()
  const { pathname } = useLocation()

  return (
    <aside className="flex w-[264px] shrink-0 flex-col border-r border-border bg-surface-sunken px-md pt-[20px] pb-md">
      <div className="flex items-center justify-between px-xs pb-[18px]">
        <span className="font-display text-base font-semibold tracking-tight text-fg">ENSERA</span>
        <span className="text-fg-subtle">
          <PanelIcon />
        </span>
      </div>

      {/* Search doubles as the agent's front door — hence the orb, not a magnifier. */}
      <button
        type="button"
        className="flex h-[38px] shrink-0 items-center gap-[10px] rounded-md border border-border bg-surface
                   px-[10px] shadow-[0_1px_2px_rgba(18,22,27,0.06)] transition-colors hover:border-border-strong"
      >
        <Orb size={22} />
        <span className="flex-1 text-left text-sm text-fg-subtle">Suchen oder fragen</span>
        <span className="numeric-mono text-2xs text-fg-subtle">⌘K</span>
      </button>

      <nav className="flex flex-col gap-[2px] pt-[26px]">
        <div className="px-xs pb-[10px]">
          <Eyebrow>KONTAKT</Eyebrow>
        </div>
        {nav.map(({ to, label, icon: Icon, key }) => {
          const count = counts[key]
          const active = pathname.startsWith(to)
          return (
            // data-count is the settled value; the badge itself animates and so
            // briefly holds two numbers at once.
            <NavLink key={to} to={to} data-count={count} className="relative">
              <span
                className={`relative flex h-9 shrink-0 items-center gap-sm rounded-md px-[10px] transition-colors ${
                  active ? '' : 'hover:bg-[rgba(18,22,27,0.035)]'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="rail-active"
                    transition={springPill}
                    className="absolute inset-0 rounded-md border border-border bg-surface
                               shadow-[0_1px_2px_rgba(18,22,27,0.06)]"
                  />
                )}
                <span className={`relative ${active ? 'text-brand' : 'text-fg-muted'}`}>
                  <Icon />
                </span>
                <span
                  className={`relative flex-1 text-[14px] leading-[18px] ${
                    active ? 'font-medium text-fg' : 'text-fg-muted'
                  }`}
                >
                  {label}
                </span>
                <span className="relative">
                  <AnimatedCount value={count} urgent={urgent.has(key) && count > 0} />
                </span>
              </span>
            </NavLink>
          )
        })}
      </nav>

      <div className="mt-auto flex items-center gap-[6px] px-[4px]">
        <RailTool icon={BubbleIcon} label="Verlauf" />
        <RailTool icon={HelpIcon} label="Hilfe" />
        <RailTool icon={SettingsIcon} label="Einrichtung" to="/ensera/einrichtung" />
        <RailTool icon={CompassIcon} label="Neu" />
      </div>

      <div
        className="mt-[14px] flex h-[52px] shrink-0 items-center gap-[11px] rounded-lg border border-border
                   bg-surface px-sm shadow-[0_1px_2px_rgba(18,22,27,0.06)]"
      >
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-fg">
          <span className="text-2xs font-semibold text-fg-inverse">{seed.consultant.initials}</span>
        </span>
        <span className="flex flex-1 flex-col gap-px">
          <span className="text-sm font-medium leading-4 text-fg">{seed.consultant.name}</span>
          <span className="label-caps text-[10px] leading-3 text-fg-subtle">
            {seed.consultant.registry}
          </span>
        </span>
        <span className="text-fg-subtle">
          <ChevronUpDownIcon />
        </span>
      </div>
    </aside>
  )
}

function RailTool({
  icon: Icon,
  label,
  to,
}: {
  icon: typeof HelpIcon
  label: string
  to?: string
}) {
  const { pathname } = useLocation()
  const active = to ? pathname.startsWith(to) : false
  const content = (
    <span
      title={label}
      className={`flex size-8 shrink-0 items-center justify-center rounded-md transition-colors ${
        active ? 'bg-brand-surface text-brand' : 'text-fg-subtle hover:bg-[rgba(18,22,27,0.05)] hover:text-fg-muted'
      }`}
    >
      <Icon size={15} />
    </span>
  )
  return to ? (
    <NavLink to={to} aria-label={label}>
      {content}
    </NavLink>
  ) : (
    <button type="button" aria-label={label}>
      {content}
    </button>
  )
}

/**
 * A badge that draws attention to itself when the number changes — that is the
 * moment the client's action becomes visible on this side.
 */
function AnimatedCount({ value, urgent }: { value: number; urgent: boolean }) {
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.span
        key={value}
        initial={{ opacity: 0, y: -6, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 6, scale: 0.9, position: 'absolute' }}
        transition={transition.base}
        className="block"
      >
        <CountBadge value={value} tone={urgent ? 'brand' : 'quiet'} />
      </motion.span>
    </AnimatePresence>
  )
}
