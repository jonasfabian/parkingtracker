import { updateMapWithData } from "./map.js";
import { fetchParkingData } from "./fetch.js";

document.addEventListener('DOMContentLoaded', () => {
  init();

  const refreshButton = document.getElementById('refresh-button');
  refreshButton.addEventListener('click', () => {
    init();
  });
});

async function init() {
  showSkeletons();
  updateLastUpdatedTime(null);
  await loadData();
}

function showSkeletons() {
  const container = document.getElementById("parking-container");
  container.innerHTML = `
    <div class="skeleton-card">
      <div class="skeleton skeleton-title"></div>
      <div class="skeleton skeleton-line"></div>
      <div class="skeleton skeleton-line"></div>
    </div>
    <div class="skeleton-card">
      <div class="skeleton skeleton-title"></div>
      <div class="skeleton skeleton-line"></div>
      <div class="skeleton skeleton-line"></div>
    </div>
    <div class="skeleton-card">
      <div class="skeleton skeleton-title"></div>
      <div class="skeleton skeleton-line"></div>
      <div class="skeleton skeleton-line"></div>
    </div>
  `;
}

async function loadData() {
  const data = await fetchParkingData();
  if (data) {
    updateMapWithData(data);
    displayParkingData(data);
    updateLastUpdatedTime(data.last_updated);
  } else {
    document.getElementById("parking-container").innerHTML =
      "<p>❌ Failed to load data</p>";
    updateLastUpdatedTime(null);
  }
}

function displayParkingData(parkingData) {
  const container = document.getElementById("parking-container");
  container.innerHTML = "";

  const sortedLots = [...parkingData.lots]
    .filter(lot => lot.coords)
    .sort((a, b) => b.free - a.free);

  sortedLots.forEach((lot, index) => {
    const totalSpaces = lot.total;
    const freeSpaces = lot.free;
    const filledSpaces = totalSpaces - freeSpaces;
    const filledPercentage = totalSpaces > 0
      ? ((filledSpaces / totalSpaces) * 100).toFixed(1)
      : "N/A";

    let capacityFillStyle = `width: ${filledPercentage}%;`;
    if (totalSpaces > 0) {
      const occupancy = parseFloat(filledPercentage);
      let gradient;
      if (occupancy < 50) {
        gradient = "linear-gradient(to right, #38b000, #ffbe0b)";
      } else {
        gradient = "linear-gradient(to right, #ffbe0b, #ff5252)";
      }
      capacityFillStyle += ` background: ${gradient};`;
    }

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
          <span class="stat-value capacity">${totalSpaces || "Unknown"}</span>
        </div>
        <div class="stat">
          <span class="stat-label">Available Spaces</span>
          <span class="stat-value available">${freeSpaces}</span>
        </div>
        <div class="stat">
          <span class="stat-label">Occupied (${filledPercentage}%)</span>
          <span class="stat-value filled">${filledSpaces}</span>
        </div>
        ${
          totalSpaces > 0
            ? `
              <div class="capacity-bar">
                <div class="capacity-fill" style="${capacityFillStyle}"></div>
              </div>
            `
            : ""
        }
        <div class="updated-time">
          <i class="fas fa-history"></i> Updated just now
        </div>
      </div>
    `;

    container.appendChild(card);
  });
}

function updateLastUpdatedTime(timestamp) {
  const lastUpdatedElement = document.querySelector("#last-updated span");
  if (!timestamp) {
    lastUpdatedElement.textContent = "Last updated: loading...";
  } else {
    const lastUpdated = new Date(timestamp).toLocaleTimeString();
    lastUpdatedElement.textContent = `Last updated: ${lastUpdated}`;
  }
}
