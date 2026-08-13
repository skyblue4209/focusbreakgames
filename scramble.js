/**
 * Word Scramble — 3 minutes.
 *
 * Puzzles are generated on the fly from a curated common-word
 * pool (data/scramble-words.json). Nobody has to write new
 * puzzles by hand for this to keep working.
 */

document.addEventListener('DOMContentLoaded', async () => {
  const wordEl = document.getElementById('scramble-word');
  const formEl = document.getElementById('scramble-form');
  const inputEl = document.getElementById('scramble-input');
  const skipBtn = document.getElementById('skip-btn');
  const digitsEl = document.getElementById('timer-digits');
  const fillEl = document.getElementById('timer-fill');
  const resultsEl = document.getElementById('results');
  const playEl = document.getElementById('play-area');
  const solvedStatEl = document.getElementById('stat-solved');
  const resultSolvedEl = document.getElementById('result-solved');
  const resultSkippedEl = document.getElementById('result-skipped');
  const resultAccuracyEl = document.getElementById('result-accuracy');

  let words = [];
  try {
    const res = await fetch('../data/scramble-words.json');
    words = await res.json();
  } catch (e) {
    words = ['planet', 'garden', 'coffee', 'window', 'pencil', 'silver', 'bridge', 'forest'];
  }

  let solved = 0;
  let skipped = 0;
  let currentWord = '';
  let lastWord = '';
  let gameOver = false;

  function shuffleLetters(word) {
    let letters = shuffleArray(word.split(''));
    let attempt = 0;
    while (letters.join('') === word && attempt < 8) {
      letters = shuffleArray(word.split(''));
      attempt += 1;
    }
    return letters.join('');
  }

  function nextWord() {
    let w = pickRandom(words);
    let guard = 0;
    while (w === lastWord && guard < 10) {
      w = pickRandom(words);
      guard += 1;
    }
    lastWord = w;
    currentWord = w;
    wordEl.textContent = shuffleLetters(w).toUpperCase();
    inputEl.value = '';
    inputEl.focus();
  }

  function updateStat() {
    solvedStatEl.textContent = String(solved);
  }

  formEl.addEventListener('submit', (e) => {
    e.preventDefault();
    if (gameOver) return;
    const guess = inputEl.value.trim().toLowerCase();
    if (!guess) return;

    if (guess === currentWord) {
      solved += 1;
      updateStat();
      nextWord();
    } else {
      inputEl.classList.add('shake');
      setTimeout(() => inputEl.classList.remove('shake'), 300);
    }
  });

  skipBtn.addEventListener('click', () => {
    if (gameOver) return;
    skipped += 1;
    nextWord();
  });

  function showResults() {
    playEl.classList.add('hidden');
    resultsEl.classList.remove('hidden');
    const total = solved + skipped;
    const accuracy = total > 0 ? Math.round((solved / total) * 100) : 0;
    resultSolvedEl.textContent = String(solved);
    resultSkippedEl.textContent = String(skipped);
    resultAccuracyEl.textContent = accuracy + '%';
  }

  const timer = new BreakTimer({
    durationSeconds: 180,
    digitsEl,
    fillEl,
    onComplete: () => {
      gameOver = true;
      inputEl.disabled = true;
      skipBtn.disabled = true;
      showResults();
    },
  });

  updateStat();
  timer.start();
  nextWord();
});
