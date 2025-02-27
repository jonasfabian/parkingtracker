const map = L.map("map").setView([47.3769, 8.5417], 12);
const attr = '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';
const lightMap = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png', { maxZoom: 20, attribution: attr });
const darkMap = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', { maxZoom: 20, attribution: attr });
lightMap.addTo(map);

map.dragging.disable();
map.touchZoom && map.touchZoom.disable();
map.doubleClickZoom && map.doubleClickZoom.disable();
map.scrollWheelZoom && map.scrollWheelZoom.disable();
map.boxZoom && map.boxZoom.disable();
map.keyboard && map.keyboard.disable();

const interactionControl = L.control({ position: 'topright' });
interactionControl.onAdd = () => {
  const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control map-interaction-toggle');
  Object.assign(container.style, {
    backgroundColor: document.body.classList.contains('dark-mode') ? '#333' : 'white',
    padding: '5px',
    cursor: 'pointer',
    width: '30px',
    height: '30px'
  });
  container.title = 'Toggle map interactions';

  const icon = L.DomUtil.create('i', 'fas fa-lock', container);
  Object.assign(icon.style, {
    transition: 'transform 0.3s ease, opacity 0.3s ease',
    display: 'inline-block',
    width: '100%',
    height: '100%',
    textAlign: 'center',
    lineHeight: '30px',
    fontSize: '1.2em'
  });

  container.addEventListener('mouseover', () =>
    container.style.backgroundColor = document.body.classList.contains('dark-mode') ? '#444' : '#f4f4f4'
  );
  container.addEventListener('mouseout', () =>
    container.style.backgroundColor = document.body.classList.contains('dark-mode') ? '#333' : 'white'
  );

  L.DomEvent.disableClickPropagation(container);
  L.DomEvent.on(container, 'click', () => {
    icon.style.opacity = '0';
    setTimeout(() => {
      if (map.dragging.enabled()) {
        map.dragging.disable();
        map.touchZoom && map.touchZoom.disable();
        map.doubleClickZoom && map.doubleClickZoom.disable();
        map.scrollWheelZoom && map.scrollWheelZoom.disable();
        map.boxZoom && map.boxZoom.disable();
        map.keyboard && map.keyboard.disable();
        icon.classList.replace('fa-lock-open', 'fa-lock');
        icon.style.transform = 'rotate(360deg)';
      } else {
        map.dragging.enable();
        map.touchZoom && map.touchZoom.enable();
        map.doubleClickZoom && map.doubleClickZoom.enable();
        map.scrollWheelZoom && map.scrollWheelZoom.enable();
        map.boxZoom && map.boxZoom.enable();
        map.keyboard && map.keyboard.enable();
        icon.classList.replace('fa-lock', 'fa-lock-open');
        icon.style.transform = 'rotate(0deg)';
      }
      icon.style.opacity = '1';
    }, 150);
  });
  return container;
};
interactionControl.addTo(map);

let markers = [];

function getMarkerIcon(availability) {
  const color = availability === 0 ? '#ff5252' : availability < 10 ? '#ffbe0b' : '#38b000';
  const borderColor = document.body.classList.contains('dark-mode') ? '#333' : 'white';
  return L.divIcon({
    html: `<div style="background-color:${color};width:12px;height:12px;border-radius:50%;border:3px solid ${borderColor};box-shadow:0 0 10px rgba(0,0,0,0.2);"></div>`,
    className: 'custom-marker',
    iconSize: [18, 18],
    iconAnchor: [9, 9]
  });
}

function createCustomPopup(lot) {
  const freeSpaces = Math.min(lot.free, lot.total);
  const dataWarning = lot.free > lot.total 
    ? `<p style="margin:0;font-size:0.85rem;color:#ffbe0b;"><i class="fas fa-exclamation-triangle"></i> Data inconsistency detected</p>` 
    : '';
  return `<div class="popup-content">
            <h3 class="popup-title">${lot.name}</h3>
            <p class="popup-available"><i class="fas fa-car"></i> ${freeSpaces} spaces available</p>
            <p style="margin:0;font-size:0.85rem;"><i class="fas fa-info-circle"></i> ${lot.total} total spaces</p>
            ${dataWarning}
          </div>`;
}

let lastLoadedData = null;
function updateMapWithData(data) {
  if (!data) return;
  lastLoadedData = data;
  markers.forEach(marker => map.removeLayer(marker));
  markers = [];
  data.lots.forEach(lot => {
    if (lot.coords) {
      const { lat, lng } = lot.coords;
      const marker = L.marker([lat, lng], { icon: getMarkerIcon(lot.free) });
      marker.lotData = lot;
      marker.bindPopup(createCustomPopup(lot), { closeButton: false });
      marker.on('mouseover', function() { this.openPopup(); });
      marker.on('mouseout', function() { this.closePopup(); });
      markers.push(marker);
      marker.addTo(map);
    }
  });
}

function filterMarkers(filterValue) {
  markers.forEach(marker => {
    const lot = marker.lotData;
    const total = lot.total || 0;
    const free = lot.free || 0;
    const occupied = total - free;
    const occupancyPercentage = total > 0 ? (occupied / total) * 100 : 0;
    let show = true;
    
    switch (filterValue) {
      case 'available':
        show = free > 0;
        break;
      case 'full':
        show = occupancyPercentage >= 90;
        break;
      case 'empty':
        show = occupancyPercentage < 50;
        break;
      default:
        show = true;
    }
    
    if (show) {
      if (!map.hasLayer(marker)) marker.addTo(map);
    } else {
      if (map.hasLayer(marker)) map.removeLayer(marker);
    }
  });
}

function updateMapTheme(isDarkMode) {
  map.eachLayer(layer => { if (layer instanceof L.TileLayer) map.removeLayer(layer); });
  setTimeout(() => {
    (isDarkMode ? darkMap : lightMap).addTo(map);
    const ctrl = document.querySelector('.map-interaction-toggle');
    if (ctrl) ctrl.style.backgroundColor = isDarkMode ? '#333' : 'white';
    if (lastLoadedData) updateMapWithData(lastLoadedData);
  }, 50);
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.body.classList.contains('dark-mode')) updateMapTheme(true);
});

export { updateMapWithData, updateMapTheme, filterMarkers };
