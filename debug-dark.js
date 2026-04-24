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

  // Enable dark mode
  await page.evaluate(() => document.documentElement.classList.add('dark'));

  await page.goto('http://localhost:5173/messages', { waitUntil: 'networkidle2' });
  await page.evaluate(() => document.documentElement.classList.add('dark'));
  await new Promise(r => setTimeout(r, 1500));

  const input = await page.$('input[placeholder*="Message"]');
  if (input) {
    await input.type('Hey! Want to swap skills?');
    await page.keyboard.press('Enter');
    await new Promise(r => setTimeout(r, 2500));
  }

  await page.screenshot({ path: path.join(__dirname, 'debug-dark.png') });
  console.log('debug-dark.png saved');
  await browser.close();
})();
