import pandas as pd
import json
import os
from datetime import datetime

# Paths
schedule_path = 'docs/OHL_SCHEDULE/OHL_Schedule_2024_2025.csv'
predictions_folder = 'docs/JSON_DATA'
output_file = 'docs/JSON_DATA/accuracy.json'

# Load schedule
schedule_df = pd.read_csv(schedule_path)
schedule_df['Date'] = pd.to_datetime(schedule_df['Date'])
filtered_schedule = schedule_df[schedule_df['Date'] >= '2025-01-29']

# Accuracy calculation
accuracy_data = []
total_correct = 0
total_games = 0

for date in filtered_schedule['Date'].unique():
    date_str = pd.to_datetime(date).strftime('%Y-%m-%d')
    prediction_file_path = f'{predictions_folder}/{date_str}.json'

    if os.path.exists(prediction_file_path):
        with open(prediction_file_path, 'r') as file:
            predictions = json.load(file)

        games_today = filtered_schedule[(filtered_schedule['Date'] == date)]
        correct_predictions = 0
        games_count = 0
        game_details = []  # ✅ Collect game details here

        for _, game in games_today.iterrows():
            predicted_game = next((p for p in predictions if p['home_team'] == game['HomeTeam'] and p['away_team'] == game['AwayTeam']), None)
            
            if predicted_game:
                # ✅ Check if the game hasn't started
                if (game['HomeGoals'] == 0 and game['AwayGoals'] == 0):
                    actual_winner = "Not Started"
                else:
                    actual_winner = game['HomeTeam'] if game['HomeGoals'] > game['AwayGoals'] else game['AwayTeam']
                    games_count += 1  # ✅ Count only completed games
                    total_games += 1  # ✅ Global count for total accuracy

                    if predicted_game['winner'] == actual_winner:
                        correct_predictions += 1
                        total_correct += 1

                # ✅ Add game details, even if not started
                game_details.append({
                    'home_team': game['HomeTeam'],
                    'away_team': game['AwayTeam'],
                    'predicted_winner': predicted_game['winner'],
                    'actual_winner': actual_winner,
                    'home_score': game['HomeGoals'],
                    'away_score': game['AwayGoals']
                })

        if games_count > 0:
            accuracy_percent = round((correct_predictions / games_count) * 100, 1)
        else:
            accuracy_percent = 0  # ✅ If no games played, accuracy is 0%

        accuracy_data.append({
            'date': date_str,
            'accuracy': accuracy_percent,
            'correct_predictions': correct_predictions,
            'total_games': games_count,  # ✅ Only completed games count here
            'game_details': game_details
        })

# ✅ Final summary only counts completed games
summary = {
    'daily_accuracies': accuracy_data,
    'total_accuracy': round((total_correct / total_games) * 100, 1) if total_games > 0 else 0,
    'total_correct': total_correct,
    'total_games': total_games  # ✅ Only includes completed games
}

with open(output_file, 'w') as outfile:
    json.dump(summary, outfile, indent=4)

print(f"Accuracy data saved to {output_file}")
