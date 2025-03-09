async function fetchParkingData() {
  const url = "https://api.parkendd.de/Zuerich";
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    document.getElementById("parking-container").innerHTML = "<p>❌ Failed to load data</p>";
    return null;
  }
}

export { fetchParkingData };
