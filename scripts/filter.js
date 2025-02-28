import { filterMarkers } from "./map.js";

document.addEventListener('DOMContentLoaded', () => {
  const sortSelect = document.getElementById('sort-select');
  const availabilitySelect = document.getElementById('availability-select');
  const resetButton = document.getElementById('reset-filters');
  const visibleCountEl = document.getElementById('visible-count');
  const totalCountEl = document.getElementById('total-count');

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (
        mutation.type === 'childList' &&
        document.querySelector('.parking-card') &&
        !document.querySelector('.skeleton-card')
      ) {
        initializeFilters();
        observer.disconnect();
        break;
      }
    }
  });

  observer.observe(document.getElementById('parking-container'), {
    childList: true,
    subtree: true,
  });

  function initializeFilters() {
    updateCounters();

    sortSelect.addEventListener('change', applyFilters);
    availabilitySelect.addEventListener('change', applyFilters);
    resetButton.addEventListener('click', resetFilters);

    applyFilters();
  }

  function sortCards() {
    const container = document.getElementById('parking-container');
    const cards = Array.from(document.querySelectorAll('.parking-card'));
    const sortValue = sortSelect.value;

    cards.sort((a, b) => {
      const aName = a.querySelector('.parking-name')?.textContent.trim() || '';
      const bName = b.querySelector('.parking-name')?.textContent.trim() || '';

      const aTotal = parseInt(a.querySelector('.stat-value.capacity')?.textContent) || 0;
      const bTotal = parseInt(b.querySelector('.stat-value.capacity')?.textContent) || 0;

      const aAvailable = parseInt(a.querySelector('.stat-value.available')?.textContent) || 0;
      const bAvailable = parseInt(b.querySelector('.stat-value.available')?.textContent) || 0;

      const aOccupied = parseInt(a.querySelector('.stat-value.filled')?.textContent) || 0;
      const bOccupied = parseInt(b.querySelector('.stat-value.filled')?.textContent) || 0;

      const aOccupancy = aTotal > 0 ? (aOccupied / aTotal) * 100 : 0;
      const bOccupancy = bTotal > 0 ? (bOccupied / bTotal) * 100 : 0;

      switch (sortValue) {
        case 'most-available':
          return bAvailable - aAvailable;
        case 'least-available':
          return aAvailable - bAvailable;
        case 'most-occupied':
          return bOccupancy - aOccupancy;
        case 'least-occupied':
          return aOccupancy - bOccupancy;
        case 'alphabetical':
          return aName.localeCompare(bName);
        default:
          return 0;
      }
    });

    cards.forEach(card => container.appendChild(card));
  }

  function filterCards() {
    const cards = Array.from(document.querySelectorAll('.parking-card'));
    const filterValue = availabilitySelect.value;

    cards.forEach(card => {
      const totalEl = card.querySelector('.stat-value.capacity');
      const availableEl = card.querySelector('.stat-value.available');
      const occupiedEl = card.querySelector('.stat-value.filled');

      if (!totalEl || !availableEl || !occupiedEl) return;

      const total = parseInt(totalEl.textContent) || 0;
      const available = parseInt(availableEl.textContent) || 0;
      const occupied = parseInt(occupiedEl.textContent) || 0;

      const occupancyPercentage = total > 0 ? (occupied / total) * 100 : 0;

      let shouldShow = true;
      switch (filterValue) {
        case 'available':
          shouldShow = available > 0;
          break;
        case 'full':
          shouldShow = occupancyPercentage >= 90;
          break;
        case 'empty':
          shouldShow = occupancyPercentage < 50;
          break;
        default:
          shouldShow = true;
          break;
      }

      if (shouldShow) {
        card.classList.remove('hidden');
      } else {
        card.classList.add('hidden');
      }
    });
  }

  function applyFilters() {
    sortCards();
    filterCards();
    updateCounters();
    filterMarkers(availabilitySelect.value);
  }

  function resetFilters() {
    sortSelect.value = 'most-available';
    availabilitySelect.value = 'all';

    document.querySelectorAll('.parking-card').forEach(card => {
      card.classList.remove('hidden');
    });

    applyFilters();
  }

  function updateCounters() {
    const totalCards = document.querySelectorAll('.parking-card').length;
    const visibleCards = document.querySelectorAll('.parking-card:not(.hidden)').length;

    totalCountEl.textContent = totalCards;
    visibleCountEl.textContent = visibleCards;
  }
});
