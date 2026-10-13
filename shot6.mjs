import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' }).catch(async () => chromium.launch());
const pages = ['/', '/ohje', '/profiili', '/kisa', '/kisa?avaa=1', '/tilastot', '/tilastot?nayta=mina', '/tilastot?nayta=ryhma', '/tilastot?nayta=urheilu', '/tilastot?nayta=vertailu', '/tilastot?nayta=ennatykset', '/karki', '/karki?lista=tanaan', '/kirjaa', '/shortcut', '/yllapito', '/yllapito/komento', '/?taso=3', '/?tyhja=1', '/?juhla=1&taso=2'];
for (const [label, ctxOpts] of [['desktop', { viewport: { width: 1280, height: 800 } }], ['iphone', { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }]]) {
  for (const tok of ['demo', 't4', 't8']) {
    const c = await b.newContext(ctxOpts);
    await c.addCookies([{ name: 'fg_token', value: tok, url: 'http://localhost:3063' }]);
    for (const path of pages) {
      const p = await c.newPage();
      const errs = [];
      p.on('pageerror', (e) => errs.push('pageerror: ' + e.message.slice(0, 200)));
      p.on('console', (m) => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 200)); });
      await p.goto('http://localhost:3063' + path, { waitUntil: 'networkidle' }).catch(() => {});
      await p.waitForTimeout(1500);
      const txt = await p.locator('body').innerText().catch(() => '');
      if (txt.includes('Application error')) errs.push('APPLICATION ERROR PAGE');
      if (errs.length) console.log(label, tok, path, errs.slice(0, 3));
      await p.close();
    }
    await c.close();
  }
}
console.log('done');
await b.close();
