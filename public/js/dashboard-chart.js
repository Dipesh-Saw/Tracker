document.addEventListener('DOMContentLoaded', () => {
    const entries = window.dashboardData || [];

    // --- Process Data ---
    let totalDocs = 0;
    let totalTimeMins = 0;
    const platformCounts = {};
    const doctypeCounts = {};
    const weeklyCounts = {};

    // Initialize last 7 days for weekly chart
    const today = new Date();
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const dateStr = d.toLocaleDateString();
        last7Days.push(dateStr);
        weeklyCounts[dateStr] = 0;
    }

    entries.forEach(entry => {
        const entryDate = new Date(entry.date).toLocaleDateString();

        entry.entries.forEach(row => {
            const count = row.count || 0;
            const time = row.timeInMins || 0;

            totalDocs += count;
            totalTimeMins += time;

            // Platform stats
            if (row.platform) {
                platformCounts[row.platform] = (platformCounts[row.platform] || 0) + count;
            }

            // Doctype stats
            if (row.docType) {
                doctypeCounts[row.docType] = (doctypeCounts[row.docType] || 0) + count;
            }

            // Weekly stats (only if within last 7 days)
            if (weeklyCounts.hasOwnProperty(entryDate)) {
                weeklyCounts[entryDate] += count;
            }
        });
    });

    // Update Summary Cards
    document.getElementById('totalDocs').textContent = totalDocs;
    document.getElementById('totalHours').textContent = (totalTimeMins / 60).toFixed(1);
    const efficiency = totalTimeMins > 0 ? (totalDocs / (totalTimeMins / 60)).toFixed(1) : 0;
    document.getElementById('efficiency').textContent = efficiency;

    // --- Render Charts ---

    // 1. Doctype Chart (Bar)
    const doctypeCtx = document.getElementById('doctypeChart').getContext('2d');
    new Chart(doctypeCtx, {
        type: 'bar',
        data: {
            labels: Object.keys(doctypeCounts),
            datasets: [{
                label: 'Documents by Type',
                data: Object.values(doctypeCounts),
                backgroundColor: 'rgba(99, 255, 221, 0.7)',
                borderColor: 'rgba(112, 255, 99, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true }
            },
            plugins: {
                legend: { display: false } // Hide legend for single dataset bar
            }
        }
    });

    // 2. Platform Chart (Pie)
    const platformCtx = document.getElementById('platformChart').getContext('2d');
    new Chart(platformCtx, {
        type: 'pie', // Changed to Pie as per plan/request preference usually, or Stick to Bar if requested? Plan said Bar/Pie. Let's use Pie to match Doctype style or Bar for contrast? Plan said "Bar/Pie". User asked: "what no of documents process in which platform". Let's stick to Pie for Platform as it was before, or maybe Bar is better for comparison. Let's use Pie as it looks good.
        data: {
            labels: Object.keys(platformCounts),
            datasets: [{
                label: 'Documents by Platform',
                data: Object.values(platformCounts),
                backgroundColor: [
                    'rgba(12, 178, 255, 0.7)',
                    'rgba(22, 238, 33, 0.7)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'right' }
            }
        }
    });

    // 3. Weekly Trend Chart (Bar)
    const weeklyCtx = document.getElementById('weeklyChart').getContext('2d');
    new Chart(weeklyCtx, {
        type: 'bar', // User specifically requested Bar for this
        data: {
            labels: last7Days,
            datasets: [{
                label: 'Documents Processed',
                data: last7Days.map(date => weeklyCounts[date]),
                backgroundColor: 'rgba(226, 95, 62, 0.6)',
                borderColor: 'rgba(221, 64, 64, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
});

