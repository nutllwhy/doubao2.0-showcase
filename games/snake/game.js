// 贪吃蛇豪华版 - 游戏逻辑
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 游戏常量
const GRID_SIZE = 25;
const GRID_COUNT = 20;

// 游戏状态
let snake = [];
let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };
let food = null;
let powerups = [];
let particles = [];
let score = 0;
let highScore = 0;
let gameLoop = null;
let isPaused = false;
let gameSpeed = 150;
let difficulty = 'normal';
let activePowerup = null;
let powerupTimer = 0;

// 难度配置
const difficultyConfig = {
    easy: { speed: 200, powerupChance: 0.03 },
    normal: { speed: 150, powerupChance: 0.02 },
    hard: { speed: 100, powerupChance: 0.01 }
};

// 道具类型
const powerupTypes = [
    { type: 'speed', color: '#ff6b6b', name: '⚡ 加速', effect: () => { gameSpeed = Math.max(50, gameSpeed - 30); } },
    { type: 'slow', color: '#4ecdc4', name: '🐌 减速', effect: () => { gameSpeed = Math.min(300, gameSpeed + 50); } },
    { type: 'wall', color: '#a55eea', name: '👻 穿墙', effect: () => { activePowerup = 'wall'; powerupTimer = 300; } },
    { type: 'double', color: '#ffd700', name: '✨ 双倍分数', effect: () => { activePowerup = 'double'; powerupTimer = 300; } }
];

// 初始化
function init() {
    loadHighScore();
    document.getElementById('highScore').textContent = highScore;
    
    // 事件监听
    document.querySelectorAll('.difficulty-btn').forEach(btn => {
        btn.addEventListener('click', () => startGame(btn.dataset.difficulty));
    });
    
    document.getElementById('leaderboardBtn').addEventListener('click', showLeaderboard);
    document.getElementById('closeLeaderboardBtn').addEventListener('click', hideLeaderboard);
    document.getElementById('saveScoreBtn').addEventListener('click', saveScore);
    document.getElementById('restartBtn').addEventListener('click', restartGame);
    
    document.addEventListener('keydown', handleKeydown);
}

// 开始游戏
function startGame(diff) {
    difficulty = diff;
    gameSpeed = difficultyConfig[diff].speed;
    score = 0;
    activePowerup = null;
    powerupTimer = 0;
    powerups = [];
    particles = [];
    
    // 初始化蛇
    snake = [
        { x: 5, y: 10 },
        { x: 4, y: 10 },
        { x: 3, y: 10 }
    ];
    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };
    
    generateFood();
    
    document.getElementById('score').textContent = score;
    document.getElementById('startScreen').classList.add('hidden');
    
    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(update, gameSpeed);
}

// 更新游戏
function update() {
    if (isPaused) return;
    
    // 更新道具效果
    if (powerupTimer > 0) {
        powerupTimer--;
        if (powerupTimer <= 0) {
            activePowerup = null;
            updatePowerupStatus();
        }
    }
    
    direction = { ...nextDirection };
    
    // 移动蛇
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
    
    // 穿墙处理
    if (activePowerup === 'wall') {
        if (head.x < 0) head.x = GRID_COUNT - 1;
        if (head.x >= GRID_COUNT) head.x = 0;
        if (head.y < 0) head.y = GRID_COUNT - 1;
        if (head.y >= GRID_COUNT) head.y = 0;
    } else {
        // 撞墙检测
        if (head.x < 0 || head.x >= GRID_COUNT || head.y < 0 || head.y >= GRID_COUNT) {
            gameOver();
            return;
        }
    }
    
    // 撞自己检测
    for (let i = 0; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            gameOver();
            return;
        }
    }
    
    snake.unshift(head);
    
    // 吃食物
    if (head.x === food.x && head.y === food.y) {
        let points = 10;
        if (activePowerup === 'double') points *= 2;
        score += points;
        document.getElementById('score').textContent = score;
        
        createParticles(food.x, food.y, food.color);
        generateFood();
    } else {
        snake.pop();
    }
    
    // 吃道具
    for (let i = powerups.length - 1; i >= 0; i--) {
        if (head.x === powerups[i].x && head.y === powerups[i].y) {
            const p = powerups[i];
            p.effect();
            createParticles(p.x, p.y, p.color);
            updatePowerupStatus();
            powerups.splice(i, 1);
        }
    }
    
    // 随机生成道具
    if (Math.random() < difficultyConfig[difficulty].powerupChance && powerups.length < 3) {
        generatePowerup();
    }
    
    // 更新粒子
    particles = particles.filter(p => {
        p.life--;
        p.x += p.vx;
        p.y += p.vy;
        return p.life > 0;
    });
    
    draw();
}

// 绘制
function draw() {
    // 清空画布
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 绘制网格
    ctx.strokeStyle = 'rgba(0, 255, 136, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID_COUNT; i++) {
        ctx.beginPath();
        ctx.moveTo(i * GRID_SIZE, 0);
        ctx.lineTo(i * GRID_SIZE, canvas.height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * GRID_SIZE);
        ctx.lineTo(canvas.width, i * GRID_SIZE);
        ctx.stroke();
    }
    
    // 绘制粒子
    particles.forEach(p => {
        ctx.globalAlpha = p.life / 30;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x * GRID_SIZE + GRID_SIZE / 2, p.y * GRID_SIZE + GRID_SIZE / 2, p.size, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.globalAlpha = 1;
    
    // 绘制食物
    if (food) {
        ctx.fillStyle = food.color;
        ctx.shadowColor = food.color;
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(food.x * GRID_SIZE + GRID_SIZE / 2, food.y * GRID_SIZE + GRID_SIZE / 2, GRID_SIZE / 2 - 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }
    
    // 绘制道具
    powerups.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(p.x * GRID_SIZE + GRID_SIZE / 2, p.y * GRID_SIZE + GRID_SIZE / 2, GRID_SIZE / 2 - 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    });
    
    // 绘制蛇
    snake.forEach((segment, index) => {
        const gradient = ctx.createRadialGradient(
            segment.x * GRID_SIZE + GRID_SIZE / 2,
            segment.y * GRID_SIZE + GRID_SIZE / 2,
            0,
            segment.x * GRID_SIZE + GRID_SIZE / 2,
            segment.y * GRID_SIZE + GRID_SIZE / 2,
            GRID_SIZE / 2
        );
        
        if (index === 0) {
            gradient.addColorStop(0, '#00ff88');
            gradient.addColorStop(1, '#00cc6a');
        } else {
            const shade = Math.max(0.3, 1 - index * 0.03);
            gradient.addColorStop(0, `rgba(0, 255, 136, ${shade})`);
            gradient.addColorStop(1, `rgba(0, 204, 106, ${shade})`);
        }
        
        ctx.fillStyle = gradient;
        ctx.shadowColor = '#00ff88';
        ctx.shadowBlur = index === 0 ? 15 : 5;
        ctx.beginPath();
        ctx.roundRect(
            segment.x * GRID_SIZE + 2,
            segment.y * GRID_SIZE + 2,
            GRID_SIZE - 4,
            GRID_SIZE - 4,
            5
        );
        ctx.fill();
    });
    ctx.shadowBlur = 0;
    
    // 暂停提示
    if (isPaused) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#00ff88';
        ctx.font = 'bold 40px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('暂停', canvas.width / 2, canvas.height / 2);
    }
}

// 生成食物
function generateFood() {
    const colors = ['#ff4757', '#ffa502', '#a55eea', '#ff6b81'];
    let x, y;
    do {
        x = Math.floor(Math.random() * GRID_COUNT);
        y = Math.floor(Math.random() * GRID_COUNT);
    } while (isOccupied(x, y));
    
    food = { x, y, color: colors[Math.floor(Math.random() * colors.length)] };
}

// 生成道具
function generatePowerup() {
    const type = powerupTypes[Math.floor(Math.random() * powerupTypes.length)];
    let x, y;
    do {
        x = Math.floor(Math.random() * GRID_COUNT);
        y = Math.floor(Math.random() * GRID_COUNT);
    } while (isOccupied(x, y));
    
    powerups.push({ x, y, ...type });
}

// 检查位置是否被占用
function isOccupied(x, y) {
    if (food && food.x === x && food.y === y) return true;
    if (snake.some(s => s.x === x && s.y === y)) return true;
    if (powerups.some(p => p.x === x && p.y === y)) return true;
    return false;
}

// 创建粒子
function createParticles(x, y, color) {
    for (let i = 0; i < 15; i++) {
        particles.push({
            x, y,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            color,
            size: Math.random() * 5 + 2,
            life: 30
        });
    }
}

// 更新道具状态
function updatePowerupStatus() {
    const status = document.getElementById('powerupStatus');
    if (activePowerup) {
        const name = activePowerup === 'wall' ? '👻 穿墙模式' : '✨ 双倍分数';
        status.innerHTML = `<span class="powerup-active">${name} 生效中！</span>`;
    } else {
        status.textContent = '';
    }
}

// 游戏结束
function gameOver() {
    clearInterval(gameLoop);
    if (score > highScore) {
        highScore = score;
        saveHighScore();
        document.getElementById('highScore').textContent = highScore;
    }
    document.getElementById('finalScore').textContent = score;
    document.getElementById('gameOverScreen').classList.remove('hidden');
}

// 保存分数
function saveScore() {
    const name = document.getElementById('playerName').value.trim() || '匿名玩家';
    let leaderboard = JSON.parse(localStorage.getItem('snakeLeaderboard') || '[]');
    leaderboard.push({ name, score, date: new Date().toLocaleDateString() });
    leaderboard.sort((a, b) => b.score - a.score);
    leaderboard = leaderboard.slice(0, 10);
    localStorage.setItem('snakeLeaderboard', JSON.stringify(leaderboard));
    restartGame();
}

// 显示排行榜
function showLeaderboard() {
    const leaderboard = JSON.parse(localStorage.getItem('snakeLeaderboard') || '[]');
    const list = document.getElementById('leaderboardList');
    
    if (leaderboard.length === 0) {
        list.innerHTML = '<p style="color: rgba(255,255,255,0.5);">暂无记录</p>';
    } else {
        list.innerHTML = leaderboard.map((entry, index) => {
            let cls = '';
            if (index === 0) cls = 'gold';
            else if (index === 1) cls = 'silver';
            else if (index === 2) cls = 'bronze';
            
            return `
                <div class="leaderboard-item ${cls}">
                    <span class="leaderboard-rank">${index + 1}</span>
                    <span class="leaderboard-name">${entry.name}</span>
                    <span class="leaderboard-score">${entry.score}</span>
                </div>
            `;
        }).join('');
    }
    
    document.getElementById('startScreen').classList.add('hidden');
    document.getElementById('leaderboardScreen').classList.remove('hidden');
}

// 隐藏排行榜
function hideLeaderboard() {
    document.getElementById('leaderboardScreen').classList.add('hidden');
    document.getElementById('startScreen').classList.remove('hidden');
}

// 重新开始
function restartGame() {
    document.getElementById('gameOverScreen').classList.add('hidden');
    document.getElementById('startScreen').classList.remove('hidden');
}

// 加载最高分
function loadHighScore() {
    highScore = parseInt(localStorage.getItem('snakeHighScore') || '0');
}

// 保存最高分
function saveHighScore() {
    localStorage.setItem('snakeHighScore', highScore);
}

// 键盘事件
function handleKeydown(e) {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd', ' '].includes(e.key)) {
        e.preventDefault();
    }
    
    switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            if (direction.y !== 1) nextDirection = { x: 0, y: -1 };
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            if (direction.y !== -1) nextDirection = { x: 0, y: 1 };
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            if (direction.x !== 1) nextDirection = { x: -1, y: 0 };
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            if (direction.x !== -1) nextDirection = { x: 1, y: 0 };
            break;
        case ' ':
            if (gameLoop) isPaused = !isPaused;
            break;
    }
}

// 初始化游戏
init();
