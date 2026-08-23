import { NavLink, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { useDemo, useRailCounts, seed } from '@/store/demo'
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
  SlidersIcon,
} from '@/icons'

/*
 * The rail every consultant screen sits in. It persists across route changes,
 * so its badge counts are the one place a presenter can watch the client's
 * actions land without navigating anywhere.
 *
 * Collapsed it drops to 68px — icons and counts only. The counts survive the
 * collapse on purpose: the whole reason to keep the rail open is to see them,
 * so taking them away would make collapsing cost something.
 */

const EXPANDED = 264
const COLLAPSED = 68

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
  const collapsed = useDemo((s) => s.railCollapsed)
  const toggle = useDemo((s) => s.toggleRail)
  const openPalette = useDemo((s) => s.setPaletteOpen)
  const { pathname } = useLocation()

  return (
    <motion.aside
      animate={{ width: collapsed ? COLLAPSED : EXPANDED }}
      transition={transition.base}
      className="flex shrink-0 flex-col overflow-hidden border-r border-border bg-surface-sunken pt-[20px] pb-md"
      style={{ paddingInline: collapsed ? 14 : 16 }}
    >
      <div
        className={`flex items-center pb-[18px] ${collapsed ? 'justify-center' : 'justify-between px-xs'}`}
      >
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={transition.fast}
              className="font-display text-base font-semibold tracking-tight whitespace-nowrap text-fg"
            >
              ENSERA
            </motion.span>
          )}
        </AnimatePresence>
        <button
          type="button"
          onClick={toggle}
          title={collapsed ? 'Seitenleiste ausklappen' : 'Seitenleiste einklappen'}
          aria-label={collapsed ? 'Seitenleiste ausklappen' : 'Seitenleiste einklappen'}
          aria-expanded={!collapsed}
          className="flex size-7 shrink-0 items-center justify-center rounded-md text-fg-subtle
                     transition-colors hover:bg-[rgba(18,22,27,0.06)] hover:text-fg-muted"
        >
          <PanelIcon collapsed={collapsed} />
        </button>
      </div>

      {/* Search doubles as the agent's front door — hence the orb, not a magnifier. */}
      <button
        type="button"
        onClick={() => openPalette(true)}
        title="Suchen oder fragen · ⌘K"
        className={`flex h-[38px] shrink-0 items-center gap-[10px] rounded-md border border-border bg-surface
                    shadow-[0_1px_2px_rgba(18,22,27,0.06)] transition-colors hover:border-border-strong
                    ${collapsed ? 'justify-center px-0' : 'px-[10px]'}`}
      >
        <Orb size={22} />
        {!collapsed && (
          <>
            <span className="flex-1 truncate text-left text-sm text-fg-subtle">Suchen oder fragen</span>
            <span className="numeric-mono text-2xs text-fg-subtle">⌘K</span>
          </>
        )}
      </button>

      <nav className="flex flex-col gap-[2px] pt-[26px]">
        {!collapsed && (
          <div className="px-xs pb-[10px]">
            <Eyebrow>KONTAKT</Eyebrow>
          </div>
        )}
        {collapsed && <div className="h-[10px]" />}

        {nav.map(({ to, label, icon: Icon, key }) => {
          const count = counts[key]
          const active = pathname.startsWith(to)
          return (
            // data-count is the settled value; the badge itself animates and so
            // briefly holds two numbers at once.
            <NavLink
              key={to}
              to={to}
              data-count={count}
              title={collapsed ? `${label} · ${count}` : undefined}
              className="relative"
            >
              <span
                className={`relative flex h-9 shrink-0 items-center rounded-md transition-colors ${
                  collapsed ? 'justify-center px-0' : 'gap-sm px-[10px]'
                } ${active ? '' : 'hover:bg-[rgba(18,22,27,0.035)]'}`}
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

                {collapsed ? (
                  // Collapsed, only a count that demands attention is worth pixels.
                  urgent.has(key) &&
                  count > 0 && (
                    <span
                      className="absolute top-[5px] right-[5px] size-[6px] rounded-full bg-brand
                                 ring-2 ring-surface-sunken"
                    />
                  )
                ) : (
                  <>
                    <span
                      className={`relative flex-1 truncate text-[14px] leading-[18px] ${
                        active ? 'font-medium text-fg' : 'text-fg-muted'
                      }`}
                    >
                      {label}
                    </span>
                    <span className="relative">
                      <AnimatedCount value={count} urgent={urgent.has(key) && count > 0} />
                    </span>
                  </>
                )}
              </span>
            </NavLink>
          )
        })}
      </nav>

      <div
        className={`mt-auto flex items-center ${
          collapsed ? 'flex-col gap-[2px]' : 'gap-[6px] px-[4px]'
        }`}
      >
        <RailTool icon={BubbleIcon} label="Verlauf" />
        <RailTool icon={HelpIcon} label="Hilfe" />
        <RailTool icon={SettingsIcon} label="Einrichtung" to="/ensera/einrichtung" />
        {!collapsed && <RailTool icon={SlidersIcon} label="Regeln und Grenzen" />}
        {!collapsed && <RailTool icon={CompassIcon} label="Was ist neu" />}
      </div>

      <div
        className={`mt-[14px] flex shrink-0 items-center rounded-lg border border-border bg-surface
                    shadow-[0_1px_2px_rgba(18,22,27,0.06)] ${
                      collapsed ? 'h-[40px] justify-center px-0' : 'h-[52px] gap-[11px] px-sm'
                    }`}
        title={collapsed ? `${seed.consultant.name} · ${seed.consultant.registry}` : undefined}
      >
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-fg">
          <span className="text-2xs font-semibold text-fg-inverse">{seed.consultant.initials}</span>
        </span>
        {!collapsed && (
          <>
            <span className="flex flex-1 flex-col gap-px overflow-hidden">
              <span className="truncate text-sm font-medium leading-4 text-fg">
                {seed.consultant.name}
              </span>
              <span className="label-caps truncate text-[10px] leading-3 text-fg-subtle">
                {seed.consultant.registry}
              </span>
            </span>
            <span className="text-fg-subtle">
              <ChevronUpDownIcon />
            </span>
          </>
        )}
      </div>
    </motion.aside>
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
      aria-label={label}
      className={`flex size-8 shrink-0 items-center justify-center rounded-md transition-colors ${
        active
          ? 'border border-border bg-surface text-brand shadow-[0_1px_2px_rgba(18,22,27,0.06)]'
          : 'text-fg-subtle hover:bg-[rgba(18,22,27,0.05)] hover:text-fg-muted'
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
