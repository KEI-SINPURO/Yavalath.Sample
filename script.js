// ゲーム状態
let currentPlayer = 'white';
let gameOver = false;
let board = {};

// ボードの構造（六角形グリッド）
const boardStructure = [
    [null, null, null, null, 0, 1, 2, 3, 4],
    [null, null, null, 5, 6, 7, 8, 9, 10],
    [null, null, 11, 12, 13, 14, 15, 16, 17],
    [null, 18, 19, 20, 21, 22, 23, 24, 25],
    [26, 27, 28, 29, 30, 31, 32, 33, 34],
    [35, 36, 37, 38, 39, 40, 41, 42, null],
    [43, 44, 45, 46, 47, 48, 49, null, null],
    [50, 51, 52, 53, 54, 55, null, null, null],
    [56, 57, 58, 59, 60, null, null, null, null]
];

// 座標からセルIDへのマッピング
const coordToId = {};
for (let row = 0; row < boardStructure.length; row++) {
    for (let col = 0; col < boardStructure[row].length; col++) {
        const id = boardStructure[row][col];
        if (id !== null) {
            coordToId[`${row},${col}`] = id;
        }
    }
}

// IDから座標へのマッピング
const idToCoord = {};
for (let key in coordToId) {
    idToCoord[coordToId[key]] = key;
}

// ボードを初期化
function initBoard() {
    const boardElement = document.getElementById('board');
    boardElement.innerHTML = '';
    board = {};
    
    boardStructure.forEach((row, rowIndex) => {
        const rowElement = document.createElement('div');
        rowElement.className = 'hex-row';
        
        row.forEach((cellId, colIndex) => {
            if (cellId !== null) {
                const hexElement = document.createElement('div');
                hexElement.className = 'hex';
                hexElement.dataset.id = cellId;
                
                const hexInner = document.createElement('div');
                hexInner.className = 'hex-inner';
                
                hexElement.appendChild(hexInner);
                hexElement.addEventListener('click', () => placeStone(cellId));
                
                rowElement.appendChild(hexElement);
                board[cellId] = null;
            } else {
                const spacer = document.createElement('div');
                spacer.className = 'hex';
                spacer.style.visibility = 'hidden';
                rowElement.appendChild(spacer);
            }
        });
        
        boardElement.appendChild(rowElement);
    });
}

// 石を置く
function placeStone(cellId) {
    if (gameOver || board[cellId] !== null) return;
    
    board[cellId] = currentPlayer;
    
    const hexElement = document.querySelector(`[data-id="${cellId}"]`);
    hexElement.classList.add('placed');
    
    const stone = document.createElement('div');
    stone.className = `stone ${currentPlayer}`;
    hexElement.appendChild(stone);
    
    // 勝敗判定
    if (checkLose(cellId, currentPlayer)) {
        endGame(`${currentPlayer === 'white' ? '白' : '黒'}が3つ並んだため、${currentPlayer === 'white' ? '黒' : '白'}の勝利！`);
        return;
    }
    
    if (checkWin(cellId, currentPlayer)) {
        endGame(`${currentPlayer === 'white' ? '白' : '黒'}が4つ並んで勝利！`);
        return;
    }
    
    // プレイヤー交代
    currentPlayer = currentPlayer === 'white' ? 'black' : 'white';
    updatePlayerIndicator();
}

// 6方向のベクトル（六角形グリッド用）
const directions = [
    [-1, 0],  // 上
    [1, 0],   // 下
    [0, -1],  // 左上
    [0, 1],   // 右下
    [-1, 1],  // 右上
    [1, -1]   // 左下
];

// 指定方向の連続数をカウント
function countInDirection(cellId, player, rowDir, colDir) {
    const [row, col] = idToCoord[cellId].split(',').map(Number);
    let count = 0;
    let r = row + rowDir;
    let c = col + colDir;
    
    while (true) {
        const nextId = coordToId[`${r},${c}`];
        if (nextId === undefined || board[nextId] !== player) break;
        count++;
        r += rowDir;
        c += colDir;
    }
    
    return count;
}

// 勝利判定（4つ並び）
function checkWin(cellId, player) {
    for (const [rowDir, colDir] of directions) {
        const forward = countInDirection(cellId, player, rowDir, colDir);
        const backward = countInDirection(cellId, player, -rowDir, -colDir);
        const total = forward + backward + 1;
        
        if (total >= 4) return true;
    }
    return false;
}

// 敗北判定（3つ並び）
function checkLose(cellId, player) {
    for (const [rowDir, colDir] of directions) {
        const forward = countInDirection(cellId, player, rowDir, colDir);
        const backward = countInDirection(cellId, player, -rowDir, -colDir);
        const total = forward + backward + 1;
        
        if (total === 3) return true;
    }
    return false;
}

// ゲーム終了
function endGame(message) {
    gameOver = true;
    document.getElementById('game-status').textContent = message;
}

// プレイヤー表示を更新
function updatePlayerIndicator() {
    const indicator = document.getElementById('player-indicator');
    indicator.textContent = currentPlayer === 'white' ? '白' : '黒';
}

// ゲームをリセット
function resetGame() {
    currentPlayer = 'white';
    gameOver = false;
    document.getElementById('game-status').textContent = '';
    updatePlayerIndicator();
    initBoard();
}

// 初期化
document.addEventListener('DOMContentLoaded', () => {
    initBoard();
    updatePlayerIndicator();
    document.getElementById('reset-btn').addEventListener('click', resetGame);
});
