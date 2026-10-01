// This function will be injected into the active YouTube tab.
// It scrolls the page to load all videos, then scrapes the playlist data.
async function contentScraper() {
  const scrollContainer = document.documentElement;
  let lastHeight = -1;
  let stableScrolls = 0;
  const STABILITY_THRESHOLD = 5; // require 5 consecutive scroll checks with no height change

  // Scroll down until the page height stabilizes
  while (stableScrolls < STABILITY_THRESHOLD) {
    scrollContainer.scrollTop = scrollContainer.scrollHeight;
    // Wait for new content to potentially load
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (scrollContainer.scrollHeight === lastHeight) {
      stableScrolls++;
    } else {
      stableScrolls = 0;
      lastHeight = scrollContainer.scrollHeight;
    }
  }

  // Now that scrolling is done, scrape the data.
  const playlistTitleElement = document.querySelector('h1.ytd-playlist-header-renderer');
  const playlistTitle = playlistTitleElement ? playlistTitleElement.innerText.trim() : "Untitled YouTube Playlist";

  const videoElements = document.querySelectorAll('ytd-playlist-video-renderer');
  
  const videos = Array.from(videoElements).map(el => {
    const titleEl = el.querySelector('#video-title');
    const linkEl = el.querySelector('a#video-title');
    const videoId = linkEl ? new URLSearchParams(new URL(linkEl.href).search).get('v') : null;
    return {
      title: titleEl ? titleEl.innerText.trim() : 'Unknown Title',
      videoId: videoId,
    };
  }).filter(v => v.videoId); // Filter out any items where a video ID could not be found.

  return { title: playlistTitle, items: videos, itemCount: videos.length };
}

// When the extension is installed, set up the rules for when it should be active.
chrome.runtime.onInstalled.addListener(() => {
  chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
    chrome.declarativeContent.onPageChanged.addRules([
      {
        // This rule activates the extension on pages with "youtube.com/playlist" in the URL.
        conditions: [
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: {
              hostContains: 'youtube.com',
              pathContains: 'playlist',
            },
          }),
        ],
        // If the conditions are met, show the extension's action (popup).
        actions: [new chrome.declarativeContent.ShowAction()],
      },
    ]);
  });
});

// Listen for messages from the popup script.
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "scrapePlaylist") {
    chrome.tabs.query({ active: true, currentWindow: true }).then(([activeTab]) => {
      if (activeTab && activeTab.id) {
        chrome.scripting.executeScript({
          target: { tabId: activeTab.id },
          func: contentScraper,
        }).then(injectionResults => {
          if (chrome.runtime.lastError) {
            sendResponse({ error: `Injection failed: ${chrome.runtime.lastError.message}` });
            return;
          }
          if (injectionResults && injectionResults[0] && injectionResults[0].result) {
              sendResponse({ data: injectionResults[0].result });
          } else {
            sendResponse({ error: "Could not extract playlist data from the page." });
          }
        }).catch(err => {
            sendResponse({ error: `Script execution failed: ${err.message}` });
        });
      } else {
        sendResponse({ error: "Could not find an active tab to scrape." });
      }
    }).catch(err => {
        sendResponse({ error: `Tab query failed: ${err.message}` });
    });
    return true; // Indicates that the response will be sent asynchronously.
  }
});