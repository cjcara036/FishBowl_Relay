const viewSetup = document.getElementById('view-setup');
const viewBowl = document.getElementById('view-bowl');
const viewAdmin = document.getElementById('view-admin');

// Inputs
const inputName = document.getElementById('setup-item-name');
const inputCount = document.getElementById('setup-item-count');

/* STATE: { items: [], p: "hashed_password" } */
let currentState = { items: [], p: null };

// --- INITIALIZATION ---
window.addEventListener('load', () => {
    inputName.addEventListener("keypress", handleEnterKey);
    inputCount.addEventListener("keypress", handleEnterKey);
    
    // Admin Input Listener
    const adminInput = document.getElementById('admin-item-name');
    if(adminInput) {
        adminInput.addEventListener("keypress", (e) => {
            if(e.key==="Enter") { e.preventDefault(); adminAddItem(); }
        });
    }

    const hash = window.location.hash.substring(1); 
    
    if (hash) {
        loadStateFromHash(hash);
    } else {
        viewSetup.classList.add('active');
        inputName.focus();
    }
});

function loadStateFromHash(hash) {
    let parsedData = null;
    // 1. Try Compression
    try {
        const decompressed = LZString.decompressFromEncodedURIComponent(hash);
        if (decompressed) parsedData = JSON.parse(decompressed);
    } catch (e) { console.log("Decompress failed, trying legacy..."); }

    // 2. Try Legacy (Base64)
    if (!parsedData) {
        try {
            const cleanHash = decodeURIComponent(hash);
            parsedData = JSON.parse(atob(cleanHash));
        } catch (e) { console.error("Legacy failed"); }
    }

    if (parsedData) {
        currentState = parsedData;
        startBowlMode();
    } else {
        alert("Invalid link or corrupted data. Sending you to setup.");
        viewSetup.classList.add('active');
    }
}

function handleEnterKey(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        addItemToSetup();
    }
}

// --- SETUP ---
function addItemToSetup() {
    const name = inputName.value.trim();
    let count = parseInt(inputCount.value);
    if (isNaN(count) || count < 1) count = 1;

    if (name) {
        for(let i=0; i<count; i++) currentState.items.push({ n: name, d: null });
        const li = document.createElement('li');
        li.innerHTML = `<span>${name}</span> <span>x${count}</span>`;
        document.getElementById('setup-list').appendChild(li);
        inputName.value = ''; inputCount.value = 1; inputName.focus();
    }
}

async function generateInitialLink() {
    if(currentState.items.length === 0) return alert("Bowl is empty!");
    
    // Handle Password
    const pass = document.getElementById('setup-password').value.trim();
    const passConfirm = document.getElementById('setup-password-confirm').value.trim();
    
    if (pass !== passConfirm) {
        return alert("Passwords do not match!");
    }

    if (pass) {
        currentState.p = await sha256(pass);
    }

    shuffleArray(currentState.items);
    
    const url = generateCurrentLink();
    prompt("Copy this link and send it to the first player:", url);
}

// --- GAME LOGIC ---
function startBowlMode() {
    viewSetup.classList.remove('active');
    viewBowl.classList.add('active');
    
    // Show Admin Button if password exists
    if (currentState.p) {
        document.getElementById('btn-admin-login').classList.remove('hidden');
    }
    
    // Default to "Draw" mode logic
    showCard('draw-card');
    renderBulletinBoard();
}

/**
 * STRICT VISIBILITY HELPER
 * Ensures only ONE card is shown at a time to prevent overlap.
 */
function showCard(cardId) {
    const cards = ['draw-card', 'result-card', 'game-over-card'];
    cards.forEach(id => {
        const el = document.getElementById(id);
        if (id === cardId) {
            el.classList.remove('hidden');
        } else {
            el.classList.add('hidden');
        }
    });
}

function renderBulletinBoard() {
    const board = document.getElementById('bulletin-board');
    board.innerHTML = '';
    
    let remaining = 0;
    currentState.items.forEach(item => {
        if (item.d) {
            const div = document.createElement('div');
            div.className = 'bulletin-item';
            div.innerHTML = `<strong>${item.d}</strong> drew ${item.n}`;
            board.appendChild(div);
        } else {
            remaining++;
        }
    });
    
    document.getElementById('items-remaining-count').textContent = remaining;

    // AUTO-SWITCH Logic
    // If we are currently looking at the Result Card (e.g. just drew), DO NOT switch view.
    // Only switch if we are NOT in result mode.
    const resultCard = document.getElementById('result-card');
    if (resultCard.classList.contains('hidden')) {
        if(remaining === 0) {
            showCard('game-over-card');
            document.getElementById('final-link-input').value = generateCurrentLink();
        } else {
            showCard('draw-card');
        }
    }
}

function drawItem() {
    const nameInput = document.getElementById('player-name');
    const userName = nameInput.value.trim();
    if (!userName) return alert("Enter name.");

    const availableIndices = [];
    currentState.items.forEach((item, index) => {
        if(item.d === null) availableIndices.push(index);
    });

    if (availableIndices.length === 0) return alert("Empty.");

    const rand = Math.floor(Math.random() * availableIndices.length);
    const pickedIndex = availableIndices[rand];
    
    currentState.items[pickedIndex].d = userName;
    
    // 1. UPDATE UI TEXT
    document.getElementById('result-text').textContent = currentState.items[pickedIndex].n;

    // 2. FORCE SHOW RESULT CARD
    // This hides Draw and Game Over cards immediately
    showCard('result-card');
    
    // Clear QR
    const qrContainer = document.getElementById('qr-result-container');
    if(qrContainer) { qrContainer.innerHTML = ''; qrContainer.classList.add('hidden'); }

    const remaining = availableIndices.length - 1;
    const instructionEl = document.getElementById('result-instruction');
    if (remaining === 0) instructionEl.innerHTML = "<strong>BOWL EMPTY!</strong> Share Final Tally:";
    else instructionEl.innerHTML = "<strong>IMPORTANT:</strong> Share this NEW link:";
    
    document.getElementById('next-link-input').value = generateCurrentLink();
    
    // 3. Update Board Background
    renderBulletinBoard();
}

// --- ADMIN LOGIC ---
async function promptAdminLogin() {
    const input = prompt("Enter Admin Password to Edit Bowl:");
    if (!input) return;

    const hash = await sha256(input);
    if (hash === currentState.p) {
        openAdminView();
    } else {
        alert("Incorrect password.");
    }
}

function openAdminView() {
    viewBowl.classList.remove('active');
    viewAdmin.classList.add('active');
    
    // Reset view states
    document.getElementById('admin-edit-panel').classList.remove('hidden');
    document.getElementById('admin-share-card').classList.add('hidden');
    
    renderAdminList();
}

function renderAdminList() {
    const list = document.getElementById('admin-list');
    list.innerHTML = '';

    currentState.items.forEach((item, index) => {
        // Only show undrawn items to prevent history tampering
        if (item.d === null) {
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${item.n}</span>
                <button class="m3-btn-icon" onclick="adminRemoveItem(${index})">
                    <span class="material-symbols-outlined">delete</span>
                </button>
            `;
            list.appendChild(li);
        }
    });
}

function adminRemoveItem(index) {
    currentState.items.splice(index, 1);
    renderAdminList();
}

function adminAddItem() {
    const input = document.getElementById('admin-item-name');
    const name = input.value.trim();
    if(name) {
        currentState.items.push({ n: name, d: null });
        input.value = '';
        renderAdminList();
    }
}

function saveAdminChanges() {
    const newLink = generateCurrentLink();
    document.getElementById('admin-link-input').value = newLink;
    
    // Update URL Hash immediately
    window.location.hash = newLink.split('#')[1];

    // Toggle Panels: Hide Edit, Show Share
    document.getElementById('admin-edit-panel').classList.add('hidden');
    document.getElementById('admin-share-card').classList.remove('hidden');
    
    const qrContainer = document.getElementById('qr-admin-container');
    qrContainer.innerHTML = '';
    qrContainer.classList.add('hidden');
}

function cancelAdmin() {
    viewAdmin.classList.remove('active');
    viewBowl.classList.add('active');
}

function exitAdmin() {
    // Return to game
    viewAdmin.classList.remove('active');
    viewBowl.classList.add('active');
    
    // Reset cards to default state based on remaining items
    showCard('draw-card'); 
    
    // Let logic decide true state
    renderBulletinBoard();
}

// --- UTILITIES ---
function generateCurrentLink() {
    const jsonStr = JSON.stringify(currentState);
    const compressed = LZString.compressToEncodedURIComponent(jsonStr);
    return `${window.location.origin}${window.location.pathname}#${compressed}`;
}

function copyLink(elementId) {
    const input = document.getElementById(elementId);
    input.select(); navigator.clipboard.writeText(input.value).then(() => alert("Copied!"));
}

function nativeShare(elementId) {
    const url = document.getElementById(elementId).value;
    if (navigator.share) navigator.share({ title: 'Fishbowl', url: url });
    else copyLink(elementId);
}

function toggleQR(inputId, containerId) {
    const container = document.getElementById(containerId);
    const url = document.getElementById(inputId).value;
    if (container.classList.contains('hidden')) {
        container.innerHTML = '';
        new QRCode(container, { text: url, width: 180, height: 180 });
        container.classList.remove('hidden');
    } else {
        container.classList.add('hidden');
    }
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}