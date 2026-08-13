# Focus Break Games (focusbreakgames.com)

Static site. No build step, no backend, no database, no accounts.

## Structure
```
index.html                      Homepage - break picker + game list
memory-game/index.html          Memory Rush (1 min)
word-scramble-game/index.html   Word Scramble (3 min)
word-chain-game/index.html      Word Chain (5 min)
study-break-games/index.html    SEO landing page
pomodoro-break-games/index.html SEO landing page
css/styles.css                  Shared design system
js/timer.js                     Shared BreakTimer class (the core mechanic)
js/memory.js  js/scramble.js  js/wordchain.js   Per-game logic
data/scramble-words.json        ~2,800 curated common words (4-8 letters) - Word Scramble puzzles + Word Chain seed words
data/valid-words.json           ~9,500 words - broad validation pool for Word Chain
```

## Deploy to Cloudflare Pages
1. Push this folder to a GitHub repo.
2. Cloudflare dashboard -> Workers & Pages -> Create -> Pages -> connect the repo.
3. Build command: none. Build output directory: `/` (repo root).
4. Add the custom domain `focusbreakgames.com` once purchased.

## Local preview
```
python3 -m http.server 8000
```
then open http://localhost:8000/

## Word data
Sourced from the `first20hours/google-10000-english` word-frequency list (public,
frequency-ranked common English words), split into two pools per the
"one raw source, two filtered pools" design:
- `scramble-words.json`: top common words, 4-8 letters - used for puzzles the
  player must recognize.
- `valid-words.json`: broader 3+ letter set - used only to validate Word Chain
  guesses, so real words are rarely wrongly rejected.

Known limitation: this is a frequency list, not a curated dictionary, so
`valid-words.json` contains a handful of noisy entries (abbreviations,
lowercased proper nouns). Fine for MVP validation; worth swapping for a
cleaner wordlist (e.g. an ENABLE-based list) before scaling traffic.

## What's intentionally NOT here
No accounts, no login, no leaderboard, no multiplayer, no "Play again" button,
no Pomodoro timer/dashboard. The whole product is: pick a length, play, get
sent back to focus. Everything above adds a reason to stay.

## Tested end-to-end (Playwright)
- Timer expiry locks input and shows results on all three games
- Word Chain: rejects wrong starting letter, rejects reused words, accepts
  valid dictionary words and updates the chain
- Word Scramble: Skip generates a new puzzle, stats update
- Memory Rush: both the correct-sequence (level up) and wrong-tile (level
  down) paths were verified with a deterministic Math.random() override
