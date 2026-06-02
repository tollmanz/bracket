# Bracket

Retro arcade scoreboard for our annual NHL Stanley Cup playoff pick 'em. Every season we have data for lives in one place, with a year selector to switch between them.

Each player predicts the winner and game count of every series. Correct winner earns the round's base points; nailing the game count too adds a bonus. See `data/rules.json`.

## Running

```
nvm use
npm install
npm start
```

Then open http://localhost:8080. A static server is required because the page loads the JSON in `data/` via `fetch`; opening `index.html` directly from the filesystem will not work.

## Layout

```
index.html         page shell (header, year selector, marquee)
assets/styles.css   pixel-art styling
assets/app.js       loads data/, computes scores, renders the year
data/
  index.json        list of years + status/champion, default year
  rules.json        scoring rules (base points per round, games bonus)
  people.json       canonical player ids, display names, aliases
  <year>.json       one file per season (facts only)
sources/            raw inputs the data was built from (provenance)
  legacy/<year>/    original tollmanz/bracket files (picks + winners)
  2025/             Projects/picks markdown
  2026/picks.md     current season picks
  rules.md          original scoring write-up
scripts/
  verify-data.mjs   recomputes scores and checks documented totals
  import-build.mjs  one-time importer that produced data/ from sources/
```

`data/` is canonical and drives the app. `sources/` is kept for provenance.

## Data model

Year files store facts only. Points and standings are computed at render time from
`rules.json`, so nothing derived is stored and totals cannot drift from the source.

```jsonc
{
  "year": 2026,
  "status": "in-progress",        // or "complete"
  "champion": "VGK",              // final winner, null while in progress
  "matchupsReconstructed": false, // true for 2018-2022 (opponents recovered via research)
  "source": "...",
  "rounds": [
    {
      "round": 1,
      "name": "Round 1",
      "series": [
        {
          "teams": ["COL", "LAK"],
          "result": { "status": "final", "winner": "COL", "games": 4 },
          "picks": [
            { "person": "zack", "team": "COL", "games": 6 }
          ]
        }
      ]
    }
  ]
}
```

Team codes are canonical 3-letter NHL abbreviations (`TBL`, `CGY`, `WSH`).

## Adding a season

1. Add `data/<year>.json` following the model above
2. Add the year to `data/index.json`
3. Add any new players to `data/people.json`
4. `node scripts/verify-data.mjs`

## Data sources

- 2026: the current season's `picks.md`
- 2025: the `Projects/picks` markdown pool
- 2018-2022: the original `tollmanz/bracket` repo. Those files recorded only the
  winning team and game count per round, so series opponents were reconstructed from
  historical playoff results and verified against the recorded winners and the known
  Stanley Cup champion. 2022 source data covers only rounds 1 and 2.

Players who appear only in the early years (`@nacin`, `@brothernacin`, `@fathernacin`,
`@thoronas`, `@cklosowski`) are stored under their handle; edit `data/people.json` to
give them a display name.
