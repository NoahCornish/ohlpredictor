fetch('docs/JSON_DATA/profit_summary.json')
    .then(response => response.json())
    .then(data => {
        // Calculate total return and percentage gain
        const totalReturn = data.total_bet + data.total_profit;
        const percentGain = (data.total_profit / data.total_bet) * 100;

        // Populate Total Summary
        const totalSummaryTable = document.getElementById('total-summary');
        const totalRow = document.createElement('tr');
        totalRow.innerHTML = `
            <td>$${data.total_bet.toFixed(2)}</td>  <!-- Total Wagered -->
            <td>$${totalReturn.toFixed(2)}</td>     <!-- Total Return -->
            <td>${data.total_profit >= 0 ? '+' : '-'}$${Math.abs(data.total_profit).toFixed(2)}
                (${percentGain >= 0 ? '+' : ''}${percentGain.toFixed(2)}%)</td> <!-- Total Profit/Loss with Percentage -->
        `;
        totalSummaryTable.appendChild(totalRow);

        // Populate Daily Summary
        const dailySummaryTable = document.getElementById('daily-summary');
        data.daily_summary.forEach(day => {
            const dailyRow = document.createElement('tr');
            dailyRow.innerHTML = `
                <td>${day.date}</td>
                <td>$${day.daily_bet.toFixed(2)}</td>
                <td>${day.daily_profit >= 0 ? '+' : '-'}$${Math.abs(day.daily_profit).toFixed(2)}</td>
            `;
            dailySummaryTable.appendChild(dailyRow);
        });
    })
    .catch(error => console.error('Error loading profit summary:', error));
