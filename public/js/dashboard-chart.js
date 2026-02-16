document.addEventListener("DOMContentLoaded", () => {
  const entries = window.dashboardData || [];

  // Get today's date string for filtering
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toLocaleDateString();

  // --- Process Today's Data (for doctype, platform, and stats) ---
  let totalDocsToday = 0;
  let totalTimeMinsToday = 0;
  const platformCountsToday = {};
  const doctypeCountsToday = {};

  // --- Process Weekly Data (for line graph) ---
  const last7Days = [];
  const weeklyDataByUser = {}; // Store data per user/processor

  // Initialize last 7 days
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toLocaleDateString();
    last7Days.push(dateStr);
  }

  entries.forEach((entry) => {
    const entryDate = new Date(entry.date);
    entryDate.setHours(0, 0, 0, 0);
    const entryDateStr = entryDate.toLocaleDateString();
    const isToday = entryDateStr === todayStr;
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

      // Process TODAY's data only for doctype, platform, and stats
      if (isToday) {
        totalDocsToday += count;
        totalTimeMinsToday += time;

        // Platform stats (today only)
        if (row.platform) {
          platformCountsToday[row.platform] =
            (platformCountsToday[row.platform] || 0) + count;
        }

        // Doctype stats (today only)
        if (row.docType) {
          doctypeCountsToday[row.docType] =
            (doctypeCountsToday[row.docType] || 0) + count;
        }
      }

      // Weekly stats (for all processors in last 7 days)
      if (last7Days.includes(entryDateStr)) {
        weeklyDataByUser[username][entryDateStr] += count;
      }
    });
  });

  // Update Summary Cards (Today only)
  document.getElementById("totalDocs").textContent = totalDocsToday;
  document.getElementById("totalHours").textContent = (
    totalTimeMinsToday / 60
  ).toFixed(1);
  const efficiency =
    totalTimeMinsToday > 0
      ? (totalDocsToday / (totalTimeMinsToday / 60)).toFixed(1)
      : 0;
  document.getElementById("efficiency").textContent = efficiency;

  // --- Render Charts ---

  // 1. Doctype Chart (Bar) - TODAY ONLY
  const doctypeCtx = document.getElementById("doctypeChart").getContext("2d");
  
  new Chart(doctypeCtx, {
    type: "bar",
    data: {
      labels: Object.keys(doctypeCountsToday),
      datasets: [
        {
          label: "Documents by Type (Today)",
          data: Object.values(doctypeCountsToday),
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

  // 2. Platform Chart (Pie) - TODAY ONLY
  const platformCtx = document.getElementById("platformChart").getContext("2d");
  new Chart(platformCtx, {
    type: "pie",
    data: {
      labels: Object.keys(platformCountsToday),
      datasets: [
        {
          label: "Documents by Platform (Today)",
          data: Object.values(platformCountsToday),
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
      tension: 0.4, // Smooth curves
      fill: true,
      pointRadius: 4,
      pointHoverRadius: 6,
      pointBackgroundColor: colors[colorIndex].border,
    };
  });

  new Chart(weeklyCtx, {
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
});
