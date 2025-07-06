# Privacy Policy for YouTube Playlist Exporter

**Last Updated: 2025.07.06**

This privacy policy explains how the "YouTube Playlist Collector" Chrome Extension ("the Extension") handles user data. Your privacy and security are of the utmost importance to us.

## 1. Data Collection and Usage

The Extension is designed with a "single purpose": to export your YouTube playlists to a Google Sheet in your Google Drive. To achieve this, the Extension requires access to certain Google services on your behalf.

The Extension handles the following types of data:

*   **Authentication Information:** We use Google's official OAuth2 flow via the `chrome.identity` API to securely authenticate you with your Google Account. This provides the Extension with a temporary access token. This token is used solely to make requests to Google's APIs and is never stored or transmitted to any third-party servers.

*   **Website Content:**
    *   **YouTube Data (Read-Only):** The Extension reads the list of your YouTube playlists and the titles and video IDs within those playlists. This access is read-only. The Extension cannot and will not modify, delete, or upload any content to your YouTube account.
    *   **Google Drive & Sheets Data (Limited Create/Write):** The Extension uses access to your Google Drive to find or create a single spreadsheet file named "My YouTube Playlists". It then writes the collected video titles and links into this spreadsheet. The Extension does not read, modify, or delete any other files in your Google Drive.

## 2. Data Storage and Sharing

**No data is stored on our servers.** All operations occur directly between your browser and Google's servers. The playlist data you export is stored only in the Google Sheet created in your own Google Drive account, under your full control.

We do not share, sell, rent, or trade your data with any third parties for any purpose.

## 3. Permissions Justification

*   **`identity`:** Required to securely authenticate the user.
*   **`https://www.googleapis.com/`:** Required to communicate with the YouTube, Google Drive, and Google Sheets APIs, which is the core functionality of the Extension.

## 4. Changes to This Policy

We may update this privacy policy from time to time. We will notify you of any changes by posting the new privacy policy here.

## 5. Contact Us

If you have any questions about this Privacy Policy, please contact us through the support options available in the Chrome Web Store.
