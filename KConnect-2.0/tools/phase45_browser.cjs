const { chromium } = require('../.runtime/browser/node_modules/playwright-core');
const path = require('path');
const fs = require('fs');
(async () => {
  const browser = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true });
  const base = process.env.P45_URL, ids = JSON.parse(process.env.P45_IDS);
  const out = path.join(__dirname, '../artifacts/phase45-browser'); fs.mkdirSync(out, { recursive: true });
  async function login(page, email, destination) {
    await page.goto(base + '/login');
    await page.locator('input[type=email]').fill(email);
    await page.locator('input[type=password]').fill(process.env.P45_PASSWORD);
    await page.locator('button[type=submit]').click(); await page.waitForURL('**' + destination);
  }
  async function visit(page, url, api) {
    const result = page.waitForResponse(r => new URL(r.url()).pathname === '/api/v1/' + api && r.request().method() === 'GET');
    await page.goto(base + url); if ((await result).status() !== 200) throw Error(url + ' API failed');
  }
  try {
    for (const [name, viewport] of [['desktop', { width: 1440, height: 1000 }], ['mobile', { width: 390, height: 844 }]]) {
      const context = await browser.newContext({ viewport, serviceWorkers: 'block' }); const page = await context.newPage();
      const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('dialog', dialog => dialog.accept());
      await login(page, 'super_admin@example.test', '/admin/dashboard');
      for (const section of ['dashboard','users','organisations','categories','opportunities']) await visit(page, '/admin/' + section, 'admin/' + section);
      await visit(page, '/admin/categories', 'admin/categories');
      await page.getByRole('button', { name: 'Add Category', exact: true }).first().click();
      const category = 'Browser Category ' + name + ' ' + Date.now();
      await page.getByPlaceholder('e.g. Data Science, Leadership').fill(category);
      let response = page.waitForResponse(r => r.url().endsWith('/admin/categories') && r.request().method() === 'POST');
      await page.getByRole('button', { name: 'Save', exact: true }).click();
      if ((await response).status() !== 201) throw Error('Category save failed');
      await page.getByText(category, { exact: true }).waitFor();
      await page.screenshot({ path: path.join(out, name + '-categories.png'), fullPage: true });
      await visit(page, '/admin/opportunities/' + ids[name] + '/edit', 'admin/opportunities/' + ids[name]);
      await page.getByPlaceholder('e.g. Guest Lecture on Machine Learning').fill('Published Workshop ' + name);
      response = page.waitForResponse(r => r.url().endsWith('/admin/opportunities/' + ids[name]) && r.request().method() === 'PUT');
      await page.getByRole('button', { name: 'Save Draft', exact: true }).click();
      if ((await response).status() !== 200) throw Error('Draft update failed');
      await page.reload(); await page.getByPlaceholder('e.g. Guest Lecture on Machine Learning').waitFor();
      if (await page.getByPlaceholder('e.g. Guest Lecture on Machine Learning').inputValue() !== 'Published Workshop ' + name) throw Error('Draft not persisted');
      await page.getByRole('button', { name: 'Preview', exact: true }).click();
      await page.getByRole('heading', { name: 'Preview Opportunity', exact: true }).waitFor();
      await page.screenshot({ path: path.join(out, name + '-preview.png'), fullPage: true });
      await page.getByRole('heading', { name: 'Preview Opportunity', exact: true }).locator('..').getByRole('button').click();
      response = page.waitForResponse(r => r.url().endsWith('/' + ids[name] + '/publish') && r.request().method() === 'POST');
      await page.getByRole('button', { name: 'Publish Opportunity', exact: true }).click();
      if ((await response).status() !== 200) throw Error('Publish failed');
      await page.waitForURL('**/admin/opportunities');
      if (errors.length) throw Error(errors.join('\n')); await context.close();
      const member = await browser.newContext({ viewport, serviceWorkers: 'block' }); const listing = await member.newPage();
      await login(listing, 'sme@example.test', '/dashboard');
      await visit(listing, '/opportunities', 'opportunities');
      await listing.getByText('Published Workshop ' + name, { exact: true }).waitFor();
      const detail = listing.waitForResponse(r => /\/api\/v1\/opportunities\/[0-9a-f-]+$/.test(r.url()));
      await listing.getByRole('button', { name: 'View Details', exact: true }).first().click();
      if ((await detail).status() !== 200) throw Error('Member detail failed');
      await listing.getByRole('heading', { name: /Published Workshop/, level: 2 }).waitFor();
      await listing.screenshot({ path: path.join(out, name + '-public-detail.png'), fullPage: true });
      await member.close();
    }
    console.log('Desktop/mobile admin lists, category save, opportunity edit/reload/preview/publish and member browsing passed.');
  } finally { await browser.close(); }
})().catch(e => { console.error(e.message); process.exitCode = 1; });
