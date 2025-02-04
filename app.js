document.addEventListener('DOMContentLoaded', () => {
    const dateSelect = document.getElementById('date-select');
    const gameContainer = document.getElementById('game-container');
    const resultsDiv = document.getElementById('results');

    let predictions = [];

    console.log("App loaded successfully.");

    // Load predictions when a date is selected
    dateSelect.addEventListener('change', () => {
        const selectedDate = dateSelect.value;
        console.log(`Date selected: ${selectedDate}`);

        if (!selectedDate) {
            gameContainer.innerHTML = '<p>Please select a date to view games.</p>';
            return;
        }

        const filePath = `docs/JSON_DATA/${selectedDate}.json`;
        console.log(`Fetching predictions from: ${filePath}`);

        fetch(filePath)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`No predictions available for ${selectedDate}.`);
                }
                return response.json();
            })
            .then(data => {
                console.log("Data fetched successfully:", data);
                predictions = data;
                displayGames(predictions);
            })
            .catch(error => {
                console.error("Error fetching data:", error);
                gameContainer.innerHTML = `<p>${error.message}</p>`;
            });
    });

    // Display each game in its own box with a SELECT button
    function displayGames(predictions) {
        gameContainer.innerHTML = ''; // Clear previous games

        if (predictions.length === 0) {
            gameContainer.innerHTML = '<p>No games found for the selected date.</p>';
            return;
        }

        predictions.forEach(prediction => {
            const gameBox = document.createElement('div');
            gameBox.classList.add('game-box');

            gameBox.innerHTML = `
                <h3>${prediction.home_team} vs ${prediction.away_team}</h3>
                <button class="select-btn" data-home="${prediction.home_team}" data-away="${prediction.away_team}">SELECT</button>
            `;

            gameContainer.appendChild(gameBox);
        });

        // Add event listeners to SELECT buttons
        document.querySelectorAll('.select-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const homeTeam = e.target.dataset.home;
                const awayTeam = e.target.dataset.away;
                showGameDetails(homeTeam, awayTeam);
            });
        });
    }

    // Show detailed game information
    function showGameDetails(homeTeam, awayTeam) {
        console.log(`Showing details for: ${homeTeam} vs ${awayTeam}`);

        const gamePrediction = predictions.find(
            pred => pred.home_team === homeTeam && pred.away_team === awayTeam
        );

        if (gamePrediction) {
            resultsDiv.innerHTML = `
                <h2>Prediction for ${homeTeam} vs ${awayTeam}</h2>
                <p><strong>Winner:</strong> ${gamePrediction.winner}</p>
                <p><strong>Odds:</strong> ${homeTeam}: ${gamePrediction.odds[homeTeam]}, ${awayTeam}: ${gamePrediction.odds[awayTeam]}</p>
            `;
        } else {
            resultsDiv.innerHTML = '<p>No prediction data found for this game.</p>';
        }
    }
});
