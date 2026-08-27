/*
 * Exercises the four pieces of chrome that were inert: the collapsible rail, the
 * search-and-ask palette, the Einrichtung templates, and the tools row.
 *
 * Usage: node scripts/settings.mjs   (dev server must be running)
 */
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const BASE = 'http://localhost:5173/client_portal_prototype'
const OUT = '/tmp/settings'
mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

const failures = []
page.on('pageerror', (e) => failures.push(`pageerror: ${e.message}`))

let step = 0
const shot = (n) =>
  page
    .screenshot({ path: `${OUT}/${String(++step).padStart(2, '0')}-${n}.png`, animations: 'disabled', timeout: 8000 })
    .catch(() => console.log(`  (Screenshot ${n} übersprungen)`))

function check(label, ok) {
  console.log(`${ok ? '✓' : '✗'} ${label}`)
  if (!ok) failures.push(label)
}

async function seen(text, { exact = false, timeout = 3000 } = {}) {
  try {
    await page.getByText(text, { exact }).first().waitFor({ state: 'visible', timeout })
    return true
  } catch {
    return false
  }
}

const railWidth = () => page.locator('aside').first().evaluate((el) => el.getBoundingClientRect().width)

// ─────────────────────────────────────────────── Seitenleiste einklappen
await page.goto(`${BASE}/ensera/kundschaft`, { waitUntil: 'networkidle' })
await page.waitForTimeout(700)
check('Rail startet ausgeklappt (264px)', Math.round(await railWidth()) === 264)

await page.getByRole('button', { name: 'Seitenleiste einklappen' }).click()
await page.waitForTimeout(600)
check('Rail klappt ein (68px)', Math.round(await railWidth()) === 68)
check('Labels sind weg', !(await page.locator('aside').getByText('Kundschaft', { exact: true }).count()))
check('Icons bleiben', (await page.locator('aside a svg').count()) >= 5)
await shot('rail-eingeklappt')

// The choice must survive a route change — the rail lives in the shell.
await page.locator('aside a[href$="/kalender"]').click()
await page.waitForTimeout(600)
check('Bleibt eingeklappt über Seitenwechsel', Math.round(await railWidth()) === 68)

await page.getByRole('button', { name: 'Seitenleiste ausklappen' }).click()
await page.waitForTimeout(600)
check('Rail klappt wieder aus', Math.round(await railWidth()) === 264)

// ─────────────────────────────────────────────── Palette: suchen
const palette = page.getByRole('dialog', { name: 'Suchen oder fragen' })
await page.keyboard.press('Meta+k')
check('⌘K öffnet die Palette', await palette.isVisible().catch(() => false))
await shot('palette-offen')

await page.getByPlaceholder('Suchen oder fragen …').fill('Vollmacht')
await page.waitForTimeout(400)
check('Findet die fehlende Vollmacht', await seen('Vollmacht Jens Reuter'))
check('Zeigt sie als FEHLT', await seen('FEHLT', { exact: true }))
await shot('palette-suche')

await page.keyboard.press('Enter')
await page.waitForTimeout(700)
check('Enter springt in den Fall', page.url().includes('/kundschaft/reuter'))

// Search across other kinds.
await page.keyboard.press('Meta+k')
await page.getByPlaceholder('Suchen oder fragen …').fill('Brendel')
await page.waitForTimeout(400)
check('Findet Kundschaft nach Name', await seen('Hans-Jürgen Brendel'))
// A name has to reach everything of that client's, not just rows spelling it out.
check('Findet auch seine Fristen', await seen('Antwort an die BAFA freigeben'))
// The deadline is titled just „Rückruf" now — the name lives on its case, and
// the result's detail line is what puts it back.
check('Und seinen Rückruf', await seen('Rückruf', { exact: true }))
await shot('palette-brendel')
await page.keyboard.press('Escape')
await page.waitForTimeout(400)
check('Escape schließt', !(await palette.isVisible().catch(() => false)))

// ─────────────────────────────────────────────── Palette: fragen
await page.keyboard.press('Meta+k')
const input = page.getByPlaceholder('Suchen oder fragen …')
await input.fill('Was ist heute überfällig?')
await page.waitForTimeout(300)
check('Erkennt eine Frage als Frage', await seen('FRAGE', { exact: true }))
await page.keyboard.press('Enter')
await page.waitForTimeout(600)
check('Antwortet aus dem Kalender', await seen('Antwort an die BAFA freigeben'))
check('Nennt die Herkunft', await seen('AUS IHREM KALENDER'))
await shot('palette-frage')

await input.fill('Wer wartet auf mich?')
await page.keyboard.press('Enter')
await page.waitForTimeout(600)
check('Antwortet über ihre Mandate', await seen('warten auf Sie'))
await shot('palette-mandate')

// The same discipline as the client side: no grounds, no answer.
await input.fill('Wie wird das Wetter am Donnerstag?')
await page.keyboard.press('Enter')
await page.waitForTimeout(600)
check('Erfindet nichts', await seen('KEINE GRUNDLAGE IN DEN DATEN'))
await page.keyboard.press('Escape')

// ─────────────────────────────────────────────── Einrichtung
await page.locator('aside a[href$="/einrichtung"]').click()
await page.waitForTimeout(700)
check('Einrichtung öffnet über die Werkzeugzeile', page.url().includes('/einrichtung'))
check('BAFA-Vorlage hat sechs Schritte', (await page.locator('[data-step-row]').count()) === 6)
await shot('einrichtung')

// Switch template — different step set.
await page.getByRole('button', { name: /KfW 458 · Heizungstausch/ }).click()
await page.waitForTimeout(600)
check('Vorlagenwechsel lädt andere Schritte', (await page.locator('[data-step-row]').count()) === 5)
check('Zeigt das KfW-Regelwerk', await seen('KfW 458, STAND 2026-01'))
await shot('einrichtung-kfw')

await page.getByRole('button', { name: /BAFA EBW · iSFP/ }).click()
await page.waitForTimeout(600)
check('Zurück auf sechs Schritte', (await page.locator('[data-step-row]').count()) === 6)

// Reorder via the keyboard-reachable nudge.
const firstTitle = async () =>
  (await page.locator('[data-step-row]').first().getAttribute('data-step-title')) ?? ''
const before = await firstTitle()
await page.locator('[data-step-row]').nth(1).hover()
await page.locator('[data-step-row]').nth(1).getByRole('button', { name: 'Nach oben' }).click()
await page.waitForTimeout(600)
const after = await firstTitle()
check('Schritte lassen sich tauschen', before !== after && after === 'Erstgespräch und Beauftragung')
await shot('einrichtung-getauscht')

// Owner dropdown.
const ownerBtn = page.locator('[data-step-row]').first().getByRole('button', { expanded: false })
await ownerBtn.first().click()
await page.waitForTimeout(400)
check('Dropdown für "Wer ist dran" öffnet', (await page.getByRole('option').count()) === 4)
await page.getByRole('option', { name: /SIE/ }).first().click()
await page.waitForTimeout(400)
check(
  'Zuständigkeit ist geändert',
  (await page.locator('[data-step-row]').first().innerText()).includes('SIE'),
)
await shot('einrichtung-owner')

// Inline editing.
const cell = page.locator('[data-step-row]').first().getByTitle('Dauer bearbeiten')
await cell.click()
await page.keyboard.press('Meta+a')
await page.keyboard.type('2 Wochen')
await page.keyboard.press('Enter')
await page.waitForTimeout(400)
check('Dauer ist editierbar', await seen('2 Wochen'))

// Add and remove a step.
await page.getByRole('button', { name: 'Schritt hinzufügen' }).click()
await page.waitForTimeout(500)
check('Schritt hinzugefügt (7)', (await page.locator('[data-step-row]').count()) === 7)
const last = page.locator('[data-step-row]').last()
await last.hover()
await last.getByRole('button', { name: /entfernen/ }).click()
await page.waitForTimeout(500)
check('Schritt entfernt (6)', (await page.locator('[data-step-row]').count()) === 6)

// Create a template from scratch.
await page.getByRole('button', { name: 'Neue Vorlage' }).click()
await page.getByPlaceholder('Name der Vorlage').fill('Heizlast · Einzelauftrag')
await page.keyboard.press('Enter')
await page.waitForTimeout(600)
check('Neue Vorlage angelegt und geöffnet', await seen('Heizlast · Einzelauftrag'))
check('Startet mit einem Schritt', (await page.locator('[data-step-row]').count()) === 1)
check('Sagt, dass sie nichts ableitet', await seen('habe nichts abgeleitet'))
await shot('einrichtung-neu')

// The last step can't be removed — a workflow without steps is meaningless.
await page.locator('[data-step-row]').first().hover()
await page.locator('[data-step-row]').first().getByRole('button', { name: /entfernen/ }).click()
await page.waitForTimeout(500)
check('Letzter Schritt bleibt bestehen', await seen('Der letzte Schritt bleibt.'))
check('Es ist noch ein Schritt da', (await page.locator('[data-step-row]').count()) === 1)

// Activate the draft.
await page.getByRole('button', { name: 'Vorlage aktivieren' }).click()
await page.waitForTimeout(600)
check('Entwurf lässt sich aktivieren', await seen('ist aktiv.'))
await shot('einrichtung-aktiviert')

await browser.close()
console.log(failures.length ? `\n${failures.length} Fehler:\n  ${failures.join('\n  ')}` : '\nAlles grün.')
process.exit(failures.length ? 1 : 0)
