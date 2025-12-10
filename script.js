/* STATE STRUCTURE:
  {
    items: [
      { n: "Item Name", d: "User Name (or null)" },
      ...
    ]
  }
*/

const viewSetup = document.getElementById('view-setup');
const viewBowl = document.getElementById('view-bowl');

let currentState = { items: [] };

// --- INITIALIZATION ---
window.addEventListener('load', () => {
    const hash = window.location.hash.substring(1); // Remove '#'

    if (hash) {
        try {
            // Decode Base64 -> JSON string -> Object
            const jsonStr = atob(hash);
            currentState = JSON.parse(jsonStr);
            startBowlMode();
        } catch (e) {
            console.error("Invalid URL data", e);
            alert("This link seems broken. Sending you to setup.");
            viewSetup.classList.add('active');
        }
    } else {
        viewSetup.classList.add('active');
    }
});

// --- SETUP MODE ---
function addItemToSetup() {
    const nameInput = document.getElementById('setup-item-name');
    const countInput = document.getElementById('setup-item-count');
    const name = nameInput.value.trim();
    const count = parseInt(countInput.value);

    if (name && count > 0) {
        for(let i=0; i<count; i++) {
            // n = name, d = drawnBy (minimized keys for shorter URLs)
            currentState.items.push({ n: name, d: null });
        }
        
        // UI Update
        const li = document.createElement('li');
        li.innerHTML = `<span>${name}</span> <span>x${count}</span>`;
        document.getElementById('setup-list').appendChild(li);
        
        nameInput.value = '';
    }
}

function generateInitialLink() {
    if(currentState.items.length === 0) return alert("Bowl is empty!");
    
    // Shuffle items initially so they aren't in order of entry
    shuffleArray(currentState.items);
    
    updateUrlAndShowResult("Bowl created!", false);
}

// --- BOWL MODE ---
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
    
    // items have { n: name, d: drawnBy }
    currentState.items.forEach(item => {
        if (item.d) {
            const div = document.createElement('div');
            div.className = 'bulletin-item';
            div.innerHTML = `<strong>${item.d}</strong><br>drew ${item.n}`;
            board.appendChild(div);
        } else {
            remaining++;
        }
    });
    
    remainingCountEl.textContent = remaining;

    if(remaining === 0) {
        document.getElementById('draw-card').innerHTML = "<h3>The Bowl is Empty!</h3>";
    }
}

function drawItem() {
    const nameInput = document.getElementById('player-name');
    const userName = nameInput.value.trim();
    
    if (!userName) return alert("Please enter your name.");

    // Find undrawn items
    const availableIndices = [];
    currentState.items.forEach((item, index) => {
        if(item.d === null) availableIndices.push(index);
    });

    if (availableIndices.length === 0) return alert("Bowl is empty.");

    // Random Pick
    const rand = Math.floor(Math.random() * availableIndices.length);
    const pickedIndex = availableIndices[rand];
    
    // UPDATE STATE
    currentState.items[pickedIndex].d = userName;
    
    // Update UI
    renderBulletinBoard();
    
    // Hide Draw Card, Show Result Card
    document.getElementById('draw-card').classList.add('hidden');
    document.getElementById('result-card').classList.remove('hidden');
    document.getElementById('result-text').textContent = currentState.items[pickedIndex].n;
    
    // Generate NEW Link
    updateUrlAndShowResult();
}

// --- UTILS ---
function updateUrlAndShowResult(msg = null, isDraw = true) {
    // Encode State -> JSON -> Base64
    const jsonStr = JSON.stringify(currentState);
    const hash = btoa(jsonStr);
    
    const fullUrl = `${window.location.origin}${window.location.pathname}#${hash}`;
    
    if (isDraw) {
        // Just populate the input box
        document.getElementById('next-link-input').value = fullUrl;
    } else {
        // For initial setup, we might want to just prompt them
        prompt("Copy this link and send it to the first player:", fullUrl);
    }
}

function copyNextLink() {
    const input = document.getElementById('next-link-input');
    input.select();
    navigator.clipboard.writeText(input.value);
    alert("Link copied! Send this to the next person.");
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}