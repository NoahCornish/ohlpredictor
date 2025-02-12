import json
import os

# Load the accuracy.json file from your specific file path
file_path = "docs/JSON_DATA/accuracy.json"
output_file = "docs/JSON_DATA/profit_summary.json"

with open(file_path, "r") as file:
    data = json.load(file)

# Initialize overall profit calculation variables
total_bet = 0
total_profit = 0

# Daily profit calculation
daily_profits = []

# Iterate over each daily accuracy record
for daily_record in data['daily_accuracies']:
    daily_bet = 0
    daily_profit = 0
    date = daily_record['date']
    
    for game in daily_record['game_details']:
        odds = game['odds']
        predicted_winner = game['predicted_winner']
        actual_winner = game['actual_winner']
        
        # Ensure the game has a winner (not "Not Started")
        if actual_winner != "Not Started" and predicted_winner in odds:
            # Calculate profit/loss for a $1 bet on the favorite
            favorite_odds = odds[predicted_winner]
            bet_amount = 10
            daily_bet += bet_amount
            total_bet += bet_amount
            
            if actual_winner == predicted_winner:
                if favorite_odds.startswith('-'):
                    # American odds calculation for favorites (negative odds)
                    profit = bet_amount / (abs(int(favorite_odds)) / 100)
                else:
                    # American odds calculation for underdogs (positive odds)
                    profit = bet_amount * (int(favorite_odds) / 100)
                daily_profit += profit
                total_profit += profit
            else:
                # Lost bet, subtract the bet amount
                daily_profit -= bet_amount
                total_profit -= bet_amount

    # Append daily result
    daily_profits.append({
        "date": date,
        "daily_bet": round(daily_bet, 2),
        "daily_profit": round(daily_profit, 2)
    })

# Prepare summary data
summary = {
    "total_bet": round(total_bet, 2),
    "total_profit": round(total_profit, 2),
    "profit_status": "+" if total_profit >= 0 else "-",
    "daily_summary": daily_profits
}

# Save the summary to profit_summary.json
with open(output_file, "w") as outfile:
    json.dump(summary, outfile, indent=4)

print(f"Profit summary saved to {output_file}")
