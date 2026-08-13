/**
 * BreakTimer — the one piece of UI every game shares.
 *
 * It does not pause. It does not extend. When it hits zero it
 * calls onComplete exactly once and locks the game. This file
 * is intentionally the most carefully written file in the repo,
 * because the whole product's promise lives here.
 */

class BreakTimer {
  /**
   * @param {Object} opts
   * @param {number} opts.durationSeconds - total break length
   * @param {HTMLElement} opts.digitsEl - element to write "MM:SS" into
   * @param {HTMLElement} [opts.fillEl] - element whose width represents time left
   * @param {(secondsLeft:number)=>void} [opts.onTick]
   * @param {()=>void} opts.onComplete - called once, when time hits 0
   */
  constructor({ durationSeconds, digitsEl, fillEl, onTick, onComplete }) {
    this.duration = durationSeconds;
    this.secondsLeft = durationSeconds;
    this.digitsEl = digitsEl;
    this.fillEl = fillEl;
    this.onTick = onTick || (() => {});
    this.onComplete = onComplete || (() => {});
    this._intervalId = null;
    this._done = false;
  }

  start() {
    this._render();
    this._intervalId = setInterval(() => this._step(), 1000);
  }

  stop() {
    if (this._intervalId) clearInterval(this._intervalId);
    this._intervalId = null;
  }

  _step() {
    if (this._done) return;
    this.secondsLeft -= 1;
    if (this.secondsLeft <= 0) {
      this.secondsLeft = 0;
      this._render();
      this._finish();
      return;
    }
    this._render();
    this.onTick(this.secondsLeft);
  }

  _finish() {
    this._done = true;
    this.stop();
    this.onComplete();
  }

  _render() {
    const m = Math.floor(this.secondsLeft / 60);
    const s = this.secondsLeft % 60;
    const text = `${m}:${String(s).padStart(2, '0')}`;
    if (this.digitsEl) this.digitsEl.textContent = text;

    const urgent = this.secondsLeft <= 10 && this.secondsLeft > 0;
    if (this.digitsEl) this.digitsEl.classList.toggle('urgent', urgent || this.secondsLeft === 0);

    if (this.fillEl) {
      const pct = Math.max(0, (this.secondsLeft / this.duration) * 100);
      this.fillEl.style.width = pct + '%';
      this.fillEl.classList.toggle('urgent', urgent || this.secondsLeft === 0);
    }
  }
}

/** Fisher-Yates shuffle, used by Memory + Scramble + Word Chain */
function shuffleArray(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
