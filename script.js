let cards = [];
let nextCardId = 1;

document.getElementById("addCardBtn").addEventListener("click", () => addCard());
document.getElementById("markBtn").addEventListener("click", () => {
    const num = parseInt(document.getElementById("drawInput").value);
    if (!isNaN(num)) markNumber(num);
    document.getElementById("drawInput").value = "";
});

// Load saved cards from localStorage
window.onload = () => {
    const saved = localStorage.getItem("bingoCards");
    if (saved) {
        const savedCards = JSON.parse(saved);
        savedCards.forEach(savedCard => {
            const card = {
                id: savedCard.id,
                grid: savedCard.grid,
                wins: savedCard.wins
            };
            if (card.id >= nextCardId) nextCardId = card.id + 1;
            cards.push(card);
            renderCard(card);
            updateCardUI(card);
        });
    }
};

function saveCards() {
    localStorage.setItem("bingoCards", JSON.stringify(cards));
}

function addCard() {
    const grid = Array.from({ length: 5 }, () => Array(5).fill(null));
    grid[2][2] = 0; // free space

    const card = {
        id: nextCardId++,
        grid,
        wins: { horizontal: false, vertical: false, diagonalMain: false, diagonalAnti: false }
    };
    cards.push(card);
    renderCard(card);
    saveCards();
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

    // Clear marks button
    const clearBtn = document.createElement("button");
    clearBtn.innerText = "C";
    clearBtn.className = "clearBtn";
    clearBtn.addEventListener("click", () => clearMarks(card.id));
    cardDiv.appendChild(clearBtn);

    card.grid.forEach((row, r) => {
        row.forEach((cell, c) => {
            const input = document.createElement("input");
            input.type = "number";
            input.className = "cell";
            input.dataset.row = r;
            input.dataset.col = c;

            if (r === 2 && c === 2) {
                input.value = "X";
                input.classList.add("marked");
            } else if (cell === 0) {
                input.value = "X";
                input.classList.add("marked");
            } else if (cell !== null) {
                input.value = cell;
            }

            cardDiv.appendChild(input);
        });
    });

    container.appendChild(cardDiv);
    updateCardUI(card);
}

function deleteCard(cardId) {
    cards = cards.filter(c => c.id !== cardId);
    const cardDiv = document.querySelector(`.card[data-id='${cardId}']`);
    if (cardDiv) cardDiv.remove();
    saveCards();
    updateMessages();
}

function clearMarks(cardId) {
    const card = cards.find(c => c.id === cardId);
    if (!card) return;

    card.wins = { horizontal: false, vertical: false, diagonalMain: false, diagonalAnti: false };
    for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
            if (!(r === 2 && c === 2)) {
                card.grid[r][c] = card.grid[r][c] !== null ? card.grid[r][c] : null;
            } else {
                card.grid[r][c] = 0; // middle free space
            }
        }
    }

    updateCardUI(card);
    saveCards();
    updateMessages();
}

function markNumber(drawnNumber) {
    const messages = [];

    cards.forEach(card => {
        const cardDiv = document.querySelector(`.card[data-id='${card.id}']`);
        const inputs = cardDiv.querySelectorAll(".cell");

        inputs.forEach(input => {
            const r = parseInt(input.dataset.row);
            const c = parseInt(input.dataset.col);
            const val = parseInt(input.value);

            if (r === 2 && c === 2) {
                card.grid[r][c] = 0; // free space always marked
                input.value = "X";
                input.classList.add("marked");
            } else if (val === drawnNumber) {
                card.grid[r][c] = 0;
                input.value = "X";
                input.classList.add("marked");
            } else if (!isNaN(val)) {
                card.grid[r][c] = val;
            } else {
                card.grid[r][c] = null;
            }
            input.classList.remove("highlight"); // clear previous highlights
        });

        // Check for wins
        const winMsgs = checkWins(card);
        winMsgs.forEach(msg => messages.push(`Card ${card.id}: ${msg}`));

        // Highlight winning lines
        highlightWins(card);
    });

    document.getElementById("messages").innerHTML = messages.join("<br>") || "";
    saveCards();
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

function highlightWins(card) {
    const cardDiv = document.querySelector(`.card[data-id='${card.id}']`);
    const inputs = cardDiv.querySelectorAll(".cell");

    // Clear previous highlights
    inputs.forEach(input => input.classList.remove("highlight"));

    // Horizontal
    for (let r = 0; r < 5; r++) {
        if (card.grid[r].every(cell => cell === 0)) {
            for (let c = 0; c < 5; c++) {
                inputs[r * 5 + c].classList.add("highlight");
            }
        }
    }

    // Vertical
    for (let c = 0; c < 5; c++) {
        let colWin = true;
        for (let r = 0; r < 5; r++) if (card.grid[r][c] !== 0) colWin = false;
        if (colWin) {
            for (let r = 0; r < 5; r++) inputs[r * 5 + c].classList.add("highlight");
        }
    }

    // Main diagonal
    let diagWin = true;
    for (let i = 0; i < 5; i++) if (card.grid[i][i] !== 0) diagWin = false;
    if (diagWin) for (let i = 0; i < 5; i++) inputs[i * 5 + i].classList.add("highlight");

    // Anti-diagonal
    let antiWin = true;
    for (let i = 0; i < 5; i++) if (card.grid[i][4 - i] !== 0) antiWin = false;
    if (antiWin) for (let i = 0; i < 5; i++) inputs[i * 5 + (4 - i)].classList.add("highlight");
}

function updateCardUI(card) {
    const cardDiv = document.querySelector(`.card[data-id='${card.id}']`);
    if (!cardDiv) return;
    const inputs = cardDiv.querySelectorAll(".cell");
    for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
            const input = inputs[r * 5 + c];
            if (card.grid[r][c] === 0) {
                input.value = "X";
                input.classList.add("marked");
            } else if (card.grid[r][c] !== null) {
                input.value = card.grid[r][c];
                input.classList.remove("marked");
            } else {
                input.value = "";
                input.classList.remove("marked");
            }
            input.classList.remove("highlight");
        }
    }
}

function updateMessages() {
    document.getElementById("messages").innerHTML = "";
}
