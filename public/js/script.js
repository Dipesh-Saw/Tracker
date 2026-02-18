document.addEventListener("DOMContentLoaded", () => {
  // --- References ---
  const entriesContainer = document.getElementById("entriesContainer");
  const addRowBtn = document.getElementById("addRowBtn");
  const nonProductiveContainer = document.getElementById("nonProductiveContainer");
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

  function createNewNonProductiveRow(clickedBtn) {
    const firstNpRow = document.querySelector(".non-productive-row");
    const newNpRow = firstNpRow.cloneNode(true);

    // Reset values
    newNpRow.querySelectorAll("input").forEach((input) => (input.value = ""));
    newNpRow.querySelectorAll("select").forEach((select) => (select.selectedIndex = 0));

    // Show remove button
    newNpRow.querySelector(".btn-remove-np").style.visibility = "visible";

    // Add event listeners for add button
    newNpRow.querySelector(".btn-add-np").addEventListener("click", function() {
      createNewNonProductiveRow(this);
    });

    // Add event listener for remove button
    newNpRow.querySelector(".btn-remove-np").addEventListener("click", () => {
      newNpRow.remove();
    });

    nonProductiveContainer.appendChild(newNpRow);
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

  // Setup initial non-productive row listeners
  const initialNpRow = document.querySelector(".non-productive-row");
  initialNpRow.querySelector(".btn-add-np").addEventListener("click", function() {
    createNewNonProductiveRow(this);
  });

  // Form Submission
  trackerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = trackerForm.username.value;
    const date = trackerForm.date.value;
    const dayType = trackerForm.dayType.value;
    const rows = [];
    const nonProductiveRows = [];

    // Collect productive entries
    document.querySelectorAll(".entry-row").forEach((row) => {
      rows.push({
        platform: row.querySelector(".platform-select").value,
        docType: row.querySelector(".doctype-select").value,
        queue: row.querySelector(".queue-select").value,
        count: row.querySelector(".count-input").value,
        timeInMins: row.querySelector(".time-input").value,
      });
    });

    // Collect non-productive entries
    document.querySelectorAll(".non-productive-row").forEach((row) => {
      const activityType = row.querySelector(".activity-select").value;
      const duration = row.querySelector(".np-duration-input").value;
      const comments = row.querySelector(".np-comments-input").value;
      
      // Only add if there's some data
      if (activityType || duration || comments) {
        nonProductiveRows.push({
          activityType: activityType,
          duration: duration,
          comments: comments,
        });
      }
    });

    try {
      const res = await fetch("/api/entry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          username, 
          date, 
          dayType, 
          rows,
          nonProductiveRows 
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert("Data Successfuly Saved to Database");
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
