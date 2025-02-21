import { updateMapWithData } from "./map.js";
import { fetchParkingData } from "./fetch.js";

async function loadData() {
  const data = await fetchParkingData();
  if (data) {
    updateMapWithData(data);
    displayParkingData(data);
  }
}

function displayParkingData(parkingData) {
  const container = document.getElementById("parking-container");
  container.innerHTML = "";

  parkingData.lots.forEach(lot => {
    if (!lot.coords) return;
    const totalSpaces = lot.total;
    const freeSpaces = lot.free;
    const filledSpaces = totalSpaces - freeSpaces;
    const filledPercentage = totalSpaces > 0 ? ((filledSpaces / totalSpaces) * 100).toFixed(1) : "N/A";
    const lastUpdated = parkingData.last_updated ? new Date(parkingData.last_updated).toLocaleTimeString() : "Unknown";

    const card = document.createElement("div");
    card.className = "parking-card";
    card.innerHTML = `
      <h2>${lot.name}</h2>
      <p>Total Spaces: <strong>${totalSpaces !== 0 ? totalSpaces : "Unknown"}</strong></p>
      <p class="filled">Filled: <strong>${filledSpaces} (${filledPercentage}%)</strong></p>
      <p class="available">Available: <strong>${freeSpaces}</strong></p>
      <p class="updated-time">Last updated: ${lastUpdated}</p>
    `;
    container.appendChild(card);
  });
}

loadData();
setInterval(loadData, 30000);
