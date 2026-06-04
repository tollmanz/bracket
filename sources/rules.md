# Playoff Bracket Prediction Scoring System

## Overview

Players make predictions for each round of playoff matchups before the tournament begins. Each player submits picks for all rounds regardless of the results of previous rounds.

## Scoring Rules

1. Points are awarded for correctly predicting the team that wins a series.
2. Points are awarded only after a series is completed.
3. A bonus of 2 points is awarded for predicting both the correct team AND the correct number of games in the series.
4. Total score is calculated by adding points awarded for each series.

## Point Structure

Points awarded increase with each round of the tournament:

| Round | Points for Correct Team |
| :---: | :---------------------: |
|   1   |            1            |
|   2   |            3            |
|   3   |            5            |
|   4   |            7            |

Each series is scored separately. The score for the round is the sum of scores for each series in the round. The total score is the sum of the scores for each round.

## Examples

- If Player A predicts Team X to win in 6 games, and Team X wins in 6 games:
  - Player A receives base points + bonus = full points for that series
- If Player A predicts Team X to win in 6 games, but Team X wins in 7 games:
  - Player A receives only the base points for that series (no bonus)
- If Player A predicts Team X to win, but Team Y wins instead:
  - Player A receives 0 points for that series

## Submission and Tracking

The system should track:

1. Each player's picks for every matchup
2. The actual results of each matchup
3. Running point totals for all players throughout the tournament
