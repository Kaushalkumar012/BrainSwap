const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900'],
    defaultViewport: { width: 1440, height: 900 },
  });

  const page = await browser.newPage();

  // Login
  console.log('Logging in...');
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });
  await page.waitForSelector('#email', { timeout: 10000 });
  await page.click('#email', { clickCount: 3 });
  await page.type('#email', 'aarav.patel@example.com');
  await page.click('#password', { clickCount: 3 });
  await page.type('#password', 'password123');
  await page.click('button[type="submit"]');
  await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {});
  await new Promise(r => setTimeout(r, 2000));

  // Go to dashboard
  await page.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));

  // Open chatbot
  await page.click('button[aria-label="Open chatbot"]');
  await new Promise(r => setTimeout(r, 1200));

  // Type a message so it looks active
  await page.type('input[placeholder="Kuch bhi poochiye..."]', 'How do matches work?');
  await new Promise(r => setTimeout(r, 500));

  // Screenshot
  await page.screenshot({ path: path.join(__dirname, 'screenshots', 'chatbot.png'), fullPage: false });
  console.log('✅ chatbot.png saved!');

  await browser.close();
})();
