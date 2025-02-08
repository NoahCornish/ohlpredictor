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

            totalAccuracyEl.textContent = `${data.total_accuracy.toFixed(1)}% (${data.total_correct}/${data.total_games} correct)`;

            // Filter dates where all games have non-zero scores
            const completedDates = data.daily_accuracies.filter(item => 
                item.game_details.every(game => 
                    game.home_score !== null && game.away_score !== null && 
                    (game.home_score > 0 || game.away_score > 0) // Ensure scores are not 0-0
                )
            );

            completedDates.forEach(item => {
                const option = document.createElement('option');
                option.value = item.date;
                option.textContent = item.date;
                dateSelectEl.appendChild(option);
            });

            if (completedDates.length > 0) {
                displayAccuracyForDate(completedDates[0].date, data.daily_accuracies);
            } else {
                accuracyListEl.innerHTML = '<p>No completed games to display.</p>';
            }

            dateSelectEl.addEventListener('change', (event) => {
                const selectedDate = event.target.value;
                displayAccuracyForDate(selectedDate, data.daily_accuracies);
            });
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

                    gameItem.innerHTML = `
                        <div class="game-row">
                            <div>
                                <span class="away-team">${game.away_team}</span>
                                <span class="score">(${game.away_score ?? ''})</span>
                            </div>
                            <span class="vs">vs</span>
                            <div>
                                <span class="home-team">${game.home_team}</span>
                                <span class="score">(${game.home_score ?? ''})</span>
                            </div>
                        </div>
                        <div class="prediction-actual">
                            <div><strong>Predicted:</strong> ${game.predicted_winner}</div>
                            <div><strong>Actual:</strong> ${game.actual_winner}</div>
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
