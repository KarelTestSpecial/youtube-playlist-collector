# YouTube Playlist Collector

**Collect every video from a YouTube playlist into a CSV file.**

A Manifest V3 browser extension that reads all videos from the playlist you are
currently viewing and exports them as a spreadsheet-ready CSV — title and URL
per row, ready for further processing or archiving.

## What it does

1. Open any YouTube playlist page.
2. Click the extension icon.
3. It scrolls through the playlist and collects every video it finds.
4. Click **Download CSV** and save the file.

The export contains two columns:

```
"Video Title","Video URL"
"Never Gonna Give You Up","https://www.youtube.com/watch?v=dQw4w9WgXcQ"
```

Titles are quoted and internal quotes are doubled, so a title containing a comma
or a quotation mark does not break the file's column structure.

## Permissions, and why they are needed

| Permission | Reason |
|---|---|
| `scripting` | Read the videos on the open playlist page |
| `declarativeContent` | Offer the extension action on YouTube pages only |
| `https://www.youtube.com/*` | The only host this extension ever touches |

The extension makes **no network requests of its own**. Collected data stays in
memory until you download the file; there is no server, no analytics, and
nothing is sent anywhere.

## Installation

### As a user
Download the latest `youtubeplaylistcollector-<version>.zip`, unzip it, then in
Chrome open `chrome://extensions`, enable **Developer mode**, choose **Load
unpacked** and select the unzipped folder.

### As a developer
```bash
git clone git@github.com:KarelTestSpecial/youtube-playlist-collector.git
cd youtube-playlist-collector/youtubeplaylistcollector
```
Then **Load unpacked** as described above. Changes to the source require a
reload of the extension in `chrome://extensions`.

## Files

| File | Purpose |
|---|---|
| `manifest.json` | Extension manifest (Manifest V3) |
| `background.js` | Service worker; orchestrates the collection |
| `popup.js` | Popup UI logic and the CSV export |
| `index.html` | Popup markup and styles |
| `styles.css` | Styling |
| `icons/` | 16/48/128 px icons |

## Version history

Releases are published as zips next to the source. See the repository releases
and the `version` field in `manifest.json` for the current version.