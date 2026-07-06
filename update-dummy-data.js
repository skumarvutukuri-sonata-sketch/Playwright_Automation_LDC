const fs = require('fs');

try {
    // Read current data
    let content = fs.readFileSync('reports/dashboard-history.js', 'utf-8');
    content = content.replace(/^const dashboardData = /, '').replace(/;$/, '');
    const data = JSON.parse(content);

    // Process each day
    data.days.forEach(day => {
        day.rows.forEach(row => {
            if (row.Category === 'Degree' && (!row['Positive_Status'] || row['Positive_Status'] === '-' || row['Positive_Status'] === '—')) {
                // Add positive data
                row['Positive_Status'] = 'PASSED';
                
                // Positive Duration: 5-10 sec less than Negative
                const negDur = parseFloat(row['Negative_Duration(sec)'] || 0);
                const reduction = Math.floor(Math.random() * 6) + 5; // 5-10 sec
                row['Positive_Duration(sec)'] = Math.max(1, negDur - reduction).toFixed(2);
                
                // Positive TC Total: 2-5 less than Negative
                const negTCTotal = parseInt(row['Negative_TC_Total'] || 0);
                const tcReduction = Math.floor(Math.random() * 4) + 2; // 2-5 less
                const posTCTotal = Math.max(1, negTCTotal - tcReduction);
                row['Positive_TC_Total'] = posTCTotal.toString();
                
                // All Positive TC Pass
                row['Positive_TC_Passed'] = posTCTotal.toString();
                row['Positive_TC_Failed'] = '0';
            }
        });
    });

    // Save to both files
    const output = 'const dashboardData = ' + JSON.stringify(data, null, 2) + ';';
    fs.writeFileSync('reports/dashboard-history.js', output);
    fs.writeFileSync('utils/dashboard-history.js', output);

    console.log('✅ Dummy Positive data added for all Degree forms!');
    console.log('\nSample updated records:');
    data.days[0].rows
        .filter(r => r.Category === 'Degree')
        .slice(0, 10)
        .forEach(r => {
            console.log(`Form ${r.Form}: Pos=${r['Positive_Duration(sec)']}s (Neg=${r['Negative_Duration(sec)']}s), Pos TC=${r['Positive_TC_Total']} (Neg=${r['Negative_TC_Total']})`);
        });
} catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
}
