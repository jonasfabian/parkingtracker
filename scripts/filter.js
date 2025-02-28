document.addEventListener('DOMContentLoaded', () => {
    const sortSelect = document.getElementById('sort-select');
    const availabilitySelect = document.getElementById('availability-select');
    const resetButton = document.getElementById('reset-filters');
    const visibleCountEl = document.getElementById('visible-count');
    const totalCountEl = document.getElementById('total-count');
  
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList' && 
            document.querySelector('.parking-card') && 
            !document.querySelector('.skeleton-card')) {
          initializeFilters();
          observer.disconnect();
          break;
        }
      }
    });
  
    observer.observe(document.getElementById('parking-container'), {
      childList: true,
      subtree: true
    });
  
    function initializeFilters() {
      updateCounters();
      
      sortSelect.addEventListener('change', applyFilters);
      availabilitySelect.addEventListener('change', applyFilters);
      resetButton.addEventListener('click', resetFilters);
      
      applyFilters();
    }
  
    function applyFilters() {
      const cards = Array.from(document.querySelectorAll('.parking-card'));
      const container = document.getElementById('parking-container');
      
      filterByAvailability(cards);
      
      sortCards(cards.filter(card => !card.classList.contains('hidden')));
      
      updateCounters();
    }

    function filterByAvailability(cards) {
      const filterValue = availabilitySelect.value;
      
      cards.forEach(card => {
        const totalEl = card.querySelector('.stat-value.capacity');
        const availableEl = card.querySelector('.stat-value.available');
        const occupiedEl = card.querySelector('.stat-value.filled');
        
        if (!totalEl || !availableEl || !occupiedEl) return;
        
        const total = parseInt(totalEl.textContent) || 0;
        const available = parseInt(availableEl.textContent) || 0;
        const occupied = parseInt(occupiedEl.textContent) || 0;
        
        let occupancyPercentage = 0;
        if (total > 0) {
          occupancyPercentage = (occupied / total) * 100;
        }
        
        switch (filterValue) {
          case 'available':
            card.classList.toggle('hidden', available <= 0);
            break;
          case 'full':
            card.classList.toggle('hidden', occupancyPercentage < 90);
            break;
          case 'empty':
            card.classList.toggle('hidden', occupancyPercentage >= 50);
            break;
          default:
            card.classList.remove('hidden');
            break;
        }
      });
    }
  
    function sortCards(visibleCards) {
      const sortValue = sortSelect.value;
      const container = document.getElementById('parking-container');
      
      visibleCards.sort((a, b) => {
        const aNameEl = a.querySelector('.parking-name');
        const bNameEl = b.querySelector('.parking-name');
        
        const aTotalEl = a.querySelector('.stat-value.capacity');
        const bTotalEl = b.querySelector('.stat-value.capacity');
        
        const aAvailableEl = a.querySelector('.stat-value.available');
        const bAvailableEl = b.querySelector('.stat-value.available');
        
        const aOccupiedEl = a.querySelector('.stat-value.filled');
        const bOccupiedEl = b.querySelector('.stat-value.filled');
        
        const aName = aNameEl ? aNameEl.textContent : '';
        const bName = bNameEl ? bNameEl.textContent : '';
        
        const aTotal = aTotalEl ? parseInt(aTotalEl.textContent) || 0 : 0;
        const bTotal = bTotalEl ? parseInt(bTotalEl.textContent) || 0 : 0;
        
        const aAvailable = aAvailableEl ? parseInt(aAvailableEl.textContent) || 0 : 0;
        const bAvailable = bAvailableEl ? parseInt(bAvailableEl.textContent) || 0 : 0;
        
        const aOccupied = aOccupiedEl ? parseInt(aOccupiedEl.textContent) || 0 : 0;
        const bOccupied = bOccupiedEl ? parseInt(bOccupiedEl.textContent) || 0 : 0;
        
        let aOccupancyPercentage = aTotal > 0 ? (aOccupied / aTotal) * 100 : 0;
        let bOccupancyPercentage = bTotal > 0 ? (bOccupied / bTotal) * 100 : 0;
        
        switch (sortValue) {
          case 'most-available':
            return bAvailable - aAvailable;
          case 'least-available':
            return aAvailable - bAvailable;
          case 'most-occupied':
            return bOccupancyPercentage - aOccupancyPercentage;
          case 'least-occupied':
            return aOccupancyPercentage - bOccupancyPercentage;
          case 'alphabetical':
            return aName.localeCompare(bName);
          default:
            return 0;
        }
      });
      
      visibleCards.forEach(card => container.appendChild(card));
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