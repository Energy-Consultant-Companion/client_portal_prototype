import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { CommandPalette } from '@/components/chrome/CommandPalette'
import { EnseraRail } from '@/components/chrome/EnseraRail'
import { PersonaSwitcher } from '@/components/chrome/PersonaSwitcher'
import { Toasts } from '@/components/chrome/Toasts'
import { routeVariants } from '@/motion/tokens'

import { Landing } from '@/screens/client/Landing'
import { FirstInquiry } from '@/screens/client/FirstInquiry'
import { InquirySent } from '@/screens/client/InquirySent'
import { Intake } from '@/screens/client/Intake'
import { ClientPortal } from '@/screens/client/ClientPortal'

import { Inquiries } from '@/screens/ensera/Inquiries'
import { Clients } from '@/screens/ensera/Clients'
import { CaseDetail } from '@/screens/ensera/CaseDetail'
import { Deadlines } from '@/screens/ensera/Deadlines'
import { Questions } from '@/screens/ensera/Questions'
import { Outbox } from '@/screens/ensera/Outbox'
import { Setup } from '@/screens/ensera/Setup'

/**
 * The consultant shell. The rail lives outside the animated region so its
 * badges stay put while the content crossfades — watching a count tick over
 * during a route change is the whole reason it's there.
 */
function EnseraShell() {
  return (
    <div className="flex min-h-screen w-full bg-surface">
      <EnseraRail />
      <main className="min-w-0 flex-1">
        <Outlet />
      </main>
      <CommandPalette />
    </div>
  )
}

/** Wraps each screen so route changes crossfade with a small rise. */
function Animated({ children }: { children: React.ReactNode }) {
  return (
    <motion.div variants={routeVariants} initial="initial" animate="animate" exit="exit">
      {children}
    </motion.div>
  )
}

export function App() {
  const location = useLocation()

  return (
    <>
      <AnimatePresence mode="wait" initial={false}>
        <Routes location={location} key={location.pathname}>
          {/* Kundschaft */}
          <Route
            path="/"
            element={
              <Animated>
                <Landing />
              </Animated>
            }
          />
          <Route
            path="/anfrage"
            element={
              <Animated>
                <FirstInquiry />
              </Animated>
            }
          />
          <Route
            path="/anfrage/gesendet"
            element={
              <Animated>
                <InquirySent />
              </Animated>
            }
          />
          <Route
            path="/aufnahme"
            element={
              <Animated>
                <Intake />
              </Animated>
            }
          />
          <Route
            path="/bereich"
            element={
              <Animated>
                <ClientPortal />
              </Animated>
            }
          />

          {/* Beraterin */}
          <Route path="/ensera" element={<EnseraShell />}>
            <Route index element={<Navigate to="/ensera/anfragen" replace />} />
            <Route path="anfragen" element={<Inquiries />} />
            <Route path="kundschaft" element={<Clients />} />
            <Route path="kundschaft/:id" element={<CaseDetail />} />
            <Route path="kalender" element={<Deadlines />} />
            <Route path="fragen" element={<Questions />} />
            <Route path="postfach" element={<Outbox />} />
            <Route path="einrichtung" element={<Setup />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>

      <Toasts />
      <PersonaSwitcher />
    </>
  )
}
