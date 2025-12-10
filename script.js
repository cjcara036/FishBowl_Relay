const viewSetup = document.getElementById('view-setup');
const viewBowl = document.getElementById('view-bowl');
const inputName = document.getElementById('setup-item-name');
const inputCount = document.getElementById('setup-item-count');

let currentState = { items: [] };

// --- INITIALIZATION ---
window.addEventListener('load', () => {
    inputName.addEventListener("keypress", handleEnterKey);
    inputCount.addEventListener("keypress", handleEnterKey);

    const hash = window.location.hash.substring(1); 
    if (hash) {
        try {
            const jsonStr = LZString.decompressFromEncodedURIComponent(hash);
            if (!jsonStr) throw new Error("Decompression failed");
            currentState = JSON.parse(jsonStr);
            startBowlMode();
        } catch (e) {
            console.error(e);
            alert("Invalid link. Sending you to setup.");
            viewSetup.classList.add('active');
        }
    } else {
        viewSetup.classList.add('active');
        inputName.focus();
    }
});

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
        
        inputName.value = '';
        inputCount.value = 1; 
        inputName.focus();
    }
}

function generateInitialLink() {
    if(currentState.items.length === 0) return alert("Bowl is empty!");
    shuffleArray(currentState.items);
    
    const url = generateCurrentLink();
    prompt("Copy this link and send it to the first player:", url);
}

// --- GAME LOGIC ---
function startBowlMode() {
    viewSetup.classList.remove('active');
    viewBowl.classList.add('active');
    renderBulletinBoard();
}

function renderBulletinBoard() {
    const board = document.getElementById('bulletin-board');
    const remainingCountEl = document.getElementById('items-remaining-count');
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
    
    remainingCountEl.textContent = remaining;

    // UI VISIBILITY LOGIC
    const drawCard = document.getElementById('draw-card');
    const gameOverCard = document.getElementById('game-over-card');
    const resultCard = document.getElementById('result-card');

    // Only make decisions about Game Over/Draw cards if the Result card is NOT active.
    // This prevents the Game Over card from flashing underneath the result card on the last draw.
    if (resultCard.classList.contains('hidden')) {
        if(remaining === 0) {
            drawCard.classList.add('hidden');
            gameOverCard.classList.remove('hidden');
            
            // Generate final link for the Game Over card
            document.getElementById('final-link-input').value = generateCurrentLink();
        } else {
            drawCard.classList.remove('hidden');
            gameOverCard.classList.add('hidden');
        }
    }
}

function drawItem() {
    const nameInput = document.getElementById('player-name');
    const userName = nameInput.value.trim();
    if (!userName) return alert("Please enter your name.");

    const availableIndices = [];
    currentState.items.forEach((item, index) => {
        if(item.d === null) availableIndices.push(index);
    });

    if (availableIndices.length === 0) return alert("Bowl is empty.");

    const rand = Math.floor(Math.random() * availableIndices.length);
    const pickedIndex = availableIndices[rand];
    
    // 1. UPDATE STATE
    currentState.items[pickedIndex].d = userName;
    
    // 2. SHOW RESULT CARD *BEFORE* RENDERING BOARD
    // This ensures renderBulletinBoard sees the result card is active and doesn't trigger "Game Over"
    const resultCard = document.getElementById('result-card');
    const drawCard = document.getElementById('draw-card');
    
    drawCard.classList.add('hidden');
    resultCard.classList.remove('hidden');
    document.getElementById('result-text').textContent = currentState.items[pickedIndex].n;

    // 3. CHECK FOR FINAL DRAW
    // If this was the last item, update text to "Final Tally" instead of "Next Person"
    const remainingAfterDraw = availableIndices.length - 1;
    const instructionEl = document.getElementById('result-instruction');
    
    if (remainingAfterDraw === 0) {
        instructionEl.innerHTML = "<strong>BOWL EMPTY!</strong> Share this Final Tally link:";
    } else {
        instructionEl.innerHTML = "<strong>IMPORTANT:</strong> Copy this NEW link for the next person:";
    }
    
    // 4. GENERATE LINK
    document.getElementById('next-link-input').value = generateCurrentLink();

    // 5. UPDATE BACKGROUND BOARD
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
    input.select();
    input.setSelectionRange(0, 99999);
    navigator.clipboard.writeText(input.value).then(() => {
        alert("Link copied!");
    });
}

function nativeShare(elementId) {
    const url = document.getElementById(elementId).value;
    if (navigator.share) {
        navigator.share({
            title: 'Fishbowl Relay',
            text: 'Here is the Fishbowl link!',
            url: url
        }).catch((error) => console.log('Sharing failed', error));
    } else {
        copyLink(elementId);
    }
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}
