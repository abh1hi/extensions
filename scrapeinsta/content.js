// Debounce function to prevent multiple scrapes
const debounce = (func, wait = 1000) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
};

const extractProfileData = () => {
  try {
    const pathSegments = window.location.pathname.split('/').filter(Boolean);
    if (pathSegments.length !== 1 && pathSegments[0] !== 'p') return;

    const username = pathSegments[0] === 'p' ? pathSegments[1] : pathSegments[0];
    const profileName = document.querySelector('header section h1')?.textContent || '';
    const bioElement = document.getElementsByClassName("_ap3a");
    const bio = bioElement[2].innerText;
    const emailMatch = bio.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
    const links = Array.from(document.querySelectorAll('header section a')).map(a => a.href);
    const followers = document.querySelector('header section li a')?.textContent || '';
    const profilePic = document.querySelector('header section img')?.src || '';
    const titletag = bioElement[1].innerText;

    return {
      username,
      profileName,
      bio,
      titletag,
      email: emailMatch ? emailMatch[0] : '',
      links,
      followers,
      profilePic,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Scraping error:', error);
    return null;
  }
};

const saveProfileData = debounce(() => {
  const profileData = extractProfileData();
  if (!profileData) return;

  chrome.storage.local.get(['profiles'], (result) => {
    const profiles = result.profiles || {};
    profiles[profileData.username] = profileData;
    chrome.storage.local.set({ profiles });
  });
});

// Run on initial load and URL changes
let lastUrl = location.href;
new MutationObserver(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    saveProfileData();
  }
}).observe(document, { subtree: true, childList: true });

// Initial check
saveProfileData();