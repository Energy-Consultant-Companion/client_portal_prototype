/*
 * Walks the full demo loop the way a presenter would, asserting after each move
 * that the *other* persona can see it. This is the thing worth testing here:
 * the screens are static until the reciprocity works.
 *
 * Navigation goes through the in-app persona switcher, never page.goto — state
 * is in memory by design, so a reload is a reset and would hide every bug.
 *
 * Usage: node scripts/walk.mjs   (dev server must be running)
 */
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const BASE = 'http://localhost:5173/client_portal_prototype'
const OUT = '/tmp/walk'
mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

const failures = []
page.on('pageerror', (e) => failures.push(`pageerror: ${e.message}`))

let step = 0
/*
 * Screenshots are a convenience here, not an assertion. The agent orb is a
 * shader that never stops animating, so a capture can occasionally fail to find
 * a stable frame — that must not take the run down with it.
 */
async function shot(name) {
  const path = `${OUT}/${String(++step).padStart(2, '0')}-${name}.png`
  try {
    await page.screenshot({ path, animations: 'disabled', timeout: 8000 })
  } catch {
    console.log(`  (Screenshot ${name} übersprungen)`)
  }
}

/** Wait for text to appear, rather than sampling mid-transition. */
async function seen(text, { exact = false, timeout = 4000 } = {}) {
  try {
    await page.getByText(text, { exact }).first().waitFor({ state: 'visible', timeout })
    return true
  } catch {
    return false
  }
}

function check(label, ok) {
  console.log(`${ok ? '✓' : '✗'} ${label}`)
  if (!ok) failures.push(label)
}

/** Client-side navigation through the demo switcher — no page reload. */
async function go(persona, stop) {
  await page.locator('[data-demo-chrome] button').last().click()
  await page.getByRole('button', { name: persona === 'kundschaft' ? /^ALS KUNDSCHAFT$/ : /^ALS BERATERIN$/ }).waitFor().catch(() => {})
  await page.locator('[data-demo-chrome]').getByRole('button', { name: stop, exact: true }).click()
  await page.waitForTimeout(500)
}

/**
 * Read a rail badge from its settled data-count attribute, keyed on href —
 * matching on the label would make „Fragen" also hit „Anfragen".
 */
async function railCount(slug) {
  return Number(await page.locator(`aside a[href$="/${slug}"]`).getAttribute('data-count'))
}

// ── 1. Landing → inquiry
await page.goto(`${BASE}/`, { waitUntil: 'networkidle' })
await page.getByRole('link', { name: 'Anfrage erstellen' }).first().click()
await page.waitForURL('**/anfrage')
check('Landing führt in die Anfrage', true)

// ── 2. Send the inquiry
await page.getByRole('button', { name: 'Anfrage senden' }).click()
await page.waitForURL('**/anfrage/gesendet')
check('Bestätigung erscheint', await seen('Ihre Anfrage liegt bei Frau Held.'))
check('Toast meldet den Mailversand', await seen('Ihre Anfrage ist raus.', { exact: true }))
await shot('anfrage-gesendet')

// ── 3. Cross to the consultant: is the inquiry there?
await go('beraterin', 'Anfragen')
check(
  'Anfrage liegt bei der Beraterin',
  await seen('Heizung tauschen · Einfamilienhaus, Baujahr 1972'),
)
check('Anfragen-Badge steht auf 2', (await railCount('anfragen')) === 2)
await shot('anfragen')

// ── 4. Accept → magic link
await page.getByRole('button', { name: 'Annehmen und Zugang senden' }).click()
check('Zugangs-Toast nennt die Adresse', await seen('Zugang an t.sander@posteo.de raus.'))
check('Anfragen-Badge fällt auf 1', (await railCount('anfragen')) === 1)
await shot('angenommen')

// The toast action *is* the magic link.
await page.getByRole('button', { name: 'Als Kundschaft öffnen' }).click()
await page.waitForURL('**/aufnahme')
check('Magic Link führt in die Aufnahme', true)

// ── 5. Intake: book a slot
await page.getByRole('button', { name: /FREITAG · 14\. AUGUST/ }).first().click()
await page.getByRole('button', { name: 'Angaben abschicken' }).click()
await page.waitForURL('**/bereich')
check('Aufnahme führt in den eigenen Bereich', true)
await shot('bereich')

// ── 6. Did the booking reach her calendar?
await go('beraterin', 'Fristen')
check('Erstgespräch steht in ihren Fristen', await seen('Erstgespräch Tobias Sander'))
await shot('kalender')

// ── 7. Upload a document as the client
await go('kundschaft', 'Kundenportal (Zugang per Magic Link)')
check('Vorher: zwei Unterlagen fehlen', await seen('Zwei Unterlagen fehlen. Sonst sind Sie durch.'))
await page.getByRole('button', { name: 'Hochladen', exact: true }).first().click()
check(
  'Nachher: Überschrift zählt herunter',
  await seen('Eine Unterlage fehlt. Sonst sind Sie durch.'),
)
await shot('hochgeladen')

// ── 8. Does the consultant's case reflect it?
await go('beraterin', 'Fall Reuter')
check('Fall zeigt 8 von 9', await seen('8 VON 9', { exact: true }))
await shot('fall-reuter')

await go('beraterin', 'Kundschaft')
check('Tabelle zeigt 8/9 für Reuter', await seen('8/9', { exact: true }))

// ── 9. A simple question: answered on the spot
await go('kundschaft', 'Kundenportal (Zugang per Magic Link)')
const ask = page.getByPlaceholder('Frage zu Ihrem Vorhaben …')
await ask.fill('Welche Unterlagen fehlen noch?')
await ask.press('Enter')
check('Einfache Frage sofort beantwortet', await seen('Sofort beantwortet.', { exact: true }))
check(
  'Antwort kommt aus dem Fall',
  await seen('Es fehlt noch eine von neun', { timeout: 2000 }) ||
    await seen('Es fehlen noch', { timeout: 2000 }) ||
    (await page.getByText('ENSERA · SOFORT BEANTWORTET, OHNE FRAU HELD ZU STÖREN').count()) >= 2,
)
await shot('frage-sofort')

// ── 10. A dangerous question: escalated with a draft
await ask.fill('Können wir die Fenster schon im Herbst tauschen lassen?')
await ask.press('Enter')
check('Riskante Frage geht an Frau Held', await seen('Die Frage liegt bei Frau Held.'))
await page.getByRole('button', { name: 'Als Beraterin ansehen' }).click()
await page.waitForURL('**/ensera/fragen')
check('Fragen-Badge steht auf 4', (await railCount('fragen')) === 4)
await shot('fragen')

// ── 11. Release the answer
await page.getByRole('button', { name: 'Freigeben und senden' }).click()
check('Antwort-Toast erscheint', await seen('Antwort ist raus.', { exact: true }))
check('Fragen-Badge fällt auf 3', (await railCount('fragen')) === 3)
await shot('freigegeben')

// ── 12. The client sees it, signed by her
await go('beraterin', 'Postfach')
check('Protokoll hat die Antwort', await seen('Antwort: Können wir die Fenster'))
await shot('postfach')

await go('kundschaft', 'Kundenportal (Zugang per Magic Link)')
await page.waitForTimeout(400)
check(
  'Kundschaft sieht die freigegebene Antwort',
  (await page.getByText('KATRIN HELD · PERSÖNLICH GESCHRIEBEN UND FREIGEGEBEN').count()) >= 2,
)
await shot('kundschaft-antwort')

// ── 13. Reload wipes the demo back to the seeded state
await page.reload({ waitUntil: 'networkidle' })
check(
  'Reload stellt den Ausgangszustand her',
  await seen('Zwei Unterlagen fehlen. Sonst sind Sie durch.'),
)

await browser.close()

console.log(
  failures.length ? `\n${failures.length} Fehler:\n  ${failures.join('\n  ')}` : '\nAlles grün.',
)
process.exit(failures.length ? 1 : 0)
