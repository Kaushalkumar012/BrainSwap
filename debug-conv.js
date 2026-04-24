const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1440, height: 900 },
  });
  const page = await browser.newPage();

  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });
  await page.waitForSelector('#email');
  await page.click('#email', { clickCount: 3 });
  await page.type('#email', 'aarav.patel@example.com');
  await page.click('#password', { clickCount: 3 });
  await page.type('#password', 'password123');
  await page.click('button[type="submit"]');
  await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {});
  await new Promise(r => setTimeout(r, 2000));

  await page.goto('http://localhost:5173/messages', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  // Check store state
  const storeData = await page.evaluate(() => {
    const appStore = window.__zustand_app_store__;
    return {
      conversations: appStore?.getState?.()?.conversations ?? 'not found',
      matches: appStore?.getState?.()?.matches ?? 'not found',
    };
  });
  console.log('Store data:', JSON.stringify(storeData, null, 2));

  // Check API directly
  const token = await page.evaluate(() => localStorage.getItem('auth-storage') || sessionStorage.getItem('auth-storage'));
  console.log('Auth storage:', token?.substring(0, 200));

  await page.screenshot({ path: 'debug-conv.png' });
  console.log('debug-conv.png saved');
  await browser.close();
})();
