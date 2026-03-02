let cards = [];
let nextCardId = 1;

document.getElementById("addCardBtn").addEventListener("click", addCard);

const drawInput = document.getElementById("drawInput");
const markBtn = document.getElementById("markBtn");

// Existing button click
markBtn.addEventListener("click", () => {
    const num = parseInt(drawInput.value);
    if (!isNaN(num)) markNumber(num);
    drawInput.value = "";
    drawInput.focus(); // keep focus after marking
});

// --- NEW: Enter key support ---
drawInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        const num = parseInt(drawInput.value);
        if (!isNaN(num)) markNumber(num);
        drawInput.value = "";
        drawInput.focus(); // keep focus after marking
    }
});

function addCard() {
    const grid = Array.from({ length: 5 }, () => Array(5).fill(null));
    
    // Set the middle cell (free space) as 0
    grid[2][2] = 0;

    const card = {
        id: nextCardId++,
        grid,
        wins: { horizontal: false, vertical: false, diagonalMain: false, diagonalAnti: false }
    };
    cards.push(card);
    renderCard(card);
}

function renderCard(card) {
    const container = document.getElementById("cardsContainer");
    const cardDiv = document.createElement("div");
    cardDiv.className = "card";
    cardDiv.dataset.id = card.id;

    // Delete button
    const delBtn = document.createElement("button");
    delBtn.innerText = "-";
    delBtn.className = "deleteBtn";
    delBtn.addEventListener("click", () => deleteCard(card.id));
    cardDiv.appendChild(delBtn);

    card.grid.forEach((row, r) => {
        row.forEach((cell, c) => {
            const input = document.createElement("input");
            input.type = "number";
            input.className = "cell";
            input.dataset.row = r;
            input.dataset.col = c;

            if (r === 2 && c === 2) { // middle cell pre-marked
                input.value = 0;
                input.classList.add("marked");
            }

            cardDiv.appendChild(input);
        });
    });

    container.appendChild(cardDiv);
}

function deleteCard(cardId) {
    cards = cards.filter(c => c.id !== cardId);
    const cardDiv = document.querySelector(`.card[data-id='${cardId}']`);
    if (cardDiv) cardDiv.remove();
    updateMessages();
}

function markNumber(drawnNumber) {
    const messages = [];

    cards.forEach(card => {
        const cardDiv = document.querySelector(`.card[data-id='${card.id}']`);
        const inputs = cardDiv.querySelectorAll(".cell");

        // Update internal grid and UI
        inputs.forEach(input => {
            const r = parseInt(input.dataset.row);
            const c = parseInt(input.dataset.col);
            const val = parseInt(input.value);

            if (r === 2 && c === 2) {
                card.grid[r][c] = 0; // middle cell always 0
                input.value = 0;
                input.classList.add("marked");
            } else if (val === drawnNumber) {
                card.grid[r][c] = 0;
                input.value = 0;
                input.classList.add("marked");
            } else {
                card.grid[r][c] = isNaN(val) ? null : val;
            }
        });

        // Check for wins
        const winMsgs = checkWins(card);
        winMsgs.forEach(msg => messages.push(`Card ${card.id}: ${msg}`));
    });

    document.getElementById("messages").innerHTML = messages.join("<br>") || "";
}

function checkWins(card) {
    const msgs = [];

    // Horizontal
    for (let r = 0; r < 5; r++) {
        if (!card.wins.horizontal && card.grid[r].every(cell => cell === 0)) {
            card.wins.horizontal = true;
            msgs.push("Horizontal win!");
        }
    }

    // Vertical
    for (let c = 0; c < 5; c++) {
        if (!card.wins.vertical) {
            let colWin = true;
            for (let r = 0; r < 5; r++) {
                if (card.grid[r][c] !== 0) colWin = false;
            }
            if (colWin) {
                card.wins.vertical = true;
                msgs.push("Vertical win!");
            }
        }
    }

    // Main diagonal
    if (!card.wins.diagonalMain) {
        let diagWin = true;
        for (let i = 0; i < 5; i++) {
            if (card.grid[i][i] !== 0) diagWin = false;
        }
        if (diagWin) {
            card.wins.diagonalMain = true;
            msgs.push("Main diagonal win!");
        }
    }

    // Anti-diagonal
    if (!card.wins.diagonalAnti) {
        let antiWin = true;
        for (let i = 0; i < 5; i++) {
            if (card.grid[i][4 - i] !== 0) antiWin = false;
        }
        if (antiWin) {
            card.wins.diagonalAnti = true;
            msgs.push("Anti-diagonal win!");
        }
    }

    return msgs;
}

/*
function updateMessages() {
    // Optional: clear messages when a card is deleted
    document.getElementById("messages").innerHTML = "";
}
*/
