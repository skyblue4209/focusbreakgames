/**
 * Word Chain — 5 minutes.
 *
 * Each word must start with the last letter of the word before
 * it. Validation uses the broad word pool (data/valid-words.json)
 * so a real word is almost never rejected as "invalid" \u2014 the
 * scramble pool (data/scramble-words.json) only supplies the
 * common, recognizable starting word.
 */

document.addEventListener('DOMContentLoaded', async () => {
  const currentWordEl = document.getElementById('current-word');
  const trailEl = document.getElementById('chain-trail');
  const formEl = document.getElementById('chain-form');
  const inputEl = document.getElementById('chain-input');
  const errorEl = document.getElementById('inline-error');
  const digitsEl = document.getElementById('timer-digits');
  const fillEl = document.getElementById('timer-fill');
  const resultsEl = document.getElementById('results');
  const playEl = document.getElementById('play-area');
  const chainStatEl = document.getElementById('stat-chain');
  const resultChainEl = document.getElementById('result-chain');
  const resultStreakEl = document.getElementById('result-streak');

  let validSet = new Set();
  let seedWords = [];
  try {
    const [validRes, seedRes] = await Promise.all([
      fetch('../data/valid-words.json'),
      fetch('../data/scramble-words.json'),
    ]);
    validSet = new Set(await validRes.json());
    seedWords = (await seedRes.json()).filter((w) => w.length >= 4);
  } catch (e) {
    validSet = new Set(['apple', 'elephant', 'tiger', 'river', 'north']);
    seedWords = ['apple', 'river', 'tiger'];
  }

  let currentWord = pickRandom(seedWords.length ? seedWords : ['apple']);
  const used = new Set([currentWord]);
  let chainLength = 0;
  let gameOver = false;

  currentWordEl.textContent = currentWord.toUpperCase();

  function lastLetter(word) {
    return word[word.length - 1].toLowerCase();
  }

  function addChip(word) {
    const chip = document.createElement('span');
    chip.className = 'chain-chip';
    chip.textContent = word;
    trailEl.appendChild(chip);
    trailEl.scrollTop = trailEl.scrollHeight;
  }

  function setError(msg) {
    errorEl.textContent = msg;
  }

  function updateStat() {
    chainStatEl.textContent = String(chainLength);
  }

  formEl.addEventListener('submit', (e) => {
    e.preventDefault();
    if (gameOver) return;

    const raw = inputEl.value.trim().toLowerCase();
    setError('');
    if (!raw) return;

    const needed = lastLetter(currentWord);

    if (raw.length < 3) {
      setError('Needs to be at least 3 letters.');
      return;
    }
    if (raw[0] !== needed) {
      setError(`Next word has to start with "${needed.toUpperCase()}".`);
      return;
    }
    if (used.has(raw)) {
      setError('Already used that one \u2014 try a different word.');
      return;
    }
    if (!validSet.has(raw)) {
      setError('Not in the word list \u2014 try another word.');
      return;
    }

    used.add(raw);
    currentWord = raw;
    chainLength += 1;
    updateStat();
    addChip(raw);
    currentWordEl.textContent = raw.toUpperCase();
    inputEl.value = '';
    inputEl.focus();
  });

  function showResults() {
    playEl.classList.add('hidden');
    resultsEl.classList.remove('hidden');
    resultChainEl.textContent = String(chainLength);
    resultStreakEl.textContent = String(chainLength);
  }

  const timer = new BreakTimer({
    durationSeconds: 300,
    digitsEl,
    fillEl,
    onComplete: () => {
      gameOver = true;
      inputEl.disabled = true;
      showResults();
    },
  });

  updateStat();
  timer.start();
  inputEl.focus();
});
