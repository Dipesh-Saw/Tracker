document.addEventListener("DOMContentLoaded", () => {
  const entries = window.dashboardData || [];

  // Initialize date picker with today's date
  const today = new Date();
  const dateInput = document.getElementById("dateFilter");
  dateInput.valueAsDate = today;

  // Store chart instances to destroy them before re-rendering
  let doctypeChart, platformChart, weeklyChart;

  // Function to process data based on selected date
  function processData(selectedDateStr) {
    // Get selected date
    const selectedDate = new Date(selectedDateStr);
    selectedDate.setHours(0, 0, 0, 0);
    const filterDateStr = selectedDate.toLocaleDateString();

    // --- Process Selected Date's Data (for doctype, platform, and stats) ---
    let totalDocs = 0;
    let totalTimeMins = 0;
    const platformCounts = {};
    const doctypeCounts = {};

    // --- Process Weekly Data (for line graph) ---
    const last7Days = [];
    const weeklyDataByUser = {}; // Store data per user/processor

    // Initialize last 7 days from today (not selected date)
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    for (let i = 6; i >= 0; i--) {
      const d = new Date(todayDate);
      d.setDate(todayDate.getDate() - i);
      const dateStr = d.toLocaleDateString();
      last7Days.push(dateStr);
    }

    entries.forEach((entry) => {
      const entryDate = new Date(entry.date);
      entryDate.setHours(0, 0, 0, 0);
      const entryDateStr = entryDate.toLocaleDateString();
      const isSelectedDate = entryDateStr === filterDateStr;
      const username = entry.username || "Unknown";

      // Initialize user data structure if not exists
      if (!weeklyDataByUser[username]) {
        weeklyDataByUser[username] = {};
        last7Days.forEach((date) => {
          weeklyDataByUser[username][date] = 0;
        });
      }

      entry.entries.forEach((row) => {
        const count = row.count || 0;
        const time = row.timeInMins || 0;

        // Process SELECTED DATE's data only for doctype, platform, and stats
        if (isSelectedDate) {
          totalDocs += count;
          totalTimeMins += time;

          // Platform stats (selected date only)
          if (row.platform) {
            platformCounts[row.platform] =
              (platformCounts[row.platform] || 0) + count;
          }

          // Doctype stats (selected date only)
          if (row.docType) {
            doctypeCounts[row.docType] =
              (doctypeCounts[row.docType] || 0) + count;
          }
        }

        // Weekly stats (for all processors in last 7 days)
        if (last7Days.includes(entryDateStr)) {
          weeklyDataByUser[username][entryDateStr] += count;
        }
      });
    });

    // Update Summary Cards
    document.getElementById("totalDocs").textContent = totalDocs;
    document.getElementById("totalHours").textContent = (
      totalTimeMins / 60
    ).toFixed(1);
    const efficiency =
      totalTimeMins > 0 ? (totalDocs / (totalTimeMins / 60)).toFixed(1) : 0;
    document.getElementById("efficiency").textContent = efficiency;

    return { doctypeCounts, platformCounts, last7Days, weeklyDataByUser };
  }

  // Function to render all charts
  function renderCharts(data) {
    const { doctypeCounts, platformCounts, last7Days, weeklyDataByUser } = data;

    // Destroy existing charts before creating new ones
    if (doctypeChart) doctypeChart.destroy();
    if (platformChart) platformChart.destroy();
    if (weeklyChart) weeklyChart.destroy();

    // 1. Doctype Chart (Bar)
    const doctypeCtx = document.getElementById("doctypeChart").getContext("2d");
    doctypeChart = new Chart(doctypeCtx, {
      type: "bar",
      data: {
        labels: Object.keys(doctypeCounts),
        datasets: [
          {
            label: "Documents by Type",
            data: Object.values(doctypeCounts),
            backgroundColor: "rgba(102, 126, 234, 0.7)",
            borderColor: "rgba(102, 126, 234, 1)",
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: { color: "#2d3436" },
          },
          x: {
            ticks: { color: "#2d3436" },
          },
        },
        plugins: {
          legend: {
            display: false,
            labels: { color: "#2d3436" },
          },
        },
      },
    });

    // 2. Platform Chart (Pie)
    const platformCtx = document
      .getElementById("platformChart")
      .getContext("2d");
    platformChart = new Chart(platformCtx, {
      type: "pie",
      data: {
        labels: Object.keys(platformCounts),
        datasets: [
          {
            label: "Documents by Platform",
            data: Object.values(platformCounts),
            backgroundColor: [
              "rgba(102, 126, 234, 0.7)",
              "rgba(118, 75, 162, 0.7)",
              "rgba(253, 121, 168, 0.7)",
              "rgba(9, 132, 227, 0.7)",
              "rgba(0, 184, 148, 0.7)",
            ],
            borderColor: "#ffffff",
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "right",
            labels: { color: "#2d3436" },
          },
        },
      },
    });

    // 3. Weekly Trend Chart (LINE) - All Processors
    const weeklyCtx = document.getElementById("weeklyChart").getContext("2d");

    // Prepare datasets for each processor/user
    const colors = [
      { bg: "rgba(102, 126, 234, 0.2)", border: "rgba(102, 126, 234, 1)" },
      { bg: "rgba(118, 75, 162, 0.2)", border: "rgba(118, 75, 162, 1)" },
      { bg: "rgba(253, 121, 168, 0.2)", border: "rgba(253, 121, 168, 1)" },
      { bg: "rgba(9, 132, 227, 0.2)", border: "rgba(9, 132, 227, 1)" },
      { bg: "rgba(0, 184, 148, 0.2)", border: "rgba(0, 184, 148, 1)" },
      { bg: "rgba(253, 203, 110, 0.2)", border: "rgba(253, 203, 110, 1)" },
      { bg: "rgba(214, 48, 49, 0.2)", border: "rgba(214, 48, 49, 1)" },
    ];

    const datasets = Object.keys(weeklyDataByUser).map((username, index) => {
      const colorIndex = index % colors.length;
      return {
        label: username,
        data: last7Days.map((date) => weeklyDataByUser[username][date]),
        backgroundColor: colors[colorIndex].bg,
        borderColor: colors[colorIndex].border,
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: colors[colorIndex].border,
      };
    });

    weeklyChart = new Chart(weeklyCtx, {
      type: "line",
      data: {
        labels: last7Days,
        datasets: datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: { color: "#2d3436" },
          },
          x: {
            ticks: { color: "#2d3436" },
          },
        },
        plugins: {
          legend: {
            display: true,
            position: "top",
            labels: {
              color: "#2d3436",
              usePointStyle: true,
              padding: 15,
            },
          },
          tooltip: {
            mode: "index",
            intersect: false,
          },
        },
        interaction: {
          mode: "nearest",
          axis: "x",
          intersect: false,
        },
      },
    });
  }

  // Initial render with today's date
  const initialData = processData(dateInput.value);
  renderCharts(initialData);

  // Add event listener for date changes
  dateInput.addEventListener("change", (e) => {
    const newData = processData(e.target.value);
    renderCharts(newData);
  });
});
