/*
 * Screenshot helper for the fidelity pass: renders each route at 1440px so it
 * can be compared side by side with the Paper artboard it came from.
 *
 * Usage: node scripts/shoot.mjs [route ...]
 * Uses the locally installed Chrome, so there is nothing to download.
 */
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const BASE = 'http://localhost:5173/client_portal_prototype'
const OUT = '/tmp/shots'

const routes = process.argv.slice(2).length
  ? process.argv.slice(2)
  : [
      '/',
      '/anfrage',
      '/anfrage/gesendet',
      '/aufnahme',
      '/bereich',
      '/ensera/anfragen',
      '/ensera/kundschaft',
      '/ensera/kundschaft/reuter',
      '/ensera/kalender',
      '/ensera/fragen',
      '/ensera/postfach',
      '/ensera/einrichtung',
    ]

mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

const problems = []
page.on('console', (m) => {
  if (m.type() === 'error') problems.push(`console: ${m.text()}`)
})
page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`))

// The persona switcher is demo scaffolding, not design — hide it so screenshots
// compare cleanly against the artboards.
await page.addStyleTag({ content: '[data-demo-chrome]{display:none !important}' })

for (const route of routes) {
  problems.length = 0
  await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle' })
  await page.addStyleTag({ content: '[data-demo-chrome]{display:none !important}' })
  // Let entrance animations and the shader settle before capturing.
  await page.waitForTimeout(1400)
  const name = route === '/' ? 'landing' : route.replace(/^\//, '').replace(/\//g, '-')
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: true })
  console.log(`${name.padEnd(26)} ${problems.length ? `⚠ ${problems.join(' | ')}` : 'ok'}`)
}

await browser.close()
