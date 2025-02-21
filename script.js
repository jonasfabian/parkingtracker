async function fetchParkingData() {
  const url = "https://api.parkendd.de/Zuerich";
  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log("API Response:", data);
    displayParkingData(data);
  } catch (error) {
    console.error("Error fetching data:", error);
    document.getElementById("parking-container").innerHTML = "<p>❌ Failed to load data</p>";
  }
}

function displayParkingData(parkingData) {
  const container = document.getElementById("parking-container");
  container.innerHTML = "";

  parkingData.lots.forEach(lot => {
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

fetchParkingData();
setInterval(fetchParkingData, 30000);