import pandas as pd
import os
import numpy as np
import json
from datetime import datetime, timedelta

import sys
if sys.version_info < (3, 12):
    raise Exception("Python 3.12 or higher is required.")

# File paths
stats_file = "docs/OHL_STATS/LeagueStats_2024_2025.csv"
schedule_file = "docs/OHL_SCHEDULE/OHL_Schedule_2024_2025.csv"
output_dir = "docs/JSON_DATA"

# Ensure output directory exists
os.makedirs(output_dir, exist_ok=True)

def load_data(stats_file, schedule_file):
    """Load player stats and schedule data."""
    if not os.path.exists(stats_file) or not os.path.exists(schedule_file):
        raise FileNotFoundError("One or both data files are missing.")
    stats_df = pd.read_csv(stats_file)
    schedule_df = pd.read_csv(schedule_file)
    return stats_df, schedule_df

def calculate_team_stats(stats_df):
    """Aggregate player stats to calculate team-level stats."""
    team_stats = stats_df.groupby('Team').agg({
        'G': 'sum',
        'A': 'sum',
        'PTS': 'sum',
        'Pts/G': 'mean',
        'PPG': 'sum',
        'PPA': 'sum',
        'PIM': 'sum',
        'RNK': 'mean'
    }).rename(columns={
        'G': 'total_goals',
        'A': 'total_assists',
        'PTS': 'total_points',
        'Pts/G': 'avg_points_per_game',
        'PPG': 'total_powerplay_goals',
        'PPA': 'total_powerplay_assists',
        'PIM': 'total_penalty_minutes',
        'RNK': 'avg_rank'
    })
    return team_stats

def calculate_team_records(schedule_df):
    """Calculate team records based on schedule data."""
    team_records = {}
    for _, row in schedule_df.iterrows():
        home_team = row['HomeTeam']
        away_team = row['AwayTeam']
        home_goals = row['HomeGoals']
        away_goals = row['AwayGoals']

        for team, goals_for, goals_against in [(home_team, home_goals, away_goals), (away_team, away_goals, home_goals)]:
            if team not in team_records:
                team_records[team] = {'wins': 0, 'losses': 0, 'total_games': 0}
            team_records[team]['total_games'] += 1
            if goals_for > goals_against:
                team_records[team]['wins'] += 1
            else:
                team_records[team]['losses'] += 1

    return team_records

def predict_game_winner(home_team, away_team, team_stats, team_records):
    """Predict the winner of a game based on team stats and records."""
    home_stats = team_stats.loc[home_team]
    away_stats = team_stats.loc[away_team]

    home_record = team_records.get(home_team, {'wins': 0, 'losses': 0, 'total_games': 1})
    away_record = team_records.get(away_team, {'wins': 0, 'losses': 0, 'total_games': 1})

    home_strength = (
        home_stats['total_points'] + home_stats['avg_rank'] * 10 +
        (home_record['wins'] / home_record['total_games']) * 100
    )
    away_strength = (
        away_stats['total_points'] + away_stats['avg_rank'] * 10 +
        (away_record['wins'] / away_record['total_games']) * 100
    )

    total_strength = home_strength + away_strength
    home_prob = home_strength / total_strength
    away_prob = away_strength / total_strength

    home_odds = f"+{int(100 * (1 - home_prob) / home_prob)}" if home_prob < 0.5 else f"-{int(100 / home_prob)}"
    away_odds = f"+{int(100 * (1 - away_prob) / away_prob)}" if away_prob < 0.5 else f"-{int(100 / away_prob)}"

    winner = home_team if home_prob > away_prob else away_team

    return {
        "home_team": home_team,
        "away_team": away_team,
        "winner": winner,
        "odds": {
            home_team: home_odds,
            away_team: away_odds
        }
    }

def process_games_for_date(selected_date, stats_df, schedule_df, team_stats, team_records):
    """Process all games on the selected date and save predictions as JSON."""
    games_on_date = schedule_df[schedule_df['Date'] == selected_date]
    if games_on_date.empty:
        return

    all_predictions = []
    for _, game in games_on_date.iterrows():
        home_team = game['HomeTeam']
        away_team = game['AwayTeam']

        prediction = predict_game_winner(home_team, away_team, team_stats, team_records)
        all_predictions.append(prediction)

    output_path = os.path.join(output_dir, f"{selected_date}.json")
    with open(output_path, 'w') as f:
        json.dump(all_predictions, f, indent=4)

    print(f"Predictions saved to {output_path}")

def main():
    start_date = datetime(2025, 1, 29)
    end_date = datetime.now() + timedelta(days=1)

    stats_df, schedule_df = load_data(stats_file, schedule_file)
    team_stats = calculate_team_stats(stats_df)
    team_records = calculate_team_records(schedule_df)

    # Process games from January 29, 2025, to tomorrow
    current_date = start_date
    while current_date <= end_date:
        date_str = current_date.strftime("%Y-%m-%d")
        process_games_for_date(date_str, stats_df, schedule_df, team_stats, team_records)
        current_date += timedelta(days=1)

if __name__ == "__main__":
    main()
