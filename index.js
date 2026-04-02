const MAX_ATTEMPTS = 4;
const COOKIE_NAME = "chargle_state";

let state = {
    date: getTodayString(),
    attempts: [],
    gameOver: false
};

function getTodayString() {
    const now = new Date();
    return `${now.getUTCFullYear()}-${now.getUTCMonth() + 1}-${now.getUTCDate()}`;
}

function getDailyValue() {
    const dateString = getTodayString();
    let hash = 0;
    for (let i = 0; i < dateString.length; i++) {
        hash = (hash << 5) - hash + dateString.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash) % 101;
}

function setCookie(name, value) {
    const nextDay = new Date();
    nextDay.setUTCHours(24, 0, 0, 0);
    document.cookie = `${name}=${JSON.stringify(value)}; expires=${nextDay.toUTCString()}; path=/`;
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return JSON.parse(parts.pop().split(';').shift());
    return null;
}

function updateTimer() {
    const now = new Date();
    const nextDay = new Date();
    nextDay.setUTCHours(24, 0, 0, 0);
    
    const diff = nextDay - now;
    const hours = Math.floor(diff / (1000 * 60 * 60)).toString().padStart(2, '0');
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
    const seconds = Math.floor((diff % (1000 * 60)) / 1000).toString().padStart(2, '0');
    
    document.getElementById('timer').innerText = `Next Chargle in: ${hours}:${minutes}:${seconds}`;
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

    if (state.gameOver) disableInput();
    
    setInterval(updateTimer, 1000);
    updateTimer();
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