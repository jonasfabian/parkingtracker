function showLoading() {
    const spinner = document.getElementById("loading-spinner");
    if (spinner) spinner.style.display = "flex";
  }
  
  function hideLoading() {
    const spinner = document.getElementById("loading-spinner");
    if (spinner) spinner.style.display = "none";
  }
  
  async function fetchParkingData() {
    showLoading();
    const url = "https://api.parkendd.de/Zuerich";
  
    try {
      const response = await fetch(url);
      const data = await response.json();
      console.log("API Response:", data);
      return data;
    } catch (error) {
      console.error("Error fetching data:", error);
      document.getElementById("parking-container").innerHTML = "<p>❌ Failed to load data</p>";
      return null;
    } finally {
      hideLoading();
    }
  }
  
  export { fetchParkingData };
  