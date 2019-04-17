# Bracket

Keep track of NHL playoff picks and score

## Usage

1. Clone the repo
1. Run `npm i`
1. Execute `get-score`:

```
❯❯❯ node src/cli.js get-score
1. @vegasgeek 8
2. @nacin 6
3. @aaronjorbin 6
4. @thoronas 5
5. @tollmanz 5
```

## Updating

1. Add a new series to `config/{year}/matchups.json`. Each series needs to have a unique name. So far,
I'm just labelling them `{conference}{seriesNumber}` (e.g., `WC1`, `EC1`).
1. When the series is over, fill out the `results` property of the matchup
1. Add new competitors to `config/{year}/competitors.json`
1. Add new choices to `config/{year}/choices.json`

## Deploying to [blame.hockey](https://blame.hockey)

1. Push to master
1. Now automatically deploys to [blame.hockey](https://blame.hockey)
