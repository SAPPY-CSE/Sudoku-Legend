// Sample puzzles with different digits
const samplePuzzles = [
    
   
   [
    [5, 3, '', '', 7, '', '', '', ''],
    [6, '', '', 1, 9, 5, '', '', ''],
    ['', 9, 8, '', '', '', '', 6, ''],
    [8, '', '', '', 6, '', '', '', 3],
    [4, '', '', 8, '', 3, '', '', 1],
    [7, '', '', '', 2, '', '', '', 6],
    ['', 6, '', '', '', '', 2, 8, ''],
    ['', '', '', 4, 1, 9, '', '', 5],
    ['', '', '', '', 8, '', '', 7, 9]
]


];

let currentPuzzle;
let puzzlesSolved = 0;
let totalTime = 0;
let fastestTime = null;
let timerInterval;
let secondsElapsed = 0;

// Initialize Game
function initGame() {
    loadStats();
    pickRandomPuzzle();
    startTimer();
    document.getElementById('message').textContent = '';
}

// Pick random puzzle and render it
function pickRandomPuzzle() {
    currentPuzzle = samplePuzzles[Math.floor(Math.random() * samplePuzzles.length)];
    renderBoard(currentPuzzle);
}

// Render Sudoku Board
function renderBoard(puzzle) {
    const table = document.getElementById('sudoku-grid').querySelector('tbody');
    table.innerHTML = '';

    for (let row = 0; row < 9; row++) {
        const tr = document.createElement('tr');
        for (let col = 0; col < 9; col++) {
            const td = document.createElement('td');
            const input = document.createElement('input');
            input.type = 'text';
            input.maxLength = 1;
            input.classList.add('cell');

            if (puzzle[row][col] !== '') {
                input.value = puzzle[row][col];
                input.classList.add('prefilled');
                input.setAttribute('readonly', true);
            }

            input.addEventListener('input', () => validateLive());

            td.appendChild(input);
            tr.appendChild(td);
        }
        table.appendChild(tr);
    }
}

// Reset Board (modal confirm)
function resetBoard() {
    if (confirm('Are you sure you want to reset the board?')) {
        const inputs = document.querySelectorAll('#sudoku-grid input:not(.prefilled)');
        inputs.forEach(input => {
            input.value = '';
            input.classList.remove('invalid');
        });
        document.getElementById('message').textContent = '';
    }
}

// New Game (pick another puzzle)
function newGame() {
    if (confirm('Are you sure you want to start a new game?')) {
        pickRandomPuzzle();
        resetTimer();
        startTimer();
        document.getElementById('message').textContent = '';
    }
}

// Check if the current board is a valid solution
function checkSolution() {
    const grid = [];
    const inputs = document.querySelectorAll('#sudoku-grid input');
    for (let i = 0; i < 81; i += 9) {
        const row = [];
        for (let j = 0; j < 9; j++) {
            const value = inputs[i + j].value;
            row.push(value === '' ? '' : parseInt(value));
        }
        grid.push(row);
    }

    if (isValidSudoku(grid)) {
        document.getElementById('message').textContent = '🎉 Congratulations! Puzzle solved!';
        document.getElementById('message').className = 'success';
        updateStats();
        resetTimer();
    } else {
        document.getElementById('message').textContent = '❌ Incorrect solution. Please check again.';
        document.getElementById('message').className = 'error';
    }
}

// Live validation — highlight invalid entries
function validateLive() {
    const grid = [];
    const inputs = document.querySelectorAll('#sudoku-grid input');
    for (let i = 0; i < 81; i += 9) {
        const row = [];
        for (let j = 0; j < 9; j++) {
            const value = inputs[i + j].value;
            row.push(value === '' ? '' : parseInt(value));
        }
        grid.push(row);
    }

    // Clear previous highlights
    inputs.forEach(input => input.classList.remove('invalid'));

    // Highlight invalid cells
    for (let i = 0; i < 81; i++) {
        const row = Math.floor(i / 9);
        const col = i % 9;
        const val = grid[row][col];

        if (val !== '') {
            if (
                !isValidInRow(grid, row, col, val) ||
                !isValidInCol(grid, row, col, val) ||
                !isValidInBox(grid, row, col, val)
            ) {
                inputs[i].classList.add('invalid');
            }
        }
    }
}

// Sudoku validation helpers
function isValidSudoku(grid) {
    return validateRows(grid) && validateCols(grid) && validateBoxes(grid);
}

function validateRows(grid) {
    for (let row = 0; row < 9; row++) {
        const seen = new Set();
        for (let col = 0; col < 9; col++) {
            const val = grid[row][col];
            if (val !== '') {
                if (seen.has(val)) return false;
                seen.add(val);
            }
        }
    }
    return true;
}

function validateCols(grid) {
    for (let col = 0; col < 9; col++) {
        const seen = new Set();
        for (let row = 0; row < 9; row++) {
            const val = grid[row][col];
            if (val !== '') {
                if (seen.has(val)) return false;
                seen.add(val);
            }
        }
    }
    return true;
}

function validateBoxes(grid) {
    for (let boxRow = 0; boxRow < 3; boxRow++) {
        for (let boxCol = 0; boxCol < 3; boxCol++) {
            const seen = new Set();
            for (let row = 0; row < 3; row++) {
                for (let col = 0; col < 3; col++) {
                    const val = grid[boxRow * 3 + row][boxCol * 3 + col];
                    if (val !== '') {
                        if (seen.has(val)) return false;
                        seen.add(val);
                    }
                }
            }
        }
    }
    return true;
}

function isValidInRow(grid, row, colIgnore, value) {
    for (let col = 0; col < 9; col++) {
        if (col !== colIgnore && grid[row][col] === value) {
            return false;
        }
    }
    return true;
}

function isValidInCol(grid, rowIgnore, col, value) {
    for (let row = 0; row < 9; row++) {
        if (row !== rowIgnore && grid[row][col] === value) {
            return false;
        }
    }
    return true;
}

function isValidInBox(grid, row, col, value) {
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
            const currentRow = boxRow + r;
            const currentCol = boxCol + c;
            if ((currentRow !== row || currentCol !== col) && grid[currentRow][currentCol] === value) {
                return false;
            }
        }
    }
    return true;
}

// Stats functions
function loadStats() {
    const storedSolved = localStorage.getItem('puzzlesSolved');
    const storedFastest = localStorage.getItem('fastestTime');
    const storedTotal = localStorage.getItem('totalTime');

    if (storedSolved !== null) {
        puzzlesSolved = parseInt(storedSolved);
    }
    if (storedFastest !== null && storedFastest !== "null") {
        fastestTime = parseInt(storedFastest);
    } else {
        fastestTime = null;
    }
    if (storedTotal !== null) {
        totalTime = parseInt(storedTotal);
    }

    updateStatsDisplay();
}

function updateStats() {
    puzzlesSolved += 1;
    totalTime += secondsElapsed;
    if (fastestTime === null || secondsElapsed < fastestTime) {
        fastestTime = secondsElapsed;
    }

    localStorage.setItem('puzzlesSolved', puzzlesSolved);
    localStorage.setItem('totalTime', totalTime);

    if (fastestTime === null) {
        localStorage.removeItem('fastestTime');
    } else {
        localStorage.setItem('fastestTime', fastestTime);
    }

    updateStatsDisplay();
}

function updateStatsDisplay() {
    document.getElementById('puzzles-solved').textContent = puzzlesSolved;
    document.getElementById('fastest-time').textContent = fastestTime !== null ? fastestTime + 's' : '--';
    document.getElementById('total-time').textContent = totalTime + 's';
}

function resetStats() {
    if (confirm('Are you sure you want to reset your stats?')) {
        puzzlesSolved = 0;
        fastestTime = null;
        totalTime = 0;

        localStorage.setItem('puzzlesSolved', puzzlesSolved);
        localStorage.setItem('totalTime', totalTime);
        localStorage.removeItem('fastestTime');

        updateStatsDisplay();
    }
}

// Timer functions
function startTimer() {
    secondsElapsed = 0;
    timerInterval = setInterval(() => {
        secondsElapsed++;
    }, 1000);
}

function resetTimer() {
    clearInterval(timerInterval);
}

// Event Listeners
document.getElementById('reset-btn').addEventListener('click', resetBoard);
document.getElementById('new-game-btn').addEventListener('click', newGame);
document.getElementById('check-solution-btn').addEventListener('click', checkSolution);
document.getElementById('reset-stats-btn').addEventListener('click', resetStats);

// Start the game on page load
window.onload = initGame;
