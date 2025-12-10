# Fishbowl Relay 🐠

A serverless, static web application that simulates a "Fishbowl" random drawing game. It uses a **"Pass-the-Parcel"** architecture where the state of the game (who drew what, what's left in the bowl) is encoded directly into the URL hash.

**No database required.** Hosted entirely on GitHub Pages.

## 🚀 Features

* **Zero Backend:** Runs 100% in the browser using HTML, CSS, and JS.
* **State-in-URL:** The entire game database lives in the shareable link.
* **Material 3 Design:** Modern, accessible UI styled with Google's Material 3 guidelines.
* **Bulletin Board:** See history of who drew what as the link travels from person to person.
* **Privacy:** No data is stored on any server; it only exists on the users' devices and the links they share.

## 🕹️ How to Play (The Relay System)

Because there is no central server, this game works like a relay race:

1.  **Setup:** The Host adds items to the bowl and clicks "Start Chain".
2.  **Share:** The Host copies the generated link and sends it to **Player 1**.
3.  **Draw:** Player 1 opens the link, enters their name, and draws an item.
4.  **Pass:** The app generates a **NEW** link (containing Player 1's result). Player 1 copies this new link and sends it to **Player 2**.
5.  **Repeat:** Player 2 opens the link, sees what Player 1 drew on the Bulletin Board, draws their own item, and passes the *next* link to Player 3.

> **⚠️ Crucial:** You must send the *updated* link to the next person. If you reuse an old link, the next player will not see the previous draws.

## 🛠️ Installation & Deployment

You can host this for free using GitHub Pages.

1.  **Fork or Clone** this repository.
2.  **Enable GitHub Pages:**
    * Go to your repository **Settings**.
    * Navigate to **Pages** (on the left sidebar).
    * Under **Source**, select `Deploy from a branch`.
    * Select your `main` (or `master`) branch and click **Save**.
3.  **Done!** GitHub will provide you with a live URL (e.g., `https://yourusername.github.io/fishbowl-relay/`).

## 📂 Project Structure

* `index.html`: The main structure using semantic HTML.
* `style.css`: Custom CSS implementing Material 3 tokens (colors, elevation, typography).
* `script.js`: Logic for Base64 encoding/decoding, state management, and DOM manipulation.

## 🎨 Customization

You can change the color theme in `style.css` by modifying the root variables:

```css
:root {
    --md-sys-color-primary: #6750A4; /* Change your primary color here */
    /* ... other tokens */
}
```

