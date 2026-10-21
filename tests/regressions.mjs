import { chromium } from 'playwright';

let browser;
try { browser = await chromium.launch({ channel: 'chrome', headless: true }); }
catch { browser = await chromium.launch({ headless: true }); }
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const errors = [];
let failed = false;
page.on('pageerror', e => errors.push(e.message));
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
const check = (condition, label) => { if (!condition) { console.error('FAIL:', label); failed = true; } };

await page.goto(new URL('../hub.html', import.meta.url).href);
await page.waitForTimeout(300);

// Pong options / 2P / difficulty
await page.evaluate(() => { app.openPongOptions(); app.setPongMode(2); app.startPong(); });
await page.waitForTimeout(100);
check(await page.evaluate(() => app.currentGame.twoPlayer === true), 'Pong 2P mode');
await page.evaluate(() => { app.openPongOptions(); app.setPongMode(1); app.setPongDifficulty('hard'); app.startPong(); });
await page.waitForTimeout(100);
check(await page.evaluate(() => app.currentGame.aiMaxSpeed === 12), 'Pong hard AI');
await page.evaluate(() => app.loadMenu());

// Breakout patterns, endless, achievement
const bo = await page.evaluate(() => {
  app.launch('BREAKOUT');
  const g = app.currentGame;
  const out = [];
  for (let l = 1; l <= 6; l++) { g.startLevel(l); out.push({ l, bricks: g.bricks.length, pattern: g.levelConfig(l).pattern }); }
  g.startLevel(5); g.state = 'PLAYING'; g.advanceLevel();
  return { out, level: g.level, ach: !!app.achievements.BREAKOUT_CLEAR, label: document.getElementById('msg-title').innerText };
});
check(bo.out.every(x => x.bricks > 0), 'Breakout levels have bricks');
check(bo.out[1].pattern === 'checker', 'Breakout level 2 pattern');
check(bo.out[5].pattern && bo.level === 6, 'Breakout endless');
check(bo.ach, 'Breakout clear achievement');
await page.evaluate(() => app.loadMenu());

// Invaders waves + boss + UFO
const inv = await page.evaluate(() => {
  app.launch('INVADERS');
  const g = app.currentGame;
  const first = { wave: g.wave, aliens: g.aliens.length };
  g.state = 'PLAYING'; g.ufoTimer = 0; g.update();
  const ufo = !!g.ufo;
  g.wave = 3; g.buildWave();
  const boss = g.aliens.find(a => a.boss);
  g.state = 'PLAYING';
  g.bullets = [{ x: boss.x + 4, y: boss.y + 4, w: 4, h: 10, active: true }];
  g.update();
  return { first, ufo, boss: !!boss, hp: boss.hp, aliens: g.aliens.length };
});
check(inv.first.wave === 1 && inv.first.aliens === 32, 'Invaders wave 1');
check(inv.ufo, 'Invaders UFO');
check(inv.boss && inv.hp === 11, 'Invaders boss damage');
await page.evaluate(() => app.loadMenu());

// Tetris next/hold/level
const tet = await page.evaluate(() => {
  app.launch('TETRIS');
  const g = app.currentGame;
  const next = g.nextType;
  g.state = 'PLAYING'; g.holdPiece();
  const held = g.heldType;
  g.lines = 9; g.grid[g.grid.length - 1] = Array(g.cols).fill(1); g.arenaSweep();
  return { next, held, level: g.level, ach: !!app.achievements.TETRIS_LVL2 };
});
check(tet.next && tet.held, 'Tetris next/hold');
check(tet.level === 2 && tet.ach, 'Tetris level 2 + achievement');
await page.evaluate(() => app.loadMenu());

// Snake obstacle + level
const snake = await page.evaluate(() => {
  app.launch('SNAKE');
  const g = app.currentGame;
  g.state = 'PLAYING'; g.score = 90; g.speed = 1; g.frameCount = 0; g.dir = { x: 1, y: 0 }; g.nextDir = { x: 1, y: 0 };
  g.food = { x: g.snake[0].x + 1, y: g.snake[0].y }; g.update();
  const level = g.level;
  const obstacles = g.obstacles.length;
  const head = g.snake[0];
  g.obstacles = [{ x: head.x + 1, y: head.y }]; g.speed = 1; g.frameCount = 0; g.dir = { x: 1, y: 0 }; g.nextDir = { x: 1, y: 0 }; g.update();
  return { level, obstacles, state: g.state };
});
check(snake.level === 2 && snake.obstacles === 3, 'Snake level/obstacles');
check(snake.state === 'GAMEOVER', 'Snake obstacle collision');
await page.evaluate(() => app.loadMenu());

// Asteroids wave + shield + UFO
const ast = await page.evaluate(() => {
  app.launch('ASTEROIDS');
  const g = app.currentGame;
  g.state = 'PLAYING'; g.asteroids = []; g.update();
  const wave = g.wave;
  g.state = 'PLAYING'; g.ufoTimer = 0; g.update();
  const ufo = !!g.ufo;
  g.pickups = [{ x: g.ship.x, y: g.ship.y, r: 12, life: 600 }]; g.update();
  const shield = g.shieldTimer;
  return { wave, ufo, shield };
});
check(ast.wave === 2, 'Asteroids next wave');
check(ast.ufo, 'Asteroids UFO');
check(ast.shield === 480, 'Asteroids shield pickup');
await page.evaluate(() => app.loadMenu());

// Save on back -> leaderboard + stats
await page.evaluate(() => { app.launch('SNAKE'); app.currentGame.score = 123; app.loadMenu(); });
const save = await page.evaluate(() => ({ top: app.getLeaderboard('SNAKE'), hi: app.getHighScore('SNAKE'), play: app.stats.plays.SNAKE }));
check(save.top.some(r => r.score === 123) && save.hi >= 123, 'Save on back / leaderboard');
check(save.play >= 1, 'Stats plays');

// Daily seeded + restore
const daily = await page.evaluate(() => {
  app.launchDaily();
  const date = app.daily.date;
  const game = app.daily.game;
  const seeded = Math.random !== app.realRandom;
  app.loadMenu();
  return { date, game, seeded, restored: Math.random === app.realRandom, daily: app.daily };
});
check(daily.seeded && daily.restored && daily.daily === null, 'Daily seed/restore');

// Resize Breakout
await page.evaluate(() => app.launch('BREAKOUT'));
const before = await page.evaluate(() => ({ x: app.currentGame.bricks[0].x, w: app.currentGame.bricks[0].w }));
await page.setViewportSize({ width: 1000, height: 700 });
await page.waitForTimeout(150);
const after = await page.evaluate(() => ({ x: app.currentGame.bricks[0].x, w: app.currentGame.bricks[0].w, canvas: app.canvas.width }));
check(Math.abs(after.x / before.x - 1000 / 1280) < 0.02, 'Breakout resize scale');
check(after.canvas === 1000, 'Resize canvas');
await page.evaluate(() => app.loadMenu());

// Edge unstick (Pong top inward)
await page.evaluate(() => { app.openPongOptions(); app.setPongMode(1); app.startPong(); });
await page.waitForTimeout(80);
const edge = await page.evaluate(() => {
  const g = app.currentGame; g.state = 'PLAYING';
  g.ball = { x: 640, y: 0, vx: 3, vy: 4, speed: 5, edgeTimer: 0 };
  g.update();
  return { y: g.ball.y, vy: g.ball.vy };
});
check(edge.vy > 0 && edge.y > 0, 'Pong edge inward leaves');
await page.evaluate(() => app.loadMenu());

// Touch controls (separate context)
const touchContext = await browser.newContext({ hasTouch: true, viewport: { width: 900, height: 780 } });
const touchPage = await touchContext.newPage();
const touchErrors = [];
touchPage.on('pageerror', e => touchErrors.push(e.message));
touchPage.on('console', m => { if (m.type() === 'error') touchErrors.push(m.text()); });
await touchPage.goto(new URL('../hub.html', import.meta.url).href);
await touchPage.waitForTimeout(300);
await touchPage.tap('text=SNAKE');
await touchPage.waitForTimeout(120);
check(await touchPage.evaluate(() => app.touchVisible && getComputedStyle(document.getElementById('touch-controls')).display === 'flex'), 'touch controls show');
check(await touchPage.evaluate(() => getComputedStyle(document.getElementById('touch-action-wrap')).visibility === 'hidden'), 'snake action hidden');
await touchPage.tap('.touch-up');
await touchPage.waitForTimeout(150);
check(await touchPage.evaluate(() => app.currentGame.state === 'PLAYING'), 'touch starts snake');
await touchPage.tap('#back-btn');
await touchPage.waitForTimeout(100);
await touchPage.tap('text=TETRIS');
await touchPage.waitForTimeout(100);
check(await touchPage.evaluate(() => document.getElementById('touch-hold').style.display === 'block'), 'tetris hold visible');
await touchPage.tap('.touch-up');
await touchPage.waitForTimeout(100);
check(await touchPage.evaluate(() => app.currentGame.state === 'PLAYING'), 'touch starts tetris');
await touchContext.close();
check(touchErrors.length === 0, 'touch console errors: ' + touchErrors.join(' | '));

check(errors.length === 0, 'no console errors: ' + errors.join(' | '));
await browser.close();
if (failed) process.exit(1);
console.log('regressions OK');
