const updateCount = () => {
  chrome.storage.local.get(['profiles'], (result) => {
    const count = Object.keys(result.profiles || {}).length;
    document.getElementById('count').textContent = count;
  });
};

document.getElementById('exportBtn').addEventListener('click', () => {
  chrome.storage.local.get(['profiles'], (result) => {
    if (!result.profiles || Object.keys(result.profiles).length === 0) {
      alert('No profiles scraped yet!');
      return;
    }

    const dataStr = JSON.stringify(result.profiles, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    chrome.downloads.download({
      url: url,
      filename: `instagram_profiles_${Date.now()}.json`,
      saveAs: true
    });
  });
});

document.getElementById('clearBtn').addEventListener('click', () => {
  if (confirm('Clear all scraped data?')) {
    chrome.storage.local.set({ profiles: {} }, updateCount);
  }
});

// Initial count update
updateCount();