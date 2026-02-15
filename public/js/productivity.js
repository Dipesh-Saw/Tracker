/**
 * Productivity Chart Module
 * Handles fetching and rendering productivity analytics
 */

let productivityChart = null;
let currentRange = '24h';

/**
 * Initialize productivity chart on page load
 */
document.addEventListener('DOMContentLoaded', () => {
    initializeProductivityChart();
    attachRangeButtonListeners();
});

/**
 * Attach event listeners to time range buttons
 */
function attachRangeButtonListeners() {
    const rangeButtons = document.querySelectorAll('.range-btn');

    rangeButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Update active state
            rangeButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // Fetch new data
            currentRange = button.dataset.range;
            fetchAndRenderProductivityData(currentRange);
        });
    });
}

/**
 * Initialize the productivity chart
 */
async function initializeProductivityChart() {
    await fetchAndRenderProductivityData(currentRange);
}

/**
 * Fetch productivity data from API and render chart
 * @param {String} range - Time range (24h, 1w, 1m)
 */
async function fetchAndRenderProductivityData(range) {
    try {
        const response = await fetch(`/api/productivity?range=${range}`);
        const result = await response.json();

        if (result.success) {
            const data = result.data;
            updateSummaryStats(data.summary);
            renderProductivityChart(data.timeline);
            renderBreakdowns(data.breakdown);
        } else {
            console.error('Failed to fetch productivity data:', result.error);
            showEmptyState();
        }
    } catch (error) {
        console.error('Error fetching productivity data:', error);
        showEmptyState();
    }
}

/**
 * Update summary statistics
 * @param {Object} summary - Summary statistics
 */
function updateSummaryStats(summary) {
    document.getElementById('prod-total-docs').textContent = summary.totalDocuments || 0;
    document.getElementById('prod-total-time').innerHTML =
        `${summary.totalTimeHours || 0} <small>hrs</small>`;
    document.getElementById('prod-avg-day').innerHTML =
        `${summary.avgDocumentsPerDay || 0} <small>docs</small>`;
    document.getElementById('prod-avg-time').innerHTML =
        `${summary.avgTimePerDocument || 0} <small>mins</small>`;
}

/**
 * Render the productivity timeline chart
 * @param {Array} timeline - Timeline data
 */
function renderProductivityChart(timeline) {
    const ctx = document.getElementById('productivityChart');

    if (!ctx) return;

    // Destroy existing chart if it exists
    if (productivityChart) {
        productivityChart.destroy();
    }

    // Prepare data
    const labels = timeline.map(item => {
        const date = new Date(item.date);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });

    const documentsData = timeline.map(item => item.documents);
    const timeData = timeline.map(item => (item.time / 60).toFixed(2)); // Convert to hours

    // Create chart
    productivityChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Documents Processed',
                    data: documentsData,
                    borderColor: '#5cbdb9',
                    backgroundColor: 'rgba(92, 189, 185, 0.1)',
                    tension: 0.4,
                    yAxisID: 'y'
                },
                {
                    label: 'Time Spent (hours)',
                    data: timeData,
                    borderColor: '#fbe3e8',
                    backgroundColor: 'rgba(251, 227, 232, 0.3)',
                    tension: 0.4,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        font: {
                            family: 'Inter, sans-serif'
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: {
                        family: 'Inter, sans-serif'
                    },
                    bodyFont: {
                        family: 'Inter, sans-serif'
                    }
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Documents',
                        font: {
                            family: 'Inter, sans-serif'
                        }
                    },
                    grid: {
                        color: 'rgba(92, 189, 185, 0.1)'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Hours',
                        font: {
                            family: 'Inter, sans-serif'
                        }
                    },
                    grid: {
                        drawOnChartArea: false
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(92, 189, 185, 0.1)'
                    },
                    ticks: {
                        font: {
                            family: 'Inter, sans-serif'
                        }
                    }
                }
            }
        }
    });
}

/**
 * Render breakdown lists (platforms, doc types, queues)
 * @param {Object} breakdown - Breakdown data
 */
function renderBreakdowns(breakdown) {
    renderTopList('top-platforms', breakdown.byPlatform);
    renderTopList('top-doctypes', breakdown.byDocType);
    renderTopList('top-queues', breakdown.byQueue);
}

/**
 * Render a top list
 * @param {String} elementId - Element ID to render into
 * @param {Object} data - Data object with name:count pairs
 */
function renderTopList(elementId, data) {
    const element = document.getElementById(elementId);
    if (!element) return;

    // Convert object to array and sort by count
    const items = Object.entries(data)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5); // Top 5

    if (items.length === 0) {
        element.innerHTML = '<li style="opacity: 0.6;">No data yet</li>';
        return;
    }

    element.innerHTML = items.map(([name, count]) =>
        `<li style="display: flex; justify-content: space-between; padding: 0.25rem 0;">
      <span>${name}</span>
      <strong>${count}</strong>
    </li>`
    ).join('');
}

/**
 * Show empty state when no data is available
 */
function showEmptyState() {
    document.getElementById('prod-total-docs').textContent = '0';
    document.getElementById('prod-total-time').innerHTML = '0 <small>hrs</small>';
    document.getElementById('prod-avg-day').innerHTML = '0 <small>docs</small>';
    document.getElementById('prod-avg-time').innerHTML = '0 <small>mins</small>';

    const ctx = document.getElementById('productivityChart');
    if (ctx && productivityChart) {
        productivityChart.destroy();
        productivityChart = null;
    }

    // Clear breakdown lists
    ['top-platforms', 'top-doctypes', 'top-queues'].forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.innerHTML = '<li style="opacity: 0.6;">No data yet</li>';
        }
    });
}

// Export for use in other modules if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        fetchAndRenderProductivityData,
        updateSummaryStats,
        renderProductivityChart
    };
}
