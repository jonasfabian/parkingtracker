document.addEventListener('DOMContentLoaded', async () => {
    const themeToggle = document.getElementById('theme-toggle');
    
    themeToggle.innerHTML = '<i class="fas fa-sun"></i><i class="fas fa-moon"></i>';
    
    const savedTheme = localStorage.getItem('theme');
    const isDarkMode = savedTheme === 'dark';
    
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    }
    
    let mapModule;
    try {
      mapModule = await import('./map.js');
    } catch (error) {
      console.error('Error importing map module:', error);
    }
    
    themeToggle.addEventListener('click', () => {
      const currentIsDarkMode = document.body.classList.contains('dark-mode');
      
      if (currentIsDarkMode) {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('theme', 'light');
      } else {
        document.body.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark');
      }

      if (mapModule && mapModule.updateMapTheme) {
        mapModule.updateMapTheme(!currentIsDarkMode);
      }
    });
    
    const refreshButton = document.getElementById('refresh-button');
    refreshButton.addEventListener('click', () => {
      window.loadData();
    });
  });
  