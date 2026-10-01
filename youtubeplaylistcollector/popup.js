document.addEventListener('DOMContentLoaded', () => {
  const states = {
    ready: document.getElementById('ready-state'),
    exporting: document.getElementById('exporting-state'),
    success: document.getElementById('success-state'),
    error: document.getElementById('error-state'),
  };

  const buttons = {
    exportBtn: document.getElementById('export-btn'),
    downloadBtn: document.getElementById('download-btn'),
    successResetBtn: document.getElementById('success-reset-btn'),
    errorResetBtn: document.getElementById('error-reset-btn'),
  };

  const textElements = {
    successCount: document.getElementById('success-count'),
    errorMessage: document.getElementById('error-message'),
  };

  let exportedPlaylistData = null;

  const showState = (stateName) => {
    for (const key in states) {
      if (states[key]) {
        states[key].style.display = key === stateName ? '' : 'none';
      }
    }
  };

  const getErrorMessage = (error) => {
    if (!error) return "An unknown error occurred.";
    if (typeof error === 'string') return error;
    if (error.message) return error.message;
    return "An unexpected error occurred. Check the console for details.";
  };

  const handleExport = () => {
    showState('exporting');
    chrome.runtime.sendMessage({ action: "scrapePlaylist" }, (response) => {
      if (chrome.runtime.lastError) {
        textElements.errorMessage.textContent = getErrorMessage(chrome.runtime.lastError);
        showState('error');
        return;
      }
      if (response.error) {
        textElements.errorMessage.textContent = getErrorMessage(response.error);
        showState('error');
        return;
      }
      if (response.data) {
        if (response.data.itemCount === 0) {
          textElements.errorMessage.textContent = "No videos were found in this playlist. Please ensure the playlist page is fully loaded and try again.";
          showState('error');
          return;
        }
        exportedPlaylistData = response.data;
        textElements.successCount.textContent = response.data.itemCount;
        showState('success');
      } else {
        textElements.errorMessage.textContent = "Received an empty or invalid response from the background script.";
        showState('error');
      }
    });
  };

  const downloadAsCSV = (playlist) => {
    if (!playlist) return;
    const header = '"Video Title","Video URL"\n';
    const rows = playlist.items
      .map(item => {
        const sanitizedTitle = `"${item.title.replace(/"/g, '""')}"`;
        const url = `"https://www.youtube.com/watch?v=${item.videoId}"`;
        return [sanitizedTitle, url].join(',');
      })
      .join('\n');

    const csvContent = header + rows;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    
    const safeFilename = playlist.title.replace(/[^a-z0-9_.-]/gi, '_').substring(0, 50);
    link.setAttribute('download', `${safeFilename}_collection.csv`);
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    exportedPlaylistData = null;
    textElements.errorMessage.textContent = '';
    showState('ready');
  };

  buttons.exportBtn.addEventListener('click', handleExport);
  buttons.downloadBtn.addEventListener('click', () => downloadAsCSV(exportedPlaylistData));
  buttons.successResetBtn.addEventListener('click', handleReset);
  buttons.errorResetBtn.addEventListener('click', handleReset);

  showState('ready'); // Initial state
});