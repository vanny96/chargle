const MAX_ATTEMPTS = 4;
let attempts = 0;
let targetValue = 0;
let gameOver = false;

function getDailyValue() {
    const now = new Date();
    const dateString = `${now.getUTCFullYear()}-${now.getUTCMonth()}-${now.getUTCDate()}`;
    let hash = 0;
    for (let i = 0; i < dateString.length; i++) {
        hash = (hash << 5) - hash + dateString.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash) % 101; 
}

function init() {
    targetValue = getDailyValue();
    document.getElementById('batteryFill').style.width = `${targetValue}%`;
    document.getElementById('guessBtn').addEventListener('click', handleGuess);
}

function handleGuess() {
    if (gameOver) return;

    const input = document.getElementById('guessInput');
    const guess = parseInt(input.value);

    if (isNaN(guess) || guess < 0 || guess > 100) return;

    attempts++;
    document.getElementById('attemptCount').innerText = `${attempts}/${MAX_ATTEMPTS}`;
    
    const diff = Math.abs(targetValue - guess);
    let hint = "";
    let arrow = guess > targetValue ? "⬇️" : "⬆️";

    if (guess === targetValue) {
        hint = "🎉🎉🎉";
        arrow = "🎉";
        endGame("You won!");
    } else if (diff < 5) {
        hint = "Boiling!🔥";
    } else if (diff < 15) {
        hint = "Warm";
    } else if (diff < 30) {
        hint = "Cold!";
    } else {
        hint = "Freezing!";
    }

    addHistoryRow(guess, arrow, hint);
    input.value = "";

    if (guess !== targetValue && attempts >= MAX_ATTEMPTS) {
        endGame(`You lost! The value was ${targetValue}%`);
    }
}

function addHistoryRow(guess, arrow, hint) {
    const row = document.createElement('div');
    row.className = 'history-row';
    row.innerHTML = `
        <div>${guess}%</div>
        <div>${arrow}</div>
        <div>${hint}</div>
    `;
    document.getElementById('history').appendChild(row);
}

function endGame(message) {
    gameOver = true;
    document.getElementById('modalText').innerText = message;
    document.getElementById('modal').classList.remove('hidden');
}

init();