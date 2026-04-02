const MAX_ATTEMPTS = 4;
const COOKIE_NAME = "chargle_state";

let state = {
    date: getTodayString(),
    attempts: [],
    gameOver: false
};

function getTodayString() {
    return new Date().toISOString().split('T')[0];
}

function getTodayString() {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = now.getUTCMonth() + 1;
    const day = now.getUTCDate();
    return `${year}-${month}-${day}`;
}

function setCookie(name, value) {
    const date = new Date();
    date.setUTCHours(23, 59, 59, 999);
    document.cookie = `${name}=${JSON.stringify(value)}; expires=${date.toUTCString()}; path=/`;
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return JSON.parse(parts.pop().split(';').shift());
    return null;
}

function init() {
    const savedState = getCookie(COOKIE_NAME);
    const targetValue = getDailyValue();

    if (savedState && savedState.date === state.date) {
        state = savedState;
        state.attempts.forEach(guess => addHistoryRow(guess, targetValue));
    }

    document.getElementById('batteryFill').style.width = `${targetValue}%`;
    document.getElementById('attemptCount').innerText = `${state.attempts.length}/${MAX_ATTEMPTS}`;
    
    document.getElementById('guessBtn').addEventListener('click', handleGuess);
    document.getElementById('closeModal').addEventListener('click', () => {
        document.getElementById('modal').classList.add('hidden');
    });

    if (state.gameOver) {
        disableInput();
    }
}

function handleGuess() {
    if (state.gameOver || state.attempts.length >= MAX_ATTEMPTS) return;

    const input = document.getElementById('guessInput');
    const guess = parseInt(input.value);
    const targetValue = getDailyValue();

    if (isNaN(guess) || guess < 0 || guess > 100) return;

    state.attempts.push(guess);
    addHistoryRow(guess, targetValue);
    
    document.getElementById('attemptCount').innerText = `${state.attempts.length}/${MAX_ATTEMPTS}`;

    if (guess === targetValue) {
        state.gameOver = true;
        endGame("You won!");
    } else if (state.attempts.length >= MAX_ATTEMPTS) {
        state.gameOver = true;
        endGame(`You lost! The value was ${targetValue}%`);
    }

    setCookie(COOKIE_NAME, state);
    input.value = "";
}

function addHistoryRow(guess, targetValue) {
    const diff = Math.abs(targetValue - guess);
    let hint = "";
    let arrow = guess > targetValue ? "⬇️" : "⬆️";

    if (guess === targetValue) {
        hint = "🎉🎉🎉";
        arrow = "🎉";
    } else if (diff < 5) {
        hint = "Boiling!🔥";
    } else if (diff < 15) {
        hint = "Warm";
    } else if (diff < 30) {
        hint = "Cold!";
    } else {
        hint = "Freezing!";
    }

    const row = document.createElement('div');
    row.className = 'history-row';
    row.innerHTML = `<div>${guess}%</div><div>${arrow}</div><div>${hint}</div>`;
    document.getElementById('history').appendChild(row);
}

function disableInput() {
    document.getElementById('guessInput').disabled = true;
    document.getElementById('guessBtn').disabled = true;
}

function endGame(message) {
    disableInput();
    document.getElementById('modalText').innerText = message;
    document.getElementById('modal').classList.remove('hidden');
}

init();