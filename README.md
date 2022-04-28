# Bracket

Keep track of NHL playoff picks and score

## Usage

1. Clone the repo
1. Run `npm i`
1. Execute `get-score`:

```
❯❯❯ node src/cli.mjs get-score
1. @vegasgeek 8
2. @nacin 6
3. @aaronjorbin 6
4. @thoronas 5
5. @tollmanz 5
```

## Updating

1. Add a directory for the current year to `config/`
1. Mimic the file format for `picks.hockey.mjs` and `results.hockey.mjs` for the current year

## Deploying to [blame.hockey](https://blame.hockey)

1. Push to master
1. Now automatically deploys to [blame.hockey](https://blame.hockey)
