document.addEventListener('DOMContentLoaded', () => {
    const totalAccuracyEl = document.getElementById('total-accuracy');
    const accuracyListEl = document.getElementById('accuracy-data');
    const dateSelectEl = document.getElementById('date-select');

    fetch('docs/JSON_DATA/accuracy.json')
        .then(response => response.json())
        .then(data => {
            if (!data.daily_accuracies || data.daily_accuracies.length === 0) {
                totalAccuracyEl.textContent = "No accuracy data available.";
                return;
            }

            // ✅ Show total accuracy only for completed games
            totalAccuracyEl.textContent = `${data.total_accuracy.toFixed(1)}% (${data.total_correct}/${data.total_games} correct)`;

            data.daily_accuracies.forEach(item => {
                const option = document.createElement('option');
                option.value = item.date;
                option.textContent = item.date;
                dateSelectEl.appendChild(option);
            });

            dateSelectEl.addEventListener('change', (event) => {
                const selectedDate = event.target.value;
                displayAccuracyForDate(selectedDate, data.daily_accuracies);
            });

            displayAccuracyForDate(data.daily_accuracies[0].date, data.daily_accuracies);
        })
        .catch(error => {
            console.error('Error loading accuracy data:', error);
            totalAccuracyEl.textContent = "Error loading data.";
        });

    function displayAccuracyForDate(date, dailyAccuracies) {
        accuracyListEl.innerHTML = '';
        const selectedData = dailyAccuracies.find(item => item.date === date);

        if (selectedData) {
            const listItem = document.createElement('li');
            listItem.innerHTML = `<strong>${selectedData.date}:</strong> ${selectedData.accuracy.toFixed(1)}% (${selectedData.correct_predictions}/${selectedData.total_games} correct)`;

            if (selectedData.game_details && selectedData.game_details.length > 0) {
                const gameDetails = document.createElement('ul');

                selectedData.game_details.forEach(game => {
                    const gameItem = document.createElement('li');
                    const isCorrect = game.predicted_winner === game.actual_winner;
                    gameItem.classList.add(isCorrect ? 'correct' : 'incorrect');

                    const isGameNotStarted = game.actual_winner === "Not Started";

                    gameItem.innerHTML = `
                        <div class="game-row">
                            <span class="away-team">${game.away_team}</span>
                            <span class="vs">vs</span>
                            <span class="home-team">${game.home_team}</span>
                        </div>
                        <div class="prediction-actual">
                            ${isGameNotStarted 
                                ? `<div class="game-status">GAME NOT STARTED/FINISHED</div>` 
                                : `
                                    <div><strong>Predicted:</strong> ${game.predicted_winner}</div>
                                    <div><strong>Actual:</strong> ${game.actual_winner}</div>
                                `
                            }
                        </div>
                    `;
                    gameDetails.appendChild(gameItem);
                });

                listItem.appendChild(gameDetails);
            }
            accuracyListEl.appendChild(listItem);
        }
    }
});
