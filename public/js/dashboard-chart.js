document.addEventListener("DOMContentLoaded", () => {
  const entries = window.dashboardData || [];

  // Initialize date pickers with today's date
  const today = new Date();
  const dateInput = document.getElementById("dateFilter");
  const queueInput = document.getElementById("queueFilter");
  const queueDateInput = document.getElementById("queueDateFilter");
  const queuePerformanceInput = document.getElementById(
    "queuePerformanceFilter",
  );

  dateInput.valueAsDate = today;
  queueDateInput.valueAsDate = today;

  // Store chart instances to destroy them before re-rendering
  let doctypeChart, platformChart, weeklyChart, queuePerformanceChart;

  // Function to process data based on selected date and queue
  function processData(selectedDateStr, selectedQueue = "all") {
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
        // Filter by queue if selected
        if (last7Days.includes(entryDateStr)) {
          if (selectedQueue === "all" || row.queue === selectedQueue) {
            weeklyDataByUser[username][entryDateStr] += count;
          }
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

  // Function to process queue performance data for a specific date and queue
  function processQueuePerformanceData(selectedDateStr, selectedQueue) {
    if (!selectedQueue) {
      return { processorData: {}, docTypes: [] };
    }

    const selectedDate = new Date(selectedDateStr);
    selectedDate.setHours(0, 0, 0, 0);
    const filterDateStr = selectedDate.toLocaleDateString();

    const processorData = {}; // { username: { docType: count } }
    const docTypesSet = new Set();

    entries.forEach((entry) => {
      const entryDate = new Date(entry.date);
      entryDate.setHours(0, 0, 0, 0);
      const entryDateStr = entryDate.toLocaleDateString();
      const isSelectedDate = entryDateStr === filterDateStr;
      const username = entry.username || "Unknown";

      if (isSelectedDate) {
        entry.entries.forEach((row) => {
          if (row.queue === selectedQueue) {
            const count = row.count || 0;
            const docType = row.docType || "Unknown";

            // Initialize processor data if not exists
            if (!processorData[username]) {
              processorData[username] = {};
            }

            // Add count to processor's docType
            processorData[username][docType] =
              (processorData[username][docType] || 0) + count;

            // Track all document types
            docTypesSet.add(docType);
          }
        });
      }
    });

    return {
      processorData,
      docTypes: Array.from(docTypesSet).sort(),
    };
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

  // Function to render queue performance chart
  function renderQueuePerformanceChart(selectedDateStr, selectedQueue) {
    // Destroy existing chart
    if (queuePerformanceChart) queuePerformanceChart.destroy();

    const { processorData, docTypes } = processQueuePerformanceData(
      selectedDateStr,
      selectedQueue,
    );

    const ctx = document
      .getElementById("queuePerformanceChart")
      .getContext("2d");

    const processors = Object.keys(processorData);

    if (!selectedQueue || processors.length === 0) {
      // Show empty state
      queuePerformanceChart = new Chart(ctx, {
        type: "bar",
        data: {
          labels: ["No Data"],
          datasets: [
            {
              label: "Documents Processed",
              data: [0],
              backgroundColor: "rgba(108, 92, 231, 0.7)",
              borderColor: "rgba(108, 92, 231, 1)",
              borderWidth: 2,
            },
          ],
        },
        options: {
          indexAxis: "y",
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              beginAtZero: true,
              ticks: { color: "#2d3436" },
            },
            y: {
              ticks: { color: "#2d3436" },
            },
          },
          plugins: {
            legend: { display: false },
            title: {
              display: true,
              text: selectedQueue
                ? "No data available for selected date and queue"
                : "Please select a queue",
              color: "#636e72",
              font: { size: 14 },
            },
          },
        },
      });
      return;
    }

    // Define colors for different document types
    const docTypeColors = [
      { bg: "rgba(102, 126, 234, 0.8)", border: "rgba(102, 126, 234, 1)" },
      { bg: "rgba(118, 75, 162, 0.8)", border: "rgba(118, 75, 162, 1)" },
      { bg: "rgba(253, 121, 168, 0.8)", border: "rgba(253, 121, 168, 1)" },
      { bg: "rgba(9, 132, 227, 0.8)", border: "rgba(9, 132, 227, 1)" },
      { bg: "rgba(0, 184, 148, 0.8)", border: "rgba(0, 184, 148, 1)" },
      { bg: "rgba(253, 203, 110, 0.8)", border: "rgba(253, 203, 110, 1)" },
      { bg: "rgba(214, 48, 49, 0.8)", border: "rgba(214, 48, 49, 1)" },
      { bg: "rgba(108, 92, 231, 0.8)", border: "rgba(108, 92, 231, 1)" },
      { bg: "rgba(255, 159, 64, 0.8)", border: "rgba(255, 159, 64, 1)" },
      { bg: "rgba(75, 192, 192, 0.8)", border: "rgba(75, 192, 192, 1)" },
    ];

    // Create datasets for each document type
    const datasets = docTypes.map((docType, index) => {
      const colorIndex = index % docTypeColors.length;
      return {
        label: docType,
        data: processors.map(
          (processor) => processorData[processor][docType] || 0,
        ),
        backgroundColor: docTypeColors[colorIndex].bg,
        borderColor: docTypeColors[colorIndex].border,
        borderWidth: 1,
      };
    });

    // Render stacked horizontal bar chart
    queuePerformanceChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: processors,
        datasets: datasets,
      },
      options: {
        indexAxis: "y", // Horizontal bar chart
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            stacked: true, // Enable stacking
            beginAtZero: true,
            ticks: {
              color: "#2d3436",
              precision: 0,
            },
            title: {
              display: true,
              text: "Number of Documents",
              color: "#2d3436",
              font: { size: 12, weight: "bold" },
            },
          },
          y: {
            stacked: true, // Enable stacking
            ticks: { color: "#2d3436" },
            title: {
              display: true,
              text: "Processors",
              color: "#2d3436",
              font: { size: 12, weight: "bold" },
            },
          },
        },
        plugins: {
          legend: {
            display: true,
            position: "top",
            labels: {
              color: "#2d3436",
              usePointStyle: true,
              padding: 10,
              font: { size: 11 },
            },
          },
          tooltip: {
            mode: "index",
            intersect: false,
            callbacks: {
              footer: function (tooltipItems) {
                let total = 0;
                tooltipItems.forEach((item) => {
                  total += item.parsed.x;
                });
                return "Total: " + total;
              },
            },
          },
        },
      },
    });
  }

  // Initial render with today's date and all queues
  const initialData = processData(dateInput.value, queueInput.value);
  renderCharts(initialData);

  // Initial render of queue performance chart
  renderQueuePerformanceChart(
    queueDateInput.value,
    queuePerformanceInput.value,
  );

  // Add event listener for date changes
  dateInput.addEventListener("change", (e) => {
    const newData = processData(e.target.value, queueInput.value);
    renderCharts(newData);
  });

  // Add event listener for queue filter changes
  queueInput.addEventListener("change", (e) => {
    const newData = processData(dateInput.value, e.target.value);
    renderCharts(newData);
  });

  // Add event listeners for queue performance chart
  queueDateInput.addEventListener("change", (e) => {
    renderQueuePerformanceChart(e.target.value, queuePerformanceInput.value);
  });

  queuePerformanceInput.addEventListener("change", (e) => {
    renderQueuePerformanceChart(queueDateInput.value, e.target.value);
  });
});
