import { updateMapWithData } from "./map.js";
import { fetchParkingData } from "./fetch.js";

document.addEventListener('DOMContentLoaded', () => {
  init();

  const refreshButton = document.getElementById('refresh-button');
  refreshButton.addEventListener('click', () => {
    document.body.classList.add('refreshing');
    
    const refreshTimeout = setTimeout(() => {
      document.body.classList.remove('refreshing');
    }, 5000);
    
    init().then(() => {
      clearTimeout(refreshTimeout);
      document.body.classList.remove('refreshing');
    });
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
    const freeSpaces = Math.min(lot.free, totalSpaces);
    const filledSpaces = totalSpaces - freeSpaces;
    const filledPercentage = totalSpaces > 0
      ? ((filledSpaces / totalSpaces) * 100).toFixed(1)
      : "N/A";

    let capacityFillStyle = `width: ${filledPercentage !== "N/A" ? filledPercentage : 0}%;`;
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

    const dataWarning = lot.free > totalSpaces ? 
      `<div class="data-warning"><i class="fas fa-exclamation-triangle"></i> Data inconsistency detected</div>` : '';

    card.innerHTML = `
      <div class="card-header">
        <h2 class="parking-name">${lot.name}</h2>
        ${dataWarning}
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
          <span class="stat-label">Occupied (${filledPercentage !== "N/A" ? filledPercentage + "%" : "N/A"})</span>
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
  const lastUpdatedElement = document.querySelector(".update-text");
  const updateIndicator = document.querySelector(".update-indicator");
  
  if (!timestamp) {
    lastUpdatedElement.textContent = "Checking...";
    updateIndicator.style.backgroundColor = 'var(--gray-500)';
  } else {
    const lastUpdated = new Date(timestamp).toLocaleTimeString();
    lastUpdatedElement.textContent = `Updated: ${lastUpdated}`;
    updateIndicator.style.backgroundColor = 'var(--success)';
  }
}
