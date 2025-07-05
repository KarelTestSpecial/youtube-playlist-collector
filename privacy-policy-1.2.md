# Privacy Policy for YouTube Playlist Collector

**Last Updated: July 5, 2025**

This Privacy Policy explains how YouTube Playlist Collector ("the extension") handles your data. Your privacy is critically important to us. Our guiding principle is to collect the minimum data necessary for the extension to function and to be fully transparent about our processes.

## 1. The Principle of "No Data Stored"

**The extension does not have its own server and does not collect, store, or transmit any of your personal data to any third party.**

All operations happen directly between your local browser and the official Google APIs (YouTube, Google Sheets, Google Drive).

## 2. Permissions (Scopes) We Request and Why

When you authorize the extension, we request your permission for specific "scopes". Here is a list of the scopes we request and a clear explanation for why each one is necessary:

*   **`https://www.googleapis.com/auth/youtube`**
    *   **Purpose:** This is the core permission for managing your playlists. It allows the extension to perform actions on your behalf, but only when you initiate them by clicking a button.
    *   **Usage:**
        *   **Read access:** To retrieve a list of your playlists and the videos within them ("Process Playlists" button).
        *   **Write access:** To create new playlists, add videos to a playlist, or remove videos from a playlist based on the content of your Google Sheet ("Upload to YouTube" button).

*   **`https://www.googleapis.com/auth/spreadsheets`**
    *   **Purpose:** To create and manage the Google Sheet where your playlist data is stored.
    *   **Usage:** The extension uses this to create a new sheet named "My YouTube Playlist Collection", create tabs for each playlist, and write/update the video information (title, link, video ID) in that sheet.

*   **`https://www.googleapis.com/auth/drive.file`**
    *   **Purpose:** This is a specific and secure permission that allows the extension to access **only the files it has created itself**.
    *   **Usage:** We use this to find the "My YouTube Playlist Collection" sheet in your Google Drive without having access to any of your other files, ensuring your privacy.

*   **`https://www.googleapis.com/auth/userinfo.email`** and **`https://www.googleapis.com/auth/userinfo.profile`**
    *   **Purpose:** To identify you as a Google user during the standard authentication process.
    *   **Usage:** This is part of the default Google Sign-In flow and helps confirm that you are logged in. The extension does not store or use this information for any other purpose.

## 3. Data Storage

As stated, we do not store your data. The only place where data is "stored" is within the **"My YouTube Playlist Collection" Google Sheet**, which is located in **your own Google Drive account**, under your full control.

## 4. Changes to This Privacy Policy

We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date at the top.

## 5. Contact Us

If you have any questions about this Privacy Policy, please open an issue on our GitHub page: https://github.com/KarelTestSpecial/youtube-playlist-collector/issues
