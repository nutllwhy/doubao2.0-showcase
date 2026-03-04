// 2048 AI对战版 - 游戏逻辑
const GRID_SIZE = 4;
const CELL_SIZE = 100;
const CELL_GAP = 10;

// 音效系统
let audioContext2048 = null;

function initAudio2048() {
    if (!audioContext2048) {
        audioContext2048 = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function playSound2048(type) {
    initAudio2048();
    if (!audioContext2048) return;
    
    const oscillator = audioContext2048.createOscillator();
    const gainNode = audioContext2048.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext2048.destination);
    
    const now = audioContext2048.currentTime;
    
    switch(type) {
        case 'move':
            oscillator.frequency.setValueAtTime(330, now);
            oscillator.frequency.exponentialRampToValueAtTime(440, now + 0.1);
            gainNode.gain.setValueAtTime(0.1, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
            oscillator.start(now);
            oscillator.stop(now + 0.15);
            break;
        case 'merge':
            oscillator.frequency.setValueAtTime(440, now);
            oscillator.frequency.exponentialRampToValueAtTime(660, now + 0.1);
            oscillator.frequency.exponentialRampToValueAtTime(880, now + 0.2);
            gainNode.gain.setValueAtTime(0.2, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
            oscillator.start(now);
            oscillator.stop(now + 0.25);
            break;
        case 'gameover':
            oscillator.frequency.setValueAtTime(440, now);
            oscillator.frequency.exponentialRampToValueAtTime(220, now + 0.3);
            oscillator.frequency.exponentialRampToValueAtTime(110, now + 0.6);
            gainNode.gain.setValueAtTime(0.3, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.7);
            oscillator.start(now);
            oscillator.stop(now + 0.7);
            break;
        case 'win':
            oscillator.frequency.setValueAtTime(523, now);
            oscillator.frequency.setValueAtTime(659, now + 0.1);
            oscillator.frequency.setValueAtTime(784, now + 0.2);
            oscillator.frequency.setValueAtTime(1047, now + 0.3);
            gainNode.gain.setValueAtTime(0.3, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
            oscillator.start(now);
            oscillator.stop(now + 0.5);
            break;
    }
}

// 游戏模式
let gameMode = 'solo';
let playerGame = null;
let aiGame = null;
let demoInterval = null;
let aiVsInterval = null;
let isDemoPaused = false;

// 方块颜色类
const tileClasses = {
    2: 'tile-2',
    4: 'tile-4',
    8: 'tile-8',
    16: 'tile-16',
    32: 'tile-32',
    64: 'tile-64',
    128: 'tile-128',
    256: 'tile-256',
    512: 'tile-512',
    1024: 'tile-1024',
    2048: 'tile-2048'
};

// 游戏类
class Game2048 {
    constructor(gridElement, scoreElement, movesElement, maxElement) {
        this.grid = [];
        this.gridElement = gridElement;
        this.scoreElement = scoreElement;
        this.movesElement = movesElement;
        this.maxElement = maxElement;
        this.score = 0;
        this.moves = 0;
        this.maxTile = 0;
        this.gameOver = false;
        this.won = false;
        this.init();
    }

    init() {
        this.grid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0));
        this.score = 0;
        this.moves = 0;
        this.maxTile = 0;
        this.gameOver = false;
        this.won = false;
        this.addRandomTile();
        this.addRandomTile();
        if (this.gridElement) this.render();
        if (this.scoreElement) this.updateStats();
    }

    addRandomTile() {
        const emptyCells = [];
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                if (this.grid[r][c] === 0) {
                    emptyCells.push({ r, c });
                }
            }
        }
        if (emptyCells.length === 0) return false;
        const { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        this.grid[r][c] = Math.random() < 0.9 ? 2 : 4;
        return { r, c };
    }

    move(direction, skipRender = false, skipSound = false) {
        if (this.gameOver) return false;

        const oldGrid = JSON.stringify(this.grid);
        let scoreGain = 0;

        const directions = {
            'up': { dr: -1, dc: 0 },
            'down': { dr: 1, dc: 0 },
            'left': { dr: 0, dc: -1 },
            'right': { dr: 0, dc: 1 }
        };

        const { dr, dc } = directions[direction];
        const merged = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(false));

        const traversal = this.getTraversal(dr, dc);

        for (const { r, c } of traversal) {
            if (this.grid[r][c] === 0) continue;

            let newR = r;
            let newC = c;

            while (this.isValid(newR + dr, newC + dc) && this.grid[newR + dr][newC + dc] === 0) {
                newR += dr;
                newC += dc;
            }

            if (this.isValid(newR + dr, newC + dc) && 
                this.grid[newR + dr][newC + dc] === this.grid[r][c] && 
                !merged[newR + dr][newC + dc]) {
                newR += dr;
                newC += dc;
                merged[newR][newC] = true;
                this.grid[newR][newC] *= 2;
                scoreGain += this.grid[newR][newC];
                this.maxTile = Math.max(this.maxTile, this.grid[newR][newC]);
                if (this.grid[newR][newC] === 2048) {
                    this.won = true;
                    if (!skipSound) playSound2048('win');
                }
                if (!skipSound) playSound2048('merge');
            } else if (newR !== r || newC !== c) {
                this.grid[newR][newC] = this.grid[r][c];
            }

            if (newR !== r || newC !== c) {
                this.grid[r][c] = 0;
            }
        }

        if (JSON.stringify(this.grid) !== oldGrid) {
            this.score += scoreGain;
            this.moves++;
            this.addRandomTile();
            if (!skipRender) {
                this.render();
                this.updateStats();
            }
            this.checkGameOver();
            if (scoreGain === 0 && !skipRender && !skipSound) playSound2048('move');
            return true;
        }
        return false;
    }

    getTraversal(dr, dc) {
        const traversal = [];
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                traversal.push({ r, c });
            }
        }
        if (dr === 1) traversal.reverse();
        if (dc === 1) {
            traversal.sort((a, b) => b.c - a.c);
        }
        return traversal;
    }

    isValid(r, c) {
        return r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE;
    }

    checkGameOver() {
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                if (this.grid[r][c] === 0) return;
                const val = this.grid[r][c];
                if (this.isValid(r + 1, c) && this.grid[r + 1][c] === val) return;
                if (this.isValid(r, c + 1) && this.grid[r][c + 1] === val) return;
            }
        }
        this.gameOver = true;
    }

    render() {
        if (!this.gridElement) return;
        
        this.gridElement.innerHTML = '';
        
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                this.gridElement.appendChild(cell);
            }
        }

        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                if (this.grid[r][c] !== 0) {
                    const tile = document.createElement('div');
                    const value = this.grid[r][c];
                    tile.className = `tile ${value > 2048 ? 'tile-super' : tileClasses[value]}`;
                    tile.textContent = value;
                    tile.style.left = (c * (CELL_SIZE + CELL_GAP)) + 'px';
                    tile.style.top = (r * (CELL_SIZE + CELL_GAP)) + 'px';
                    this.gridElement.appendChild(tile);
                }
            }
        }
    }

    updateStats() {
        if (this.scoreElement) this.scoreElement.textContent = this.score;
        if (this.movesElement) this.movesElement.textContent = this.moves;
        if (this.maxElement) this.maxElement.textContent = this.maxTile;
    }

    clone() {
        const game = new Game2048(null, null, null, null);
        game.grid = JSON.parse(JSON.stringify(this.grid));
        game.score = this.score;
        game.moves = this.moves;
        game.maxTile = this.maxTile;
        game.gameOver = this.gameOver;
        game.won = this.won;
        return game;
    }

    getMoves() {
        const moves = [];
        for (const dir of ['up', 'down', 'left', 'right']) {
            const clone = this.clone();
            if (clone.move(dir, true)) {
                moves.push({ direction: dir, game: clone });
            }
        }
        return moves;
    }

    evaluate() {
        let score = 0;
        
        const weightMatrix = [
            [4, 3, 2, 1],
            [8, 7, 6, 5],
            [12, 11, 10, 9],
            [16, 15, 14, 13]
        ];

        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                score += this.grid[r][c] * weightMatrix[r][c];
            }
        }

        let emptyCells = 0;
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                if (this.grid[r][c] === 0) emptyCells++;
            }
        }
        score += emptyCells * 100;

        let smoothness = 0;
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE - 1; c++) {
                if (this.grid[r][c] !== 0 && this.grid[r][c + 1] !== 0) {
                    smoothness -= Math.abs(Math.log2(this.grid[r][c]) - Math.log2(this.grid[r][c + 1]));
                }
            }
        }
        for (let c = 0; c < GRID_SIZE; c++) {
            for (let r = 0; r < GRID_SIZE - 1; r++) {
                if (this.grid[r][c] !== 0 && this.grid[r + 1][c] !== 0) {
                    smoothness -= Math.abs(Math.log2(this.grid[r][c]) - Math.log2(this.grid[r + 1][c]));
                }
            }
        }
        score += smoothness * 10;

        return score;
    }
}

function getBestMove(game) {
    const moves = game.getMoves();
    if (moves.length === 0) return null;

    let bestMove = null;
    let bestScore = -Infinity;

    for (const { direction, game: newGame } of moves) {
        const score = newGame.evaluate();
        if (score > bestScore) {
            bestScore = score;
            bestMove = direction;
        }
    }
    return bestMove;
}

function init() {
    playerGame = new Game2048(
        document.getElementById('playerGrid'),
        document.getElementById('playerScore'),
        document.getElementById('playerMoves'),
        document.getElementById('playerMax')
    );

    aiGame = new Game2048(
        document.getElementById('aiGrid'),
        document.getElementById('aiScore'),
        document.getElementById('aiMoves'),
        document.getElementById('aiMax')
    );

    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            setGameMode(btn.dataset.mode);
        });
    });

    document.getElementById('newGameBtn').addEventListener('click', newGame);
    document.getElementById('modalNewGame').addEventListener('click', () => {
        document.getElementById('gameOverModal').classList.add('hidden');
        newGame();
    });

    document.getElementById('pauseDemoBtn').addEventListener('click', toggleDemoPause);

    document.addEventListener('keydown', handleKeydown);

    // 触摸控制
    document.querySelectorAll('.touch-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (gameMode !== 'solo' && gameMode !== 'ai-vs') return;
            if (playerGame.gameOver) return;
            
            const dir = btn.dataset.dir;
            const moved = playerGame.move(dir);
            
            if (playerGame.gameOver) {
                stopAiVs();
                if (gameMode === 'ai-vs' && !aiGame.gameOver) {
                    showGameOver('AI获胜！', `玩家: ${playerGame.score} vs AI: ${aiGame.score}`);
                } else {
                    showGameOver('游戏结束！', `最终分数: ${playerGame.score}`);
                }
            }
        });
    });

    setGameMode('solo');
}

function setGameMode(mode) {
    console.log('设置游戏模式:', mode);
    gameMode = mode;
    stopDemo();
    stopAiVs();
    
    const aiBoard = document.getElementById('aiBoard');
    const demoControls = document.getElementById('demoControls');
    const message = document.getElementById('gameMessage');

    if (mode === 'solo') {
        aiBoard.classList.add('hidden');
        demoControls.classList.add('hidden');
        message.textContent = '使用方向键或WASD开始游戏！';
    } else if (mode === 'ai-vs') {
        aiBoard.classList.remove('hidden');
        demoControls.classList.add('hidden');
        message.textContent = '玩家 vs AI - 同时开始，看谁先到2048！';
    } else if (mode === 'ai-demo') {
        aiBoard.classList.add('hidden');
        demoControls.classList.remove('hidden');
        message.textContent = 'AI自动演示 - 看AI如何玩2048！';
    }

    newGame();
}

function newGame() {
    console.log('新游戏！模式:', gameMode);
    stopDemo();
    stopAiVs();
    playerGame.init();
    if (gameMode === 'ai-vs') {
        console.log('初始化AI游戏并启动AI对战');
        aiGame.init();
        startAiVs();
    }
    if (gameMode === 'ai-demo') {
        startDemo();
    }
    document.getElementById('gameMessage').textContent = gameMode === 'solo' ? '使用方向键或WASD开始游戏！' : 
                                                          gameMode === 'ai-vs' ? '玩家 vs AI - 同时开始！' :
                                                          'AI自动演示中...';
}

function startAiVs() {
    console.log('AI对战开始！');
    aiVsInterval = setInterval(() => {
        if (!aiGame.gameOver && !playerGame.gameOver) {
            console.log('AI尝试移动...');
            const aiMove = getBestMove(aiGame);
            console.log('AI选择的方向:', aiMove);
            if (aiMove) {
                aiGame.move(aiMove, false, true);
                console.log('AI移动成功！AI分数:', aiGame.score);
            }
            
            if (aiGame.gameOver && !playerGame.gameOver) {
                stopAiVs();
                showGameOver('玩家获胜！', `玩家: ${playerGame.score} vs AI: ${aiGame.score}`);
            }
        } else {
            console.log('游戏结束，停止AI');
            stopAiVs();
        }
    }, 800);
}

function stopAiVs() {
    if (aiVsInterval) {
        clearInterval(aiVsInterval);
        aiVsInterval = null;
    }
}

function startDemo() {
    const speed = 1000 - document.getElementById('demoSpeed').value;
    demoInterval = setInterval(() => {
        if (!isDemoPaused && !playerGame.gameOver) {
            const move = getBestMove(playerGame);
            if (move) {
                playerGame.move(move, false, false);
                if (playerGame.gameOver) {
                    stopDemo();
                    showGameOver('AI游戏结束！', `最终分数: ${playerGame.score}`);
                }
            }
        }
    }, speed);
}

function stopDemo() {
    if (demoInterval) {
        clearInterval(demoInterval);
        demoInterval = null;
    }
}

function toggleDemoPause() {
    isDemoPaused = !isDemoPaused;
    document.getElementById('pauseDemoBtn').textContent = isDemoPaused ? '▶️ 继续' : '⏸️ 暂停';
}

function handleKeydown(e) {
    if (gameMode !== 'solo' && gameMode !== 'ai-vs') return;
    if (playerGame.gameOver) return;

    const keyMap = {
        'ArrowUp': 'up', 'w': 'up', 'W': 'up',
        'ArrowDown': 'down', 's': 'down', 'S': 'down',
        'ArrowLeft': 'left', 'a': 'left', 'A': 'left',
        'ArrowRight': 'right', 'd': 'right', 'D': 'right'
    };

    if (keyMap[e.key]) {
        e.preventDefault();
        const moved = playerGame.move(keyMap[e.key]);

        if (playerGame.gameOver) {
            stopAiVs();
            if (gameMode === 'ai-vs' && !aiGame.gameOver) {
                showGameOver('AI获胜！', `玩家: ${playerGame.score} vs AI: ${aiGame.score}`);
            } else {
                showGameOver('游戏结束！', `最终分数: ${playerGame.score}`);
            }
        }
    }
}

function showGameOver(title, message) {
    stopAiVs();
    stopDemo();
    playSound2048('gameover');
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalMessage').textContent = message;
    document.getElementById('gameOverModal').classList.remove('hidden');
}

document.getElementById('demoSpeed').addEventListener('input', () => {
    if (demoInterval) {
        stopDemo();
        startDemo();
    }
});

init();
