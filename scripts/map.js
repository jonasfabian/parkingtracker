const map = L.map("map").setView([47.3769, 8.5417], 12);

L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png', {
  maxZoom: 20,
  attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
}).addTo(map);

function getMarkerIcon(availability) {
  let color;
  if (availability === 0) {
    color = '#ff5252';
  } else if (availability < 10) {
    color = '#ffbe0b';
  } else {
    color = '#38b000';
  }
  
  return L.divIcon({
    html: `<div style="background-color: ${color}; width: 12px; height: 12px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.2);"></div>`,
    className: 'custom-marker',
    iconSize: [18, 18],
    iconAnchor: [9, 9]
  });
}

function createCustomPopup(lot) {
  return `
    <div class="popup-content">
      <h3 class="popup-title">${lot.name}</h3>
      <p class="popup-available">
        <i class="fas fa-car"></i> ${lot.free} spaces available
      </p>
      <p style="margin: 0; font-size: 0.85rem;">
        <i class="fas fa-info-circle"></i> ${lot.total} total spaces
      </p>
    </div>
  `;
}

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
    const marker = L.marker([lat, lng], {
      icon: getMarkerIcon(lot.free)
    }).addTo(map);
    
    marker.bindPopup(createCustomPopup(lot), {
      closeButton: false
    });
    
    marker.on('mouseover', function() {
      this.openPopup();
    });
    
    marker.on('mouseout', function() {
      this.closePopup();
    });
  });
}

export { updateMapWithData };