import { filterMarkers } from "./map.js";

let searchInput;
let clearSearchBtn;
let sortSelect;
let availabilitySelect;
let resetButton;
let visibleCountEl;
let totalCountEl;
let parkingContainer;
let observer;

const eventListeners = [];

function addEventListenerWithCleanup(element, event, handler) {
  if (!element) return;
  
  element.addEventListener(event, handler);
  eventListeners.push({ element, event, handler });
}

function initializeFilterControls() {
  searchInput = document.getElementById('search-input');
  clearSearchBtn = document.getElementById('clear-search');
  sortSelect = document.getElementById('sort-select');
  availabilitySelect = document.getElementById('availability-select');
  resetButton = document.getElementById('reset-filters');
  visibleCountEl = document.getElementById('visible-count');
  totalCountEl = document.getElementById('total-count');
  parkingContainer = document.getElementById('parking-container');

  setupObserver();

  if (searchInput && searchInput.value.trim()) {
    updateClearButtonVisibility();
  }
}

function setupObserver() {
  if (observer) {
    observer.disconnect();
    observer = null;
  }

  if (!parkingContainer) return;

  observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (
        mutation.type === 'childList' &&
        document.querySelector('.parking-card') &&
        !document.querySelector('.skeleton-card')
      ) {
        document.querySelectorAll('.parking-card').forEach(card => {
          card.classList.add('initialized');
        });
        
        initializeFilters();
        observer.disconnect();
        observer = null;
        break;
      }
    }
  });

  observer.observe(parkingContainer, {
    childList: true,
    subtree: true,
  });
}

function initializeFilters() {
  cleanupEventListeners();
  
  if (searchInput && clearSearchBtn) {
    addEventListenerWithCleanup(searchInput, 'input', handleSearch);
    addEventListenerWithCleanup(clearSearchBtn, 'click', clearSearch);
    updateClearButtonVisibility();
  }
  
  addEventListenerWithCleanup(sortSelect, 'change', applyFilters);
  addEventListenerWithCleanup(availabilitySelect, 'change', applyFilters);
  addEventListenerWithCleanup(resetButton, 'click', resetFilters);
  
  updateCounters();
  applyFilters();
}

function handleSearch() {
  updateClearButtonVisibility();
  applyFilters();
}

function updateClearButtonVisibility() {
  if (!searchInput || !clearSearchBtn) return;
  
  const hasSearchText = searchInput.value.trim().length > 0;
  clearSearchBtn.style.opacity = hasSearchText ? '1' : '0';
  clearSearchBtn.style.pointerEvents = hasSearchText ? 'auto' : 'none';
}

function clearSearch() {
  if (!searchInput) return;
  
  searchInput.value = '';
  updateClearButtonVisibility();
  applyFilters();
  searchInput.focus();
}

function sortCards() {
  if (!parkingContainer) return;
  
  const cards = Array.from(document.querySelectorAll('.parking-card'));
  if (!cards.length) return;
  
  const sortValue = sortSelect ? sortSelect.value : 'most-available';

  const sortedCards = [...cards].sort((a, b) => {
    const aName = a.querySelector('.parking-name')?.textContent.trim() || '';
    const bName = b.querySelector('.parking-name')?.textContent.trim() || '';

    const aStats = a.querySelectorAll('.stat-value');
    const bStats = b.querySelectorAll('.stat-value');
    
    const aTotal = parseInt(aStats[0]?.textContent) || 0;
    const bTotal = parseInt(bStats[0]?.textContent) || 0;
    
    const aAvailable = parseInt(aStats[1]?.textContent) || 0;
    const bAvailable = parseInt(bStats[1]?.textContent) || 0;
    
    const aOccupied = parseInt(aStats[2]?.textContent) || 0;
    const bOccupied = parseInt(bStats[2]?.textContent) || 0;
    
    const aOccupancy = aTotal > 0 ? (aOccupied / aTotal) * 100 : 0;
    const bOccupancy = bTotal > 0 ? (bOccupied / bTotal) * 100 : 0;

    switch (sortValue) {
      case 'most-available':
        return bAvailable - aAvailable || aName.localeCompare(bName);
      case 'least-available':
        return aAvailable - bAvailable || aName.localeCompare(bName);
      case 'most-occupied':
        return bOccupancy - aOccupancy || aName.localeCompare(bName);
      case 'least-occupied':
        return aOccupancy - bOccupancy || aName.localeCompare(bName);
      case 'alphabetical':
        return aName.localeCompare(bName);
      default:
        return 0;
    }
  });

  for (let i = 0; i < sortedCards.length; i++) {
    const currentCard = Array.from(parkingContainer.children).find(el => 
      el.classList && (el.classList.contains('parking-card') || el.id === 'no-results-message')
    );
    
    const targetCard = sortedCards[i];
    
    if (currentCard && currentCard !== targetCard) {
      try {
        parkingContainer.insertBefore(targetCard, currentCard);
      } catch (e) {
        console.error('Error reordering cards:', e);
      }
    }
  }
}

function filterCards() {
  const cards = Array.from(document.querySelectorAll('.parking-card'));
  if (!cards.length) return;
  
  const filterValue = availabilitySelect ? availabilitySelect.value : 'all';
  const searchQuery = searchInput ? searchInput.value.trim().toLowerCase() : '';
  
  let anyVisible = false;

  cards.forEach(card => {
    const parkingNameElem = card.querySelector('.parking-name');
    const name = parkingNameElem ? parkingNameElem.textContent.trim().toLowerCase() : '';
    
    const statValues = card.querySelectorAll('.stat-value');
    const total = parseInt(statValues[0]?.textContent) || 0;
    const available = parseInt(statValues[1]?.textContent) || 0;
    const occupied = parseInt(statValues[2]?.textContent) || 0;
    
    const occupancyPercentage = total > 0 ? (occupied / total) * 100 : 0;

    const matchesSearch = searchQuery === '' || name.includes(searchQuery);

    let matchesFilter = true;
    switch (filterValue) {
      case 'available':
        matchesFilter = available > 0;
        break;
      case 'full':
        matchesFilter = occupancyPercentage >= 90;
        break;
      case 'empty':
        matchesFilter = occupancyPercentage < 50;
        break;
      default:
        matchesFilter = true;
        break;
    }

    const shouldShow = matchesSearch && matchesFilter;
    
    if (shouldShow) {
      if (card.style.display === 'none') {
        card.style.display = '';
      }
      anyVisible = true;
    } else {
      card.style.display = 'none';
    }
  });

  showNoResultsMessage(!anyVisible);
}

function showNoResultsMessage(show) {
  const existingMessage = document.getElementById('no-results-message');
  if (existingMessage) {
    existingMessage.remove();
  }

  if (show && parkingContainer) {
    const message = document.createElement('div');
    message.id = 'no-results-message';
    message.className = 'no-results';
    
    const searchText = searchInput && searchInput.value.trim() 
      ? `"${searchInput.value.trim()}"` 
      : '';
      
    message.innerHTML = `
      <i class="fas fa-search"></i>
      <p>No parking lots found ${searchText ? `matching ${searchText}` : 'matching your criteria'}.</p>
      <p>Try adjusting your ${searchText ? 'search term' : 'filters'}.</p>
    `;
    parkingContainer.appendChild(message);
  }
}

function applyFilters() {
  sortCards();
  filterCards();
  updateCounters();
  
  if (typeof filterMarkers === 'function') {
    const availabilityFilter = availabilitySelect ? availabilitySelect.value : 'all';
    const searchQuery = searchInput ? searchInput.value.trim() : '';
    
    filterMarkers(availabilityFilter, searchQuery);
  }
}

function resetFilters() {
  if (searchInput) {
    searchInput.value = '';
    updateClearButtonVisibility();
  }
  
  if (sortSelect) sortSelect.value = 'most-available';
  if (availabilitySelect) availabilitySelect.value = 'all';
  
  applyFilters();
}

function updateCounters() {
  if (!visibleCountEl || !totalCountEl) return;
  
  const totalCards = document.querySelectorAll('.parking-card').length;
  const visibleCards = Array.from(document.querySelectorAll('.parking-card')).filter(
    card => card.style.display !== 'none'
  ).length;

  totalCountEl.textContent = totalCards;
  visibleCountEl.textContent = visibleCards;
}

function cleanupEventListeners() {
  eventListeners.forEach(({ element, event, handler }) => {
    element.removeEventListener(event, handler);
  });
  eventListeners.length = 0;
}

function cleanup() {
  cleanupEventListeners();
  
  if (observer) {
    observer.disconnect();
    observer = null;
  }
  
  searchInput = null;
  clearSearchBtn = null;
  sortSelect = null;
  availabilitySelect = null;
  resetButton = null;
  visibleCountEl = null;
  totalCountEl = null;
  parkingContainer = null;
}

document.addEventListener('DOMContentLoaded', initializeFilterControls);

window.addEventListener('beforeunload', cleanup);

export { applyFilters, cleanup };