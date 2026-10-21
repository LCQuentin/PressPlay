import { chromium } from 'playwright';

const hub = new URL('../hub.html', import.meta.url).href;
let browser;
try {
  browser = await chromium.launch({ channel: 'chrome', headless: true });
} catch {
  browser = await chromium.launch({ headless: true });
}
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const errors = [];
let failed = false;

page.on('pageerror', e => errors.push('pageerror: ' + e.message));
page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });

const check = (condition, label) => {
  if (!condition) {
    console.error('FAIL:', label);
    failed = true;
  }
};

await page.goto(hub);
await page.waitForTimeout(300);
check(await page.locator('.menu-btn').count() === 12, 'twelve menu entries');

for (const game of ['PONG', 'BREAKOUT', 'SNAKE', 'INVADERS', 'TETRIS', 'ASTEROIDS', 'MAZE', 'TRON', 'LUNAR', 'ECHO', 'DEFCON', 'HOPPER']) {
  await page.click(`text=${game}`);
  await page.waitForTimeout(100);
  if (game === 'PONG') {
    await page.click('[data-i18n="start"]');
    await page.waitForTimeout(100);
  } else {
    await page.mouse.click(640, 400);
    await page.waitForTimeout(250);
  }
  check(await page.evaluate(() => !!app.currentGame), `${game} launches`);
  if (['MAZE', 'TRON', 'LUNAR', 'ECHO', 'DEFCON', 'HOPPER'].includes(game)) {
    check(await page.evaluate(() => app.currentGame.state !== 'WAITING'), `${game} starts`);
  }
  await page.keyboard.press('p');
  await page.waitForTimeout(60);
  check(await page.evaluate(() => app.paused), `${game} pauses`);
  await page.keyboard.press('p');
  await page.waitForTimeout(60);
  check(await page.evaluate(() => !app.paused), `${game} resumes`);
  await page.click('#back-btn');
  await page.waitForTimeout(80);
}

check(errors.length === 0, 'no console errors: ' + errors.join(' | '));
await browser.close();

if (failed) process.exit(1);
console.log('smoke OK');
