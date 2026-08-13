/**
 * Memory Rush — 1 minute.
 *
 * Classic growing-sequence recall. A mistake doesn't end the
 * game, it just steps the difficulty back down — because this
 * game answers to the timer, not to a "game over" screen.
 */

document.addEventListener('DOMContentLoaded', () => {
  const TILE_COUNT = 9;
  const START_LENGTH = 3;
  const FLASH_MS = 420;
  const GAP_MS = 220;

  const grid = document.getElementById('memory-grid');
  const statusEl = document.getElementById('game-status');
  const digitsEl = document.getElementById('timer-digits');
  const fillEl = document.getElementById('timer-fill');
  const resultsEl = document.getElementById('results');
  const playEl = document.getElementById('play-area');
  const levelStatEl = document.getElementById('stat-level');
  const streakStatEl = document.getElementById('stat-streak');
  const resultLevelEl = document.getElementById('result-level');
  const resultStreakEl = document.getElementById('result-streak');

  const tiles = [];
  for (let i = 0; i < TILE_COUNT; i++) {
    const btn = document.createElement('button');
    btn.className = 'memory-tile';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Tile ' + (i + 1));
    btn.dataset.index = String(i);
    grid.appendChild(btn);
    tiles.push(btn);
  }

  let sequence = [];
  let playerStep = 0;
  let locked = true;
  let gameOver = false;
  let levelReached = 0;
  let currentStreak = 0;
  let bestStreak = 0;
  const pendingTimeouts = [];

  function after(ms, fn) {
    const id = setTimeout(() => {
      if (gameOver) return;
      fn();
    }, ms);
    pendingTimeouts.push(id);
  }

  function clearPending() {
    pendingTimeouts.forEach(clearTimeout);
    pendingTimeouts.length = 0;
  }

  function updateStats() {
    levelStatEl.textContent = String(levelReached);
    streakStatEl.textContent = String(bestStreak);
  }

  function litClass(el, cls, ms) {
    el.classList.add(cls);
    after(ms, () => el.classList.remove(cls));
  }

  function playSequence(seq, onDone) {
    locked = true;
    statusEl.textContent = 'Watch closely\u2026';
    seq.forEach((tileIndex, i) => {
      after(i * (FLASH_MS + GAP_MS), () => {
        litClass(tiles[tileIndex], 'lit', FLASH_MS);
      });
    });
    after(seq.length * (FLASH_MS + GAP_MS), () => {
      if (gameOver) return;
      locked = false;
      playerStep = 0;
      statusEl.textContent = 'Your turn';
    });
  }

  function startRound(length) {
    sequence = Array.from({ length }, () => Math.floor(Math.random() * TILE_COUNT));
    playSequence(sequence);
  }

  function handleTileClick(index) {
    if (locked || gameOver) return;
    const expected = sequence[playerStep];

    if (index === expected) {
      litClass(tiles[index], 'lit', 180);
      playerStep += 1;
      if (playerStep === sequence.length) {
        levelReached = Math.max(levelReached, sequence.length);
        currentStreak += 1;
        bestStreak = Math.max(bestStreak, currentStreak);
        updateStats();
        locked = true;
        statusEl.textContent = 'Cleared \u2014 watch closely\u2026';
        after(500, () => startRound(sequence.length + 1));
      }
    } else {
      litClass(tiles[index], 'wrong', 260);
      currentStreak = 0;
      updateStats();
      locked = true;
      statusEl.textContent = 'Not quite \u2014 resetting';
      const nextLength = Math.max(START_LENGTH, sequence.length - 1);
      after(600, () => startRound(nextLength));
    }
  }

  tiles.forEach((tile, i) => {
    tile.addEventListener('click', () => handleTileClick(i));
  });

  function showResults() {
    tiles.forEach((t) => (t.disabled = true));
    playEl.classList.add('hidden');
    resultsEl.classList.remove('hidden');
    resultLevelEl.textContent = String(levelReached);
    resultStreakEl.textContent = String(bestStreak);
  }

  const timer = new BreakTimer({
    durationSeconds: 60,
    digitsEl,
    fillEl,
    onComplete: () => {
      gameOver = true;
      clearPending();
      showResults();
    },
  });

  updateStats();
  timer.start();
  startRound(START_LENGTH);
});
