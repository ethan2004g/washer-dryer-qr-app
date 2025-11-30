// The four machines your QR codes represent
let machines = [
  { id: "W1", type: "Washer", inUse: false },
  { id: "W2", type: "Washer", inUse: false },
  { id: "D1", type: "Dryer",  inUse: false },
  { id: "D2", type: "Dryer",  inUse: false }
];

// Check if a QR scan happened
const scannedID = localStorage.getItem("scannedMachine");

if (scannedID) {
  // Find machine that matches the scanned QR code
  const machine = machines.find(m => m.id === scannedID);

  if (machine) {
    machine.inUse = true; // Mark as in use
  }

  // Clear stored scan
  localStorage.removeItem("scannedMachine");
}

// Display the washer/dryer list
function displayMachines() {
  const container = document.getElementById("machine-list");

  container.innerHTML = machines.map(machine => `
    <div class="machine">
      <h3>${machine.type} ${machine.id}</h3>
      <p>Status: <strong>${machine.inUse ? "IN USE" : "Available"}</strong></p>
    </div>
  `).join("");
}

displayMachines();
