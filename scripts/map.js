const map = L.map("map").setView([47.3769, 8.5417], 12);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors"
}).addTo(map);

function updateMapWithData(data) {
  if (!data) return;
  
  map.eachLayer(layer => {
    if (layer instanceof L.Marker) {
      map.removeLayer(layer);
    }
  });
  
  data.lots.forEach(lot => {
    if (!lot.coords) return;
    const { lat, lng } = lot.coords;
    const marker = L.marker([lat, lng]).addTo(map);
    marker.bindPopup(`
        <b>${lot.name}</b>
        <br>
        Available: ${lot.free}
    `);
  });
}

export { updateMapWithData };
