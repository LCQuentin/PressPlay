import { chromium } from 'playwright';

let browser;
try { browser = await chromium.launch({ channel: 'chrome', headless: true }); }
catch { browser = await chromium.launch({ headless: true }); }
const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await context.newPage();
const errors = [];
let failed = false;
page.on('pageerror', e => errors.push(e.message));
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
const check = (condition, label) => { if (!condition) { console.error('FAIL:', label); failed = true; } };

await page.goto(new URL('../hub.html', import.meta.url).href);
await page.waitForTimeout(300);

// Neon Maze: third clear unlocks, then advances to level 4
const maze = await page.evaluate(() => {
  app.launch('MAZE');
  const g = app.currentGame;
  g.level = 3; g.state = 'PLAYING'; g.dots.clear(); g.dotCount = 0; g.checkLevelClear();
  return { state: g.state, ach: !!app.achievements.MAZE_CLEAR, level: g.level };
});
check(maze.state === 'LEVEL_CLEAR' && maze.ach, 'Maze clear achievement');
await page.waitForTimeout(2500);
const mazeNext = await page.evaluate(() => ({ level: app.currentGame.level, state: app.currentGame.state }));
check(mazeNext.level === 4 && mazeNext.state === 'PLAYING', 'Maze advances to level 4');
await page.evaluate(() => app.loadMenu());

// Tron: 3 round wins unlock and end the match
const tron = await page.evaluate(() => {
  app.launch('TRON');
  const g = app.currentGame;
  g.state = 'PLAYING'; g.wins1 = 2; g.p2.alive = false; g.endRound();
  const round = { state: g.state, wins1: g.wins1 };
  g.nextRound();
  return { round, state: g.state, ach: !!app.achievements.TRON_WIN };
});
check(tron.round.state === 'ROUND_OVER' && tron.round.wins1 === 3, 'Tron round win');
check(tron.state === 'GAMEOVER' && tron.ach, 'Tron match achievement');
await page.evaluate(() => { app.closeModal(); app.loadMenu(); });

// Lunar: safe pad landing scores and unlocks at 5
const lunar = await page.evaluate(() => {
  app.launch('LUNAR');
  const g = app.currentGame;
  const pad = g.pads[1];
  g.state = 'PLAYING'; g.landings = 4; g.x = pad.x; g.y = pad.y - 14; g.vx = 0; g.vy = 0.5; g.angle = 0; g.fuel = 80;
  g.touchdown(pad.y);
  return { state: g.state, landings: g.landings, score: g.score, ach: !!app.achievements.LUNAR_LAND };
});
check(lunar.state === 'LANDED' && lunar.landings === 5 && lunar.score > 0, 'Lunar landing');
check(lunar.ach, 'Lunar landing achievement');
await page.evaluate(() => app.loadMenu());

// Echo: correct pad, then sequence 10
const echo = await page.evaluate(() => {
  app.launch('ECHO');
  const g = app.currentGame;
  g.state = 'INPUT'; g.sequence = [0]; g.inputIndex = 0; g.round = 1; g.score = 0;
  g.selectPad(0);
  const first = { round: g.round, score: g.score, state: g.state };
  g.state = 'INPUT'; g.sequence = Array(9).fill(0); g.inputIndex = 0; g.round = 9;
  for (let i = 0; i < 9; i++) g.selectPad(0);
  return { first, round: g.round, ach: !!app.achievements.ECHO_10 };
});
check(echo.first.round === 2 && echo.first.score === 10 && echo.first.state === 'SHOWING', 'Echo correct pad');
check(echo.round === 10 && echo.ach, 'Echo sequence 10 achievement');
await page.evaluate(() => app.loadMenu());

// Defcon: wave clear and wave 5 achievement
const defcon = await page.evaluate(() => {
  app.launch('DEFCON');
  const g = app.currentGame;
  g.state = 'PLAYING'; g.wave = 5; g.toSpawn = 0; g.incoming = []; g.interceptors = []; g.explosions = [];
  g.update();
  return { state: g.state, wave: g.wave, ach: !!app.achievements.DEFCON_5 };
});
check(defcon.state === 'WAVE_CLEAR', 'Defcon wave clear');
check(defcon.ach, 'Defcon wave 5 achievement');
await page.evaluate(() => app.loadMenu());

// Hopper: 3 homes unlock, 5 homes clear the level
const hopper = await page.evaluate(() => {
  app.launch('HOPPER');
  const g = app.currentGame;
  g.state = 'PLAYING';
  for (let i = 0; i < 3; i++) { g.frogX = g.homeCols[i]; g.frogY = 0; g.tryHome(); }
  const three = { filled: g.filled, homes: g.homesReached, ach: !!app.achievements.HOPPER_HOME };
  for (let i = 3; i < 5; i++) { g.frogX = g.homeCols[i]; g.frogY = 0; g.tryHome(); }
  return { three, filled: g.filled, state: g.state };
});
check(hopper.three.filled === 3 && hopper.three.homes === 3, 'Hopper 3 homes');
check(hopper.three.ach, 'Hopper home achievement');
check(hopper.filled === 5 && hopper.state === 'LEVEL_CLEAR', 'Hopper level clear');

// Keyboard retry from a game over
const retry = await page.evaluate(() => {
  app.launch('LUNAR');
  const g = app.currentGame;
  g.state = 'GAMEOVER';
  app.input.press(' ');
  g.update();
  return g.state;
});
check(retry === 'WAITING', 'space retries after game over');
await page.evaluate(() => app.loadMenu());

// Real canvas click goes through the correct pad (Echo)
await page.evaluate(() => {
  app.launch('ECHO');
  const g = app.currentGame;
  g.startGame();
  g.state = 'INPUT';
  g.sequence = [0];
  g.inputIndex = 0;
  g.round = 1;
  g.score = 0;
});
const echoPad = await page.evaluate(() => {
  const g = app.currentGame;
  const { startX, startY, pad, gap } = g.getLayout();
  const i = g.sequence[0];
  const rect = g.canvas.getBoundingClientRect();
  return {
    x: rect.left + startX + (i % 2) * (pad + gap) + pad / 2,
    y: rect.top + startY + Math.floor(i / 2) * (pad + gap) + pad / 2
  };
});
await page.mouse.click(echoPad.x, echoPad.y);
await page.waitForTimeout(100);
check(await page.evaluate(() => app.currentGame.round === 2), 'Echo canvas click selects pad');
await page.evaluate(() => app.loadMenu());

// Real canvas click fires an interceptor (Defcon)
await page.evaluate(() => { app.launch('DEFCON'); app.currentGame.startWave(1); });
await page.mouse.click(400, 300);
await page.waitForTimeout(100);
check(await page.evaluate(() => app.currentGame.ammo === 19 && app.currentGame.interceptors.length === 1), 'Defcon canvas click fires');
await page.evaluate(() => app.loadMenu());

check(errors.length === 0, 'no console errors: ' + errors.join(' | '));
await browser.close();
if (failed) process.exit(1);
console.log('new games OK');
