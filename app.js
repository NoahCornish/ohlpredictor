document.addEventListener('DOMContentLoaded', () => {
    const dateInput = document.getElementById('date-select');
    const gameContainer = document.getElementById('game-container');
    const resultsDiv = document.getElementById('results');
    const closeBtn = document.getElementById('close-btn'); 
    const popup = document.getElementById('game-popup');
    

    // ✅ Attach event listener to the close button
    if (closeBtn) {
        closeBtn.addEventListener('click', closePopup);
    }

    dateInput.addEventListener('change', function () {
        resultsDiv.innerHTML = ''; // Clear previous results

        fetch(`docs/JSON_DATA/${this.value}.json`)
            .then(response => response.json())
            .then(games => {
                gameContainer.innerHTML = '';

                games.forEach(game => {
                    const gameBox = document.createElement('div');
                    gameBox.className = 'game-box';

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
                    const popupDetails = document.getElementById('popup-details');
                    popupDetails.innerHTML = `
                        <h2>${game.away_team}<br> vs<br> ${game.home_team}</h2>
                        <p><strong>Predicted Winner:<br></strong> ${game.winner}</p>
                        <p><strong>Odds:<br></strong> ${game.away_team}: ${game.odds[game.away_team]}<br> 
                        ${game.home_team}: ${game.odds[game.home_team]}</p>
                    `;

                    // ✅ Show the popup
                    popup.style.display = 'flex';
                } else {
                    alert('No prediction data available for this game.');
                }
            })
            .catch(error => {
                console.error("Error loading game details:", error);
                alert('Error loading game details.');
            });
    }

    // ✅ Close Popup Function
    function closePopup() {
        popup.style.display = 'none';
    }
});
