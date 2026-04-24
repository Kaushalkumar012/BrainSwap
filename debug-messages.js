const puppeteer = require('puppeteer');
const path = require('path');

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
  await page.screenshot({ path: path.join(__dirname, 'debug-messages.png') });
  console.log('debug-messages.png saved');
  await browser.close();
})();
