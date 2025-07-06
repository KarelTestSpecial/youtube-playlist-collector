// Gebruik de vertaalde naam voor de spreadsheet.
const SPREADSHEET_NAME = chrome.i18n.getMessage("spreadsheetName");

// Helper voor API calls (ongewijzigd)
async function googleApiFetch(url, token, options = {}) {
    const response = await fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error.message || `API Error: ${response.status}`);
    }
    return response.json();
}

// findOrCreateSpreadsheet is ongewijzigd
async function findOrCreateSpreadsheet(token) {
    const driveQuery = `name='${SPREADSHEET_NAME}' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`;
    const driveUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(driveQuery)}&fields=files(id)`;
    
    const driveResponse = await googleApiFetch(driveUrl, token);

    if (driveResponse.files && driveResponse.files.length > 0) {
        const spreadsheetId = driveResponse.files[0].id;
        return { spreadsheetId, isNew: false };
    } else {
        const sheetsUrl = `https://sheets.googleapis.com/v4/spreadsheets`;
        const createResponse = await googleApiFetch(sheetsUrl, token, {
            method: 'POST',
            body: JSON.stringify({ properties: { title: SPREADSHEET_NAME } })
        });
        return { spreadsheetId: createResponse.spreadsheetId, isNew: true };
    }
}

// fetchAllUserPlaylistIds is ongewijzigd
async function fetchAllUserPlaylistIds(token) {
    const allIds = [];
    const messages = [];

    try {
        const channelsUrl = `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&mine=true`;
        const channelsResponse = await googleApiFetch(channelsUrl, token);
        const relatedPlaylists = channelsResponse.items?.[0]?.contentDetails?.relatedPlaylists;

        if (relatedPlaylists) {
            if (relatedPlaylists.likes) allIds.push(relatedPlaylists.likes);
            if (relatedPlaylists.watchLater) allIds.push(relatedPlaylists.watchLater);
            else messages.push(chrome.i18n.getMessage("noteWatchLater"));
        }
    } catch (error) {
        messages.push(chrome.i18n.getMessage("noteSpecialPlaylists"));
    }

    let nextPageToken = null;
    do {
        let url = `https://www.googleapis.com/youtube/v3/playlists?part=snippet&mine=true&maxResults=50`;
        if (nextPageToken) { url += `&pageToken=${nextPageToken}`; }
        try {
            const response = await googleApiFetch(url, token);
            if (response.items) { allIds.push(...response.items.map(item => item.id)); }
            nextPageToken = response.nextPageToken;
        } catch (error) {
            nextPageToken = null; 
        }
    } while (nextPageToken);

    const uniqueIds = [...new Set(allIds)];
    return { ids: uniqueIds, messages };
}

// AANGEPAST: Deze functie voert de resize-actie niet meer zelf uit, maar geeft het verzoek terug.
async function processSinglePlaylist(token, playlistId, spreadsheetId) {
    const playlistInfo = await googleApiFetch(`https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${playlistId}`, token);
    if (!playlistInfo.items || playlistInfo.items.length === 0) {
        return { resultMessage: chrome.i18n.getMessage("errorPlaylistNotFound", playlistId), resizeRequest: null };
    }
    const playlistTitle = playlistInfo.items[0].snippet.title;

    let sheetId;

    try {
        const addSheetRequest = { requests: [{ addSheet: { properties: { title: playlistTitle } } }] };
        const addSheetResponse = await googleApiFetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, token, {
            method: 'POST',
            body: JSON.stringify(addSheetRequest)
        });
        sheetId = addSheetResponse.replies[0].addSheet.properties.sheetId;
    } catch (e) {
        await googleApiFetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(playlistTitle)}:clear`, token, { method: 'POST' });
        
        try {
            const sheetMeta = await googleApiFetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties`, token);
            const existingSheet = sheetMeta.sheets.find(s => s.properties.title === playlistTitle);
            if (existingSheet) sheetId = existingSheet.properties.sheetId;
        } catch (metaError) {
            console.error("Kon sheetId voor bestaand blad niet ophalen:", metaError);
        }
    }

    const headers = [["Titel", "Link"]];
    const updateUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(playlistTitle)}!A1:append?valueInputOption=USER_ENTERED`;
    await googleApiFetch(updateUrl, token, { method: 'POST', body: JSON.stringify({ values: headers }) });
    
    let videoCount = 0;
    let nextPageToken = null;
    const videoRows = [];
    do {
        let itemsUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=50`;
        if (nextPageToken) { itemsUrl += `&pageToken=${nextPageToken}`; }
        const response = await googleApiFetch(itemsUrl, token);
        for (const item of response.items) {
            if (!item.snippet.resourceId || !item.snippet.resourceId.videoId) continue;
            videoRows.push([item.snippet.title, `https://www.youtube.com/watch?v=${item.snippet.resourceId.videoId}`]);
            videoCount++;
        }
        nextPageToken = response.nextPageToken;
    } while (nextPageToken);

    if (videoRows.length > 0) {
        await googleApiFetch(updateUrl, token, { method: 'POST', body: JSON.stringify({ values: videoRows }) });
    }

    let resizeRequest = null;
    if (sheetId) {
        resizeRequest = {
            autoResizeDimensions: {
                dimensions: {
                    sheetId: sheetId,
                    dimension: "COLUMNS",
                    startIndex: 0,
                    endIndex: 2
                }
            }
        };
    }

    return {
        resultMessage: chrome.i18n.getMessage("successProcessPlaylist", [videoCount.toString(), playlistTitle]),
        resizeRequest: resizeRequest
    };
}

// AANGEPAST: Hoofdfunctie verzamelt nu alle resize-verzoeken en stuurt ze als één batch.
export async function processPlaylists(token, playlistIds) {
    let userMessages = [];
    if (playlistIds.length === 0) {
        const playlistData = await fetchAllUserPlaylistIds(token);
        playlistIds = playlistData.ids;
        userMessages = playlistData.messages;
        if (playlistIds.length === 0) {
            return { message: chrome.i18n.getMessage("errorNoPlaylistsFound"), sheet_url: null };
        }
    }

    const sheetInfo = await findOrCreateSpreadsheet(token);
    const results = [];
    const resizeRequests = []; // Array om alle resize-verzoeken te verzamelen

    for (const pid of playlistIds) {
        try {
            const singleResult = await processSinglePlaylist(token, pid, sheetInfo.spreadsheetId);
            results.push(singleResult.resultMessage);
            if (singleResult.resizeRequest) {
                resizeRequests.push(singleResult.resizeRequest);
            }
        } catch (error) {
            const errorMessage = chrome.i18n.getMessage("errorProcessingPlaylist", [pid, error.message]);
            console.error(errorMessage, error);
            results.push(errorMessage);
        }
    }

    // Voer alle resize-verzoeken in één keer uit NA de loop
    if (resizeRequests.length > 0) {
        console.log(`Bezig met het uitvoeren van ${resizeRequests.length} kolombreedte-aanpassingen in één batch...`);
        try {
            await googleApiFetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetInfo.spreadsheetId}:batchUpdate`, token, {
                method: 'POST',
                body: JSON.stringify({ requests: resizeRequests })
            });
        } catch (e) {
            console.error("Fout bij het batchen van kolombreedte-aanpassingen:", e);
            // Optioneel: voeg een foutmelding toe aan de resultaten voor de gebruiker
            results.push("Kon niet alle kolombreedtes automatisch aanpassen vanwege een API-fout.");
        }
    }

    const successNeedle = chrome.i18n.getMessage("successProcessPlaylist", ["", ""]).split(" ")[0];
    if (sheetInfo.isNew && results.some(r => r.startsWith(successNeedle))) {
        try {
            await googleApiFetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetInfo.spreadsheetId}:batchUpdate`, token, {
                method: 'POST',
                body: JSON.stringify({ requests: [{ deleteSheet: { sheetId: 0 } }] })
            });
        } catch (e) {
            console.error("Kon standaard blad niet verwijderen:", e);
        }
    }

    const finalMessage = chrome.i18n.getMessage("summaryComplete", [[...userMessages, ...results].join("\n")]);
    const sheetUrl = `https://docs.google.com/spreadsheets/d/${sheetInfo.spreadsheetId}`;
    
    return { message: finalMessage, sheet_url: sheetUrl };
}