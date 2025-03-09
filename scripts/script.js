import { updateMapWithData, showLoadingMarkers } from "./map.js";
import { fetchParkingData } from "./fetch.js";

let lastLoadedData = null;

document.addEventListener('DOMContentLoaded', () => {
  init();

  const refreshButton = document.getElementById('refresh-button');
  refreshButton.addEventListener('click', () => {
    document.body.classList.add('refreshing');
    
    if (lastLoadedData) {
      showLoadingMarkers(lastLoadedData);
    } else {
      showLoadingMarkers();
    }
    
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
  showLoadingMarkers(lastLoadedData);
  
  const data = await fetchParkingData();
  if (data) {
    lastLoadedData = data;
    
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
    const totalSpaces = lot.total || 0;
    const freeSpaces = Math.min(lot.free || 0, totalSpaces);
    const filledSpaces = totalSpaces - freeSpaces;
    
    // Calculate percentages
    const filledPercentage = totalSpaces > 0
      ? ((filledSpaces / totalSpaces) * 100).toFixed(1)
      : 0;

    // Determine status text
    let statusText = '';
    let statusIcon = '';
    let statusClass = '';
    let capacityFillClass = '';
    let availableClass = freeSpaces === 0 ? 'none' : '';
    
    if (freeSpaces === 0) {
      statusText = 'Full';
      statusIcon = 'ban';
      statusClass = 'full';
      capacityFillClass = 'full';
    } else if (freeSpaces < 10) {
      statusText = 'Limited';
      statusIcon = 'exclamation-circle';
    } else {
      statusText = 'Available';
      statusIcon = 'check-circle';
    }

    const card = document.createElement("div");
    card.className = "parking-card";
    card.style.animationDelay = `${index * 0.05}s`;

    const dataWarning = lot.free > totalSpaces ? 
      `<div class="data-warning"><i class="fas fa-exclamation-triangle"></i> Data inconsistency detected</div>` : '';

    card.innerHTML = `
      <div class="card-header">
        <h2 class="parking-name">${lot.name}</h2>
        <span class="status-pill ${statusClass}">
          <i class="fas fa-${statusIcon}"></i> ${statusText}
        </span>
      </div>
      <div class="card-body">
        <div class="main-stats">
          <div class="stat-column">
            <div class="stat-value">${totalSpaces}</div>
            <div class="stat-label"><i class="fas fa-parking"></i> Capacity</div>
          </div>
          <div class="stat-column">
            <div class="stat-value available ${availableClass}">${freeSpaces}</div>
            <div class="stat-label"><i class="fas fa-check"></i> Available</div>
          </div>
          <div class="stat-column">
            <div class="stat-value">${filledSpaces}</div>
            <div class="stat-label"><i class="fas fa-car"></i> Occupied</div>
          </div>
        </div>
        
        <div class="capacity-section">
          <div class="capacity-header">
            <div class="capacity-title">Occupancy</div>
            <div class="capacity-percentage">${filledPercentage}%</div>
          </div>
          <div class="capacity-bar">
            <div class="capacity-fill ${capacityFillClass}" style="width: ${filledPercentage}%"></div>
          </div>
        </div>
        
        ${dataWarning}
      </div>
      <div class="card-footer">
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

    const date = new Date(timestamp);
    
    date.setHours(date.getHours() + 1);
    
    const lastUpdated = date.toLocaleTimeString('de-CH', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
    
    lastUpdatedElement.textContent = `Updated: ${lastUpdated}`;
    updateIndicator.style.backgroundColor = 'var(--success)';
  }
}