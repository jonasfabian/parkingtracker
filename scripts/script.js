import { updateMapWithData } from "./map.js";
import { fetchParkingData } from "./fetch.js";

window.loadData = loadData;

async function loadData() {
  const data = await fetchParkingData();
  if (data) {
    updateMapWithData(data);
    displayParkingData(data);
    updateLastUpdatedTime(data.last_updated);
  }
}

function updateLastUpdatedTime(timestamp) {
  const lastUpdatedElement = document.querySelector('#last-updated span');
  const lastUpdated = timestamp ? new Date(timestamp).toLocaleTimeString() : "Unknown";
  lastUpdatedElement.textContent = `Last updated: ${lastUpdated}`;
}

function displayParkingData(parkingData) {
  const container = document.getElementById("parking-container");
  container.innerHTML = "";

  const sortedLots = [...parkingData.lots].filter(lot => lot.coords).sort((a, b) => b.free - a.free);

  sortedLots.forEach((lot, index) => {
    const totalSpaces = lot.total;
    const freeSpaces = lot.free;
    const filledSpaces = totalSpaces - freeSpaces;
    const filledPercentage = totalSpaces > 0 ? ((filledSpaces / totalSpaces) * 100).toFixed(1) : "N/A";
    
    const card = document.createElement("div");
    card.className = "parking-card";
    card.style.animationDelay = `${index * 0.05}s`;
    
    card.innerHTML = `
      <div class="card-header">
        <h2 class="parking-name">${lot.name}</h2>
      </div>
      <div class="card-body">
        <div class="stat">
          <span class="stat-label">Total Capacity</span>
          <span class="stat-value capacity">${totalSpaces !== 0 ? totalSpaces : "Unknown"}</span>
        </div>
        <div class="stat">
          <span class="stat-label">Available Spaces</span>
          <span class="stat-value available">${freeSpaces}</span>
        </div>
        <div class="stat">
          <span class="stat-label">Occupied (${filledPercentage}%)</span>
          <span class="stat-value filled">${filledSpaces}</span>
        </div>
        ${totalSpaces > 0 ? `
        <div class="capacity-bar">
          <div class="capacity-fill" style="width: ${filledPercentage}%"></div>
        </div>
        ` : ''}
        <div class="updated-time">
          <i class="fas fa-history"></i> Updated just now
        </div>
      </div>
    `;
    
    container.appendChild(card);
  });
}

loadData();
setInterval(loadData, 30000);
