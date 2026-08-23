/*
 * Icons extracted verbatim from the Paper file. Stroke width is 1.3 throughout
 * and colour comes from `currentColor`, so a row can tint its whole icon by
 * setting text colour — that is how the rail switches between active and idle.
 */
import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement> & { size?: number }

function Icon({ size = 16, children, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.3}
      className="shrink-0"
      aria-hidden
      {...rest}
    >
      {children}
    </svg>
  )
}

/** Rail · Anfragen — an inbox tray. */
export const InboxIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M2 9.4V12a1.6 1.6 0 001.6 1.6h8.8A1.6 1.6 0 0014 12V9.4h-3.2a2.8 2.8 0 01-5.6 0H2z" strokeLinejoin="round" />
    <path d="M2 9.4l1.8-6.2A1.2 1.2 0 015 2.4h6a1.2 1.2 0 011.2.8L14 9.4" strokeLinejoin="round" />
  </Icon>
)

/** Rail · Kundschaft — two people. */
export const PeopleIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="6" cy="5.5" r="2.6" />
    <path d="M1.8 13.5c0-2.3 1.9-3.8 4.2-3.8s4.2 1.5 4.2 3.8" strokeLinecap="round" />
    <path d="M11 4.2a2.4 2.4 0 010 4.3M12.6 13.5c0-1.6-.5-2.7-1.4-3.4" strokeLinecap="round" />
  </Icon>
)

/** Rail · Kalender. */
export const CalendarIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="2" y="3.2" width="12" height="10.8" rx="1.6" />
    <path d="M2 6.6h12M5.4 1.8v2.6M10.6 1.8v2.6" strokeLinecap="round" />
  </Icon>
)

/** Rail · Postfach — a sealed envelope. */
export const EnvelopeIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="1.8" y="3.4" width="12.4" height="9.2" rx="1.6" />
    <path d="M2.4 4.6L8 8.8l5.6-4.2" strokeLinecap="round" strokeLinejoin="round" />
  </Icon>
)

/** Rail · Fragen — a speech bubble. */
export const BubbleIcon = (p: IconProps) => (
  <Icon {...p}>
    <path
      d="M14 8.6c0 2.8-2.7 5-6 5-.7 0-1.4-.1-2-.3L2.2 14.2l1-2.6C2.4 10.8 2 9.7 2 8.6c0-2.8 2.7-5 6-5s6 2.2 6 5z"
      strokeLinejoin="round"
    />
  </Icon>
)

/** Tools · help. */
export const HelpIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="8" cy="8" r="6" />
    <path d="M6.4 6.2a1.7 1.7 0 113.2.8c-.4.6-1.3.8-1.5 1.6M8 11.2v.1" strokeLinecap="round" />
  </Icon>
)

/**
 * Tools · Einrichtung.
 *
 * The design drew this as a circle with radiating spokes, which reads as
 * brightness rather than settings. A toothed gear says „hier wird eingestellt"
 * without a caption — same weight and 16px box as the rest of the set.
 */
export const SettingsIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="8" cy="8" r="2.4" />
    <path
      d="M8 1.5l1 1.6a5.6 5.6 0 011.6.7l1.8-.4.9 1.6-1.2 1.4a5.6 5.6 0 010 1.8l1.2 1.4-.9 1.6-1.8-.4a5.6 5.6 0 01-1.6.7L8 14.5l-1-1.6a5.6 5.6 0 01-1.6-.7l-1.8.4-.9-1.6 1.2-1.4a5.6 5.6 0 010-1.8L2.7 5.4l.9-1.6 1.8.4a5.6 5.6 0 011.6-.7z"
      strokeLinejoin="round"
    />
  </Icon>
)

/** Tools · a plain sliders glyph, for the second settings entry in the row. */
export const SlidersIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M2.5 4.5h11M2.5 8h11M2.5 11.5h11" strokeLinecap="round" />
    <circle cx="6" cy="4.5" r="1.5" fill="var(--color-surface-sunken)" />
    <circle cx="10.5" cy="8" r="1.5" fill="var(--color-surface-sunken)" />
    <circle cx="5" cy="11.5" r="1.5" fill="var(--color-surface-sunken)" />
  </Icon>
)

/** Tools · what's new. */
export const CompassIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="8" cy="8" r="6" />
    <path d="M10.4 5.6L9.2 9.2 5.6 10.4 6.8 6.8z" strokeLinejoin="round" />
  </Icon>
)

/**
 * Rail header · collapse the panel. The divider slides to the far side when
 * collapsed, so the icon states which way the click will go.
 */
export const PanelIcon = ({ collapsed = false, ...p }: IconProps & { collapsed?: boolean }) => (
  <Icon {...p}>
    <rect x="1.5" y="2.5" width="13" height="11" rx="2" />
    <path d={collapsed ? 'M6 2.5v11' : 'M10 2.5v11'} />
  </Icon>
)

export const PlusIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M8 3v10M3 8h10" strokeLinecap="round" />
  </Icon>
)

export const TrashIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M2.5 4.5h11M6 4.5V3h4v1.5M4 4.5l.7 8.2a1 1 0 001 .8h4.6a1 1 0 001-.8l.7-8.2" strokeLinejoin="round" />
  </Icon>
)

/** Einrichtung · nudge a step up or down without dragging. */
export const CaretIcon = ({ up = false, ...p }: IconProps & { up?: boolean }) => (
  <Icon {...p}>
    <path d={up ? 'M4 9.5L8 5.5l4 4' : 'M4 6.5L8 10.5l4-4'} strokeLinecap="round" strokeLinejoin="round" />
  </Icon>
)

/** User card · switch. */
export const ChevronUpDownIcon = ({ size = 14, ...p }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 14 14"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.3}
    className="shrink-0"
    aria-hidden
    {...p}
  >
    <path d="M4.6 5.6L7 3.2l2.4 2.4M4.6 8.4L7 10.8l2.4-2.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export const ChevronRightIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M6 3.5L10.5 8 6 12.5" strokeLinecap="round" strokeLinejoin="round" />
  </Icon>
)

export const ChevronDownIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3.5 6L8 10.5 12.5 6" strokeLinecap="round" strokeLinejoin="round" />
  </Icon>
)

export const CheckIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3 8.4l3.2 3.2L13 4.8" strokeLinecap="round" strokeLinejoin="round" />
  </Icon>
)

export const ArrowRightIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M2.5 8h11M9.5 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
  </Icon>
)

export const ArrowUpIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M8 13.5v-11M4 6.5l4-4 4 4" strokeLinecap="round" strokeLinejoin="round" />
  </Icon>
)

/** Upload — used on every document row the client still owes. */
export const UploadIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M8 10.5V2.5M4.8 5.7L8 2.5l3.2 3.2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M2.5 10.5v1.4A1.6 1.6 0 004.1 13.5h7.8a1.6 1.6 0 001.6-1.6v-1.4" strokeLinecap="round" />
  </Icon>
)

/** Citation · a regulation clause. */
export const ShieldIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M8 2l4.5 1.7v4.1c0 2.7-1.8 5-4.5 6.2-2.7-1.2-4.5-3.5-4.5-6.2V3.7L8 2z" strokeLinejoin="round" />
  </Icon>
)

/** Citation · a document page. */
export const DocumentIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3.5 2.5h5L12.5 6.5v7h-9v-11z" strokeLinejoin="round" />
    <path d="M8.5 2.5v4h4" strokeLinejoin="round" />
  </Icon>
)

/** Questions detail · why this wasn't answered automatically. */
export const QuestionMarkIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="8" cy="8" r="6.2" />
    <path d="M6.4 6.2a1.7 1.7 0 113.2.8c-.4.6-1.3.8-1.5 1.6M8 11.2v.1" strokeLinecap="round" />
  </Icon>
)

/** Setup · drag handle on a workflow step. */
export const DragHandleIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3 5h10M3 8h10M3 11h10" strokeLinecap="round" />
  </Icon>
)

export const PhoneIcon = (p: IconProps) => (
  <Icon {...p}>
    <path
      d="M3.2 2.5h2.1l1 2.6-1.3 1a7.4 7.4 0 003.9 3.9l1-1.3 2.6 1v2.1a1.2 1.2 0 01-1.3 1.2A11 11 0 013 3.8a1.2 1.2 0 011.2-1.3z"
      strokeLinejoin="round"
    />
  </Icon>
)

/** The wordmark lockup used on the client-facing pages. */
export function HeldMark({ size = 22 }: { size?: number }) {
  return (
    <span
      className="flex items-center justify-center rounded-sm bg-fg"
      style={{ width: size, height: size }}
      aria-hidden
    >
      <span className="block rounded-full bg-fg-inverse" style={{ width: size * 0.36, height: size * 0.36 }} />
    </span>
  )
}
