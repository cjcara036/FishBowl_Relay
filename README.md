# Fishbowl Relay 🐠

A serverless, static web application that simulates a "Fishbowl" random drawing game. It uses a **"Pass-the-Parcel"** architecture where the entire state of the game (items remaining, draw history) is compressed and encoded directly into the URL hash.

**No backend database required.** Hosted entirely on GitHub Pages.

## 🚀 Features

* **Zero Backend:** Runs 100% in the client browser using HTML, CSS, and JS.
* **State-in-URL:** The game database lives in the shareable link.
* **Smart Compression:** Uses `LZ-String` to compress game data, allowing for larger bowls in shorter URLs.
* **Material 3 Design:** Vibrant "Party Mode" UI with high-contrast accessibility (Deep Purple, Neon Green, Amber).
* **Bulletin Board:** Real-time history log showing who drew what.
* **Mobile Friendly:** Integrated Native Share Sheet support for easy link passing.
* **Final Tally:** Automatically generates a read-only scoreboard link when the bowl is empty.

## 🕹️ How to Play (The Relay System)

Because there is no central server, this game works like a digital relay race:

1.  **Setup:** The **Host** adds items to the bowl (supports bulk entry via quantity) and clicks **"Start Chain"**.
2.  **Share:** The Host sends the generated link to **Player 1**.
3.  **Draw:** Player 1 opens the link, enters their name, and draws an item.
4.  **Pass:** The app generates a **NEW** link (containing Player 1's result). Player 1 must send this *updated* link to **Player 2**.
5.  **Repeat:** Player 2 opens the link, sees the history on the Bulletin Board, draws their item, and passes the *next* link to Player 3.

> **⚠️ CRITICAL RULE:** You must always send the **NEW** link generated after your turn. If you share an old link, the next player will not see the previous draws.

## 🛠️ Installation & Deployment

This project is designed to be hosted for free on **GitHub Pages**.

1.  **Create a Repository:** Create a new repo on GitHub.
2.  **Upload Files:** Upload `index.html`, `style.css`, and `script.js` to the root of the repository.
3.  **Enable GitHub Pages:**
    * Go to **Settings** > **Pages**.
    * Under **Source**, select `Deploy from a branch`.
    * Select `main` (or `master`) and click **Save**.
4.  **Play:** GitHub will provide a live URL (e.g., `https://yourname.github.io/repo-name/`).

## 📂 Project Structure

* **`index.html`**: Main application structure. Imports Material Symbols and the `lz-string` library via CDN.
* **`style.css`**: Custom CSS implementing Material 3 tokens.
    * *Primary Theme:* Deep Purple (`#6200EE`)
    * *Success/Result:* High-Contrast Neon Green (`#00E676` bg / `#00210B` text)
    * *Game Over:* Bright Amber (`#FFC400`)
* **`script.js`**: Handles game logic, state management, LZ-compression, and DOM updates.

## 🧠 Technical Details

### The "Nonce" (State Storage)
Instead of a database ID, the URL hash contains the full JSON state object:
```json
{
  "items": [
    { "n": "Entry Name", "d": "User Name" },
    { "n": "Undrawn Item", "d": null }
  ]
}
```
This object is stringified and compressed using LZString.compressToEncodedURIComponent.

## Legacy Support
The application includes a fallback mechanism. It attempts to decompress the hash first. If that fails, it attempts to parse standard Base64 (legacy links). This ensures backward compatibility if link formats change.

## 📜 License
This project is open source. Feel free to fork and modify!
