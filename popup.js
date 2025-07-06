import { processPlaylists } from './api_handler.js';

// Functie om de UI-teksten in te stellen bij het laden
function localizeHtml() {
    document.title = chrome.i18n.getMessage('appName');
    document.getElementById('popupTitle').textContent = chrome.i18n.getMessage('popupTitle');
    document.getElementById('popupExplanation').textContent = chrome.i18n.getMessage('popupExplanation');
    document.getElementById('playlist_ids').placeholder = chrome.i18n.getMessage('textareaPlaceholder');
    document.getElementById('process_button').textContent = chrome.i18n.getMessage('processButton');
}

// Voer de lokalisatie uit zodra de popup is geladen
document.addEventListener('DOMContentLoaded', localizeHtml);

// De bestaande event listener voor de knop
document.getElementById('process_button').addEventListener('click', async () => {
    const statusDiv = document.getElementById('status');
    const processButton = document.getElementById('process_button');
    
    processButton.disabled = true;
    statusDiv.textContent = chrome.i18n.getMessage('statusResettingAuth');

    try {
        // Stap 1: Forceer het verwijderen van de oude token.
        const currentToken = await new Promise(resolve => chrome.identity.getAuthToken({ interactive: false }, resolve));
        if (currentToken) {
            await new Promise(resolve => chrome.identity.removeCachedAuthToken({ token: currentToken }, resolve));
        }

        // Stap 2: Vraag een nieuwe token aan.
        const token = await new Promise((resolve, reject) => {
            chrome.identity.getAuthToken({ interactive: true }, (token) => {
                if (chrome.runtime.lastError || !token) {
                    reject(new Error(chrome.i18n.getMessage('errorGetToken')));
                } else {
                    resolve(token);
                }
            });
        });

        // Stap 3: Bevestig authenticatie.
        statusDiv.textContent = chrome.i18n.getMessage('statusAuthSuccess');

        const playlistIdsRaw = document.getElementById('playlist_ids').value;
        const playlistIds = playlistIdsRaw.split(/\r?\n/).map(id => id.trim()).filter(id => id);

        // Stap 4: Kondig de taak aan.
        if (playlistIds.length === 0) {
            statusDiv.textContent += chrome.i18n.getMessage('statusSearchingAll');
        } else {
            statusDiv.textContent += chrome.i18n.getMessage('statusProcessingInput');
        }
        
        // Stap 5: Voer de taak uit.
        const result = await processPlaylists(token, playlistIds);

        // Stap 6: Toon het eindresultaat.
        statusDiv.textContent = chrome.i18n.getMessage('statusDone', [result.message]);
        if (result.sheet_url) {
            const link = document.createElement('a');
            link.href = result.sheet_url;
            link.textContent = chrome.i18n.getMessage('openSheetLink');
            link.target = '_blank';
            statusDiv.appendChild(link);
        }

    } catch (error) {
        statusDiv.textContent = chrome.i18n.getMessage('statusError', [error.message]);
    } finally {
        processButton.disabled = false;
    }
});