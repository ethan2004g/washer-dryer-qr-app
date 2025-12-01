// ----------------------------------------------
// Configurable cycle time (in minutes)
// ----------------------------------------------
const CYCLE_MINUTES = .25; // change this for real washer/dryer time
const CYCLE_MS = CYCLE_MINUTES * 60 * 1000;

// ----------------------------------------------
// Default machine structure
// ----------------------------------------------
let defaultMachines = [
  { id: "W1", type: "Washer", inUse: false, finished: false, timestamp: null },
  { id: "W2", type: "Washer", inUse: false, finished: false, timestamp: null },
  { id: "D1", type: "Dryer",  inUse: false, finished: false, timestamp: null },
  { id: "D2", type: "Dryer",  inUse: false, finished: false, timestamp: null }
];

// ----------------------------------------------
// Load machine data
// ----------------------------------------------
let machines = JSON.parse(localStorage.getItem("machines")) || defaultMachines;

// ----------------------------------------------
// Save to storage
// ----------------------------------------------
function saveMachines() {
  localStorage.setItem("machines", JSON.stringify(machines));
}

// ----------------------------------------------
// Reset machine manually
// ----------------------------------------------
function resetMachine(id) {
  const machine = machines.find(m => m.id === id);
  if (machine) {
    machine.inUse = false;
    machine.finished = false;
    machine.timestamp = null;
    saveMachines();
    displayMachines();
  }
}

// ----------------------------------------------
// Handle QR scan
// (UPDATED: rescan same machine resets it)
// ----------------------------------------------
const scannedID = localStorage.getItem("scannedMachine");

if (scannedID) {
  const machine = machines.find(m => m.id === scannedID);

  if (machine) {
    // If machine is in use or finished, rescan resets immediately
    if (machine.inUse || machine.finished) {
      machine.inUse = false;
      machine.finished = false;
      machine.timestamp = null;
    } else {
      // Otherwise start a new cycle
      machine.inUse = true;
      machine.finished = false;
      machine.timestamp = Date.now();
    }
  }

  localStorage.removeItem("scannedMachine");
  saveMachines();
}

// ----------------------------------------------
// Calculate time remaining (ms)
// ----------------------------------------------
function getTimeRemaining(machine) {
  if (!machine.inUse) return 0;
  return (machine.timestamp + CYCLE_MS) - Date.now();
}

// ----------------------------------------------
// Format time (mm:ss)
// ----------------------------------------------
function formatTime(ms) {
  if (ms <= 0) return "00:00";

  let totalSeconds = Math.floor(ms / 1000);
  let minutes = Math.floor(totalSeconds / 60);
  let seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

// ----------------------------------------------
// Display machines on dashboard
// ----------------------------------------------
function displayMachines() {
  const container = document.getElementById("machine-list");

  container.innerHTML = machines.map(machine => {
    let statusText = "";
    let statusColor = "green";
    let extraInfo = "";

    const remaining = getTimeRemaining(machine);

    // Check transitions
    if (machine.inUse && remaining <= 0) {
      machine.inUse = false;
      machine.finished = true;
      saveMachines();
    }

    // Determine status
    if (machine.inUse) {
      statusText = "IN USE";
      statusColor = "red";

      extraInfo = `
        <p><small>Time Remaining: <strong>${formatTime(remaining)}</strong></small></p>
      `;
    } 
    
    else if (machine.finished) {
      statusText = "FINISHED: Not Unloaded";
      statusColor = "orange";

      extraInfo = `
        <p><small>Cycle completed at: ${new Date(machine.timestamp + CYCLE_MS).toLocaleTimeString()}</small></p>
      `;
    } 
    
    else {
      statusText = "Available";
      statusColor = "green";
    }

    return `
      <div class="machine">
        <h3>${machine.type} ${machine.id}</h3>

        <p>Status: <strong style="color:${statusColor};">${statusText}</strong></p>

        ${extraInfo}

        <button onclick="resetMachine('${machine.id}')">Reset</button>
      </div>
    `;
  }).join("");

  saveMachines();
}

// Run display every second for live countdown
setInterval(displayMachines, 1000);

// Initial render
displayMachines();
