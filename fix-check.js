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
  await new Promise(r => setTimeout(r, 3000));

  await page.goto('http://localhost:5173/messages', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 3000));

  // Screenshot after load - light
  await page.screenshot({ path: path.join(__dirname, 'fix-light-1.png') });
  console.log('fix-light-1.png - initial load');

  // Send messages
  const input = await page.$('input[placeholder*="Message"]');
  if (input) {
    await input.type('Hey! Want to swap skills?');
    await page.keyboard.press('Enter');
    await new Promise(r => setTimeout(r, 3000));
    await input.type('I can teach you React!');
    await page.keyboard.press('Enter');
    await new Promise(r => setTimeout(r, 3000));
  }

  await page.screenshot({ path: path.join(__dirname, 'fix-light-2.png') });
  console.log('fix-light-2.png - with messages');

  // Dark mode
  await page.evaluate(() => document.documentElement.classList.add('dark'));
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(__dirname, 'fix-dark.png') });
  console.log('fix-dark.png - dark mode');

  await browser.close();
})();
