To all technically skilled users:

You can install it and run it locally

-----

To all developers :

Please feel free to set up the project as a Google Chrome Web Store extension .

I myself have no personal webdomain which is a new requirement by Google for oAuth-verification for extensions that use Google/YouTube API's via the Google Cloud Platform (since Manifest v3).

It is a good program and I use it locally (which is allowed by Google) and I think it would be benificial to the community if someone made a publically available Chrome extension out of it.

Many greetings,

Karel.Test.Special

-----

# YouTube Playlist Collector Chrome Extension

Downloads all the video-links of each and everyone of your YouTube playlists into a Google Sheet by the means of the official YouTube/Google API's. 
-----

### **Belangrijke Mededeling**

Deze repository bevat de **volledig werkende code** en stelt je in staat de extensie lokaal te draaien met je eigen Google API-credentials. Volg de onderstaande stappen zorgvuldig.

Vanwege de aangescherpte verificatie-eisen van Google is het voor deze extensie niet mogelijk om het officiële OAuth-verificatieproces te doorlopen zonder een eigen, betaalde domeinnaam te registreren.

Daarom is de versie in de Chrome Web Store niet meer beschikbaar. In plaats daarvan is er deze GitHub-pagina.

---

### Installatie- en Configuratiegids

#### Stap 1: Download de Code
Kloon deze repository of download de code als een ZIP-bestand en pak het uit op je computer.
  git clone https://github.com/KarelTestSpecial/YouTube-Playlist-Collector.git

#### Stap 2: Creëer je Eigen Google Cloud Project
Je hebt je eigen API-sleutels nodig.

1.  Ga naar de [Google Cloud Console](https://console.cloud.google.com/).
2.  Maak een **Nieuw Project** aan. Geef het een duidelijke naam (bv. "Mijn Playlist Extensie").
3.  Selecteer je nieuwe project en ga naar **API's en services > Bibliotheek**.
4.  Zoek en **activeer** de volgende drie API's:
    *   **YouTube Data API v3**
    *   **Google Drive API**
    *   **Google Sheets API**
5.  Ga naar **API's en services > Inloggegevens (Credentials)**.
6.  Klik op **+ Inloggegevens aanmaken > OAuth-client-ID**.
7.  Kies als toepassingstype **Chrome-app**.
8.  Geef het een naam, bv. "Chrome Extensie Client".
9.  Laat het veld "Toepassings-ID" voor nu **leeg** en klik op **Maken**.
10. Je krijgt nu een **Client-ID**. Kopieer deze, die hebben we later nodig.

#### Stap 3: Laad de Extensie Lokaal in Chrome
1.  Open Chrome en navigeer naar `chrome://extensions`.
2.  Activeer rechtsboven de **Ontwikkelaarsmodus (Developer mode)**.
3.  Klik op de knop **Uitgepakte extensie laden (Load unpacked)**.
4.  Selecteer de map waarin je de code hebt gedownload.
5.  De extensie verschijnt nu in je lijst. Zoek de **ID** van de extensie (een lange reeks letters, bv: `abcdefghijklmnopabcdefghijklmnop`). **Kopieer deze ID.**

#### Stap 4: Koppel de Extensie aan je Google Project
1.  Ga terug naar de Google Cloud Console, naar de Client-ID die je in Stap 2 hebt gemaakt. Klik erop om deze te bewerken.
2.  Plak de **Extensie-ID** die je zojuist hebt gekopieerd in het veld **Toepassings-ID**.
3.  Klik op **Opslaan**.

#### Stap 5: Configureer het Manifest-bestand
1. Open het bestand manifest.json in de codemap.
2.  Zoek het `oauth2`-object. Vervang de bestaande `client_id` door de **Client-ID** die je in Stap 2.10 hebt gekopieerd.

    ```json
    // in manifest.json
    "oauth2": {
        "client_id": "HIER-JOUW-EIGEN-CLIENT-ID-PLAKKEN.apps.googleusercontent.com",
        "scopes": [
          // ... scopes blijven hetzelfde
        ]
    }
    ```

3.  Sla het `manifest.json`-bestand op.

#### Stap 6: Herlaad en Gebruik
Ga terug naar de `chrome://extensions` pagina.
Klik op het herlaad-icoontje (de cirkelvormige pijl) op de kaart van je "YouTube Playlist Collector" extensie. Dit is een **essentiële stap** om de wijzigingen in `manifest.json` te laden.
Klik op het extensie-icoon in je werkbalk om te beginnen. De eerste keer zal Google je vragen om in te loggen en toestemming te geven.
