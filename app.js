document.addEventListener('DOMContentLoaded', () => {
    const dateInput = document.getElementById('date-select');
    const gameContainer = document.getElementById('game-container');
    const resultsDiv = document.getElementById('results');

    dateInput.addEventListener('change', function () {
        // ✅ Clear the selected game when the date changes
        resultsDiv.innerHTML = '';

        fetch(`docs/JSON_DATA/${this.value}.json`)
            .then(response => response.json())
            .then(games => {
                gameContainer.innerHTML = '';

                games.forEach(game => {
                    const gameBox = document.createElement('div');
                    gameBox.className = 'game-box';

                    // ✅ Only display the two teams and SELECT button
                    gameBox.innerHTML = `
                        <div class="game-row">
                            <span class="team away-team">${game.away_team}</span>
                            <span class="vs">vs</span>
                            <span class="team home-team">${game.home_team}</span>
                        </div>
                        <button class="select-btn" data-home="${game.home_team}" data-away="${game.away_team}">SELECT</button>
                    `;

                    gameContainer.appendChild(gameBox);
                });

                // ✅ Add event listeners for SELECT buttons
                document.querySelectorAll('.select-btn').forEach(button => {
                    button.addEventListener('click', (e) => {
                        const homeTeam = e.target.dataset.home;
                        const awayTeam = e.target.dataset.away;
                        showGameDetails(homeTeam, awayTeam, dateInput.value);
                    });
                });
            })
            .catch(error => {
                console.error('Error loading game data:', error);
                gameContainer.innerHTML = '<p>NO GAME DATA AVAILABLE.</p>';
            });
    });

    // ✅ Show game details when SELECT button is clicked
    function showGameDetails(homeTeam, awayTeam, selectedDate) {
        const filePath = `docs/JSON_DATA/${selectedDate}.json`;

        fetch(filePath)
            .then(response => response.json())
            .then(predictions => {
                const game = predictions.find(pred => pred.home_team === homeTeam && pred.away_team === awayTeam);

                if (game) {
                    resultsDiv.innerHTML = `
                        <div class="game-row">
                            <span class="team away-team">${game.away_team}</span>
                            <span class="vs">vs</span>
                            <span class="team home-team">${game.home_team}</span>
                        </div>
                        <p><strong>Predicted Winner:</strong> <span class="winner">${game.winner}</span></p>
                        <p><strong>Odds:</strong> ${game.away_team}: <span class="odds">${game.odds[game.away_team]}</span>, 
                        ${game.home_team}: <span class="odds">${game.odds[game.home_team]}</span></p>
                    `;
                } else {
                    resultsDiv.innerHTML = '<p>No prediction data available for this game.</p>';
                }
            })
            .catch(error => {
                console.error("Error loading game details:", error);
                resultsDiv.innerHTML = '<p>Error loading game details.</p>';
            });
    }

    function updateClock() {
        const now = new Date();
        const estTime = now.toLocaleString('en-US', { 
            timeZone: 'America/New_York', 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit',
            hour12: true 
        });
        const utcTime = now.toUTCString().slice(17, 25);
    
        const clockElement = document.getElementById('clock');
        if (clockElement) {
            clockElement.innerHTML = `
                <strong>EST:</strong> ${estTime} | <strong>UTC:</strong> ${utcTime}
            `;
        }
    }
    
    // ✅ Update the clock every second
    setInterval(updateClock, 1000);
    updateClock();  // ✅ Initialize immediately
    
    
    
});
