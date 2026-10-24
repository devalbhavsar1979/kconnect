// Browser smoke against the unmodified, shipped Phase 2 React assets.
const { chromium } = require('../.runtime/browser/node_modules/playwright-core');
const path = require('path');
const fs = require('fs');
(async () => {
  const browser = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true });
  try {
    const out = path.join(__dirname, '../artifacts/phase3-browser');
    fs.mkdirSync(out, { recursive: true });
    for (const [name, viewport] of [['desktop', { width: 1440, height: 1000 }], ['mobile', { width: 390, height: 844 }]]) {
      const context = await browser.newContext({ viewport, serviceWorkers: 'block' });
      const page = await context.newPage();
      const errors = [];
      const pageErrors = [];
      page.on('pageerror', error => { errors.push(error.message); pageErrors.push(error.message); });
      page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
      await page.goto(process.env.P3_URL + '/login');
      try { await page.locator('input[type=email]').waitFor({ timeout: 10000 }); }
      catch { await page.screenshot({ path: path.join(out, 'login-failure.png'), fullPage: true }); throw Error('Login failed to render: ' + errors.join('\n')); }
      await page.locator('input[type=email]').fill(process.env.P3_EMAIL);
      await page.locator('input[type=password]').fill(process.env.P3_PASSWORD);
      await page.locator('button[type=submit]').click();
      await page.waitForURL('**/dashboard');
      await page.goto(process.env.P3_URL + '/profile');
      await page.getByRole('button', { name: 'Overview', exact: true }).waitFor();
      await page.waitForFunction(() => [...document.images].some(img => img.src.includes('/uploads/photos/') && img.complete && img.naturalWidth > 0));
      await page.screenshot({ path: path.join(out, name + '-overview.png'), fullPage: true });
      for (const [label, endpoint] of [['Academic Details','academic'],['Experience','experience'],['Expertise','expertise'],['Preferences','preferences'],['Service Delivery','service-delivery'],['Achievements','achievements']]) {
        const received = page.waitForResponse(r => r.url().endsWith('/api/v1/users/me/' + endpoint) && r.request().method() === 'GET');
        await page.getByRole('button', { name: label, exact: true }).click();
        const response = await received;
        if (response.status() !== 200 && !(['expertise','preferences'].includes(endpoint) && response.status() === 404)) throw Error(label + ': ' + response.status());
      }
      await page.screenshot({ path: path.join(out, name + '-achievements.png'), fullPage: true });
      await page.getByRole('button', { name: 'Academic Details', exact: true }).click();
      await page.getByRole('button', { name: 'Add Education', exact: true }).first().click();
      await page.getByPlaceholder('e.g. B.Tech, M.Sc, MBA, Ph.D').fill('BSc');
      await page.getByPlaceholder('University, college, or institution name').fill('Browser University ' + name);
      const saved = page.waitForResponse(r => r.url().endsWith('/api/v1/users/me/academic') && r.request().method() === 'POST');
      await page.getByRole('button', { name: 'Save', exact: true }).click();
      if ((await saved).status() !== 201) throw Error('Academic browser save failed');
      await page.reload();
      await page.getByRole('button', { name: 'Academic Details', exact: true }).click();
      await page.getByText('Browser University ' + name, { exact: true }).waitFor();
      if (pageErrors.length) throw Error(pageErrors.join('\n'));
      await context.close();
    }
    console.log('Desktop/mobile: login, photo, all six tabs and education save/reload passed.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error.message); process.exitCode = 1; });
