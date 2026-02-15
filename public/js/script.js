document.addEventListener("DOMContentLoaded", () => {
  // --- References ---
  const entriesContainer = document.getElementById("entriesContainer");
  const addRowBtn = document.getElementById("addRowBtn");
  const totalCountEl = document.getElementById("totalCount");
  const totalTimeEl = document.getElementById("totalTime");
  const avgTimeEl = document.getElementById("avgTime");
  const trackerForm = document.getElementById("trackerForm");

  // --- State ---

  // --- Functions ---

  function populateSelect(select, items) {
    select.innerHTML = '<option value="" disabled selected>Select</option>';
    items.forEach((item) => {
      const option = document.createElement("option");
      option.value = item;
      option.textContent = item;
      select.appendChild(option);
    });
  }

  function updateDashboard() {
    let totalCount = 0;
    let totalTime = 0;

    const rows = document.querySelectorAll(".entry-row");
    rows.forEach((row) => {
      const count = parseInt(row.querySelector(".count-input").value) || 0;
      const time = parseInt(row.querySelector(".time-input").value) || 0;

      totalCount += count;
      totalTime += time;
    });

    totalCountEl.textContent = totalCount;
    totalTimeEl.textContent = `${totalTime} mins`;

    const avg = totalCount > 0 ? (totalTime / totalCount).toFixed(1) : 0;
    avgTimeEl.textContent = `${avg} mins`;
  }

  function createNewRow() {
    const firstRow = document.querySelector(".entry-row");
    const newRow = firstRow.cloneNode(true);
    console.log(newRow);

    // Reset values
    newRow.querySelectorAll("input").forEach((input) => (input.value = ""));
    newRow
      .querySelectorAll("select")
      .forEach((select) => (select.selectedIndex = 0));

    // Show remove button
    newRow.querySelector(".btn-remove").style.visibility = "visible";

    // Add event listeners
    newRow.querySelectorAll("input").forEach((input) => {
      input.addEventListener("input", updateDashboard);
    });
    newRow.querySelector(".btn-remove").addEventListener("click", () => {
      newRow.remove();
      updateDashboard();
    });

    entriesContainer.appendChild(newRow);
  }

  // --- Init ---

  // Set default date to today
  const dateInput = document.getElementById("dateInput");
  if (dateInput) {
    dateInput.valueAsDate = new Date();
  }

  // Setup initial row listeners
  const initialRow = document.querySelector(".entry-row");
  initialRow.querySelectorAll("input").forEach((input) => {
    input.addEventListener("input", updateDashboard);
  });

  // Add Row Button
  addRowBtn.addEventListener("click", createNewRow);

  // Form Submission
  trackerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const userName = trackerForm.username.value;
    const date = trackerForm.date.value;
    const dayType = trackerForm.dayType.value;
    const rows = [];

    document.querySelectorAll(".entry-row").forEach((row) => {
      rows.push({
        platform: row.querySelector(".platform-select").value,
        docType: row.querySelector(".doctype-select").value,
        queue: row.querySelector(".queue-select").value,
        count: row.querySelector(".count-input").value,
        timeInMins: row.querySelector(".time-input").value,
      });
    });

    try {
      const res = await fetch("/api/entry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userName, date, dayType, rows }),
      });

      const data = await res.json();
      if (data.success) {
        alert("Entry Saved!");
        window.location.reload();
      } else {
        alert("Error: " + data.message);
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred");
    }
  });
});
