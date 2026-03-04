// 霓虹冲刺 - 3D跑酷游戏
let scene, camera, renderer;
let player, ground, obstacles = [], coins = [];
let gameSpeed = 0.3;
let score = 0, distance = 0;
let isGameOver = false, isAIDemo = false;
let playerLane = 1;
let isJumping = false, jumpVelocity = 0;
let lanes = [-4, 0, 4];
let lastObstacleZ = 0, lastCoinZ = 0;

function init() {
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x0a0a0f, 10, 100);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 8);
    camera.lookAt(0, 2, -20);

    renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('gameCanvas'), antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x0a0a0f);

    addLights();
    createGround();
    createPlayer();
    createBackground();

    document.addEventListener('keydown', handleKeydown);
    document.getElementById('leftBtn').addEventListener('click', () => movePlayer(-1));
    document.getElementById('rightBtn').addEventListener('click', () => movePlayer(1));
    document.getElementById('jumpBtn').addEventListener('click', () => jump());
    document.getElementById('restartBtn').addEventListener('click', restartGame);
    document.getElementById('aiDemoBtn').addEventListener('click', startAIDemo);

    window.addEventListener('resize', onWindowResize);

    resetGame();
    animate();
}

function addLights() {
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0x00ffff, 1);
    directionalLight.position.set(5, 10, 5);
    scene.add(directionalLight);

    const pointLight1 = new THREE.PointLight(0xff00ff, 1, 50);
    pointLight1.position.set(-10, 5, -20);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x00ffff, 1, 50);
    pointLight2.position.set(10, 5, -40);
    scene.add(pointLight2);
}

function createGround() {
    const groundGeometry = new THREE.BoxGeometry(20, 0.5, 200);
    const groundMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x1a1a2e,
        emissive: 0x0a0a15
    });
    ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.position.z = -80;
    scene.add(ground);

    for (let i = 0; i < 20; i++) {
        const lineGeometry = new THREE.BoxGeometry(0.2, 0.6, 5);
        const lineMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x00ffff,
            emissive: 0x00ffff,
            emissiveIntensity: 0.5
        });
        
        const line1 = new THREE.Mesh(lineGeometry, lineMaterial);
        line1.position.set(-2, 0, -i * 10);
        scene.add(line1);
        
        const line2 = new THREE.Mesh(lineGeometry, lineMaterial);
        line2.position.set(2, 0, -i * 10);
        scene.add(line2);
    }
}

function createPlayer() {
    const bodyGeometry = new THREE.BoxGeometry(1, 1.5, 1);
    const bodyMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xff00ff,
        emissive: 0xff00ff,
        emissiveIntensity: 0.5
    });
    player = new THREE.Mesh(bodyGeometry, bodyMaterial);
    player.position.y = 1.25;
    player.position.z = 5;
    scene.add(player);

    const glowGeometry = new THREE.SphereGeometry(1.5, 16, 16);
    const glowMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xff00ff,
        transparent: true,
        opacity: 0.2
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    player.add(glow);
}

function createBackground() {
    for (let i = 0; i < 30; i++) {
        const buildingGeometry = new THREE.BoxGeometry(
            Math.random() * 4 + 2,
            Math.random() * 20 + 10,
            Math.random() * 4 + 2
        );
        const buildingMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x16213e,
            emissive: 0x0a0a15
        });
        const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
        building.position.x = Math.random() > 0.5 ? -15 : 15;
        building.position.z = -i * 10 - Math.random() * 5;
        building.position.y = building.geometry.parameters.height / 2;
        scene.add(building);

        for (let j = 0; j < 10; j++) {
            if (Math.random() > 0.3) {
                const windowGeometry = new THREE.BoxGeometry(0.3, 0.4, 0.1);
                const windowMaterial = new THREE.MeshBasicMaterial({ 
                    color: Math.random() > 0.5 ? 0x00ffff : 0xff00ff
                });
                const window = new THREE.Mesh(windowGeometry, windowMaterial);
                window.position.x = building.position.x + (Math.random() - 0.5) * 2;
                window.position.y = j * 2 + 2;
                window.position.z = building.position.z + (Math.random() - 0.5) * 2;
                scene.add(window);
            }
        }
    }
}

function spawnObstacle() {
    const obstacleGeometry = new THREE.BoxGeometry(1.5, 2, 1.5);
    const obstacleMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xff0055,
        emissive: 0xff0055,
        emissiveIntensity: 0.5
    });
    const obstacle = new THREE.Mesh(obstacleGeometry, obstacleMaterial);
    obstacle.position.x = lanes[Math.floor(Math.random() * 3)];
    obstacle.position.y = 1;
    obstacle.position.z = lastObstacleZ - 30;
    obstacle.userData.type = 'obstacle';
    scene.add(obstacle);
    obstacles.push(obstacle);
    lastObstacleZ = obstacle.position.z;
}

function spawnCoin() {
    const coinGeometry = new THREE.TorusGeometry(0.5, 0.15, 8, 16);
    const coinMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xffff00,
        emissive: 0xffaa00,
        emissiveIntensity: 0.8
    });
    const coin = new THREE.Mesh(coinGeometry, coinMaterial);
    coin.position.x = lanes[Math.floor(Math.random() * 3)];
    coin.position.y = 2;
    coin.position.z = lastCoinZ - 20;
    coin.userData.type = 'coin';
    scene.add(coin);
    coins.push(coin);
    lastCoinZ = coin.position.z;
}

function movePlayer(direction) {
    if (isGameOver) return;
    const newLane = playerLane + direction;
    if (newLane >= 0 && newLane <= 2) {
        playerLane = newLane;
    }
}

function jump() {
    if (isGameOver || isJumping) return;
    isJumping = true;
    jumpVelocity = 0.4;
}

function handleKeydown(e) {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        movePlayer(-1);
    } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        movePlayer(1);
    } else if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        jump();
    }
}

function checkCollisions() {
    const playerBox = new THREE.Box3().setFromObject(player);

    for (let i = obstacles.length - 1; i >= 0; i--) {
        const obstacle = obstacles[i];
        const obstacleBox = new THREE.Box3().setFromObject(obstacle);
        
        if (playerBox.intersectsBox(obstacleBox)) {
            gameOver();
            return;
        }
    }

    for (let i = coins.length - 1; i >= 0; i--) {
        const coin = coins[i];
        const coinBox = new THREE.Box3().setFromObject(coin);
        
        if (playerBox.intersectsBox(coinBox)) {
            score += 100;
            scene.remove(coin);
            coins.splice(i, 1);
            updateUI();
        }
    }
}

function updateUI() {
    document.getElementById('scoreDisplay').textContent = score;
    document.getElementById('distanceDisplay').textContent = Math.floor(distance) + 'm';
}

function gameOver() {
    isGameOver = true;
    document.getElementById('finalScore').textContent = score;
    document.getElementById('gameOverModal').classList.remove('hidden');
}

function resetGame() {
    score = 0;
    distance = 0;
    gameSpeed = 0.3;
    playerLane = 1;
    isJumping = false;
    jumpVelocity = 0;
    isGameOver = false;
    isAIDemo = false;
    lastObstacleZ = 0;
    lastCoinZ = 0;

    for (let i = obstacles.length - 1; i >= 0; i--) {
        scene.remove(obstacles[i]);
    }
    obstacles = [];

    for (let i = coins.length - 1; i >= 0; i--) {
        scene.remove(coins[i]);
    }
    coins = [];

    player.position.x = lanes[1];
    player.position.y = 1.25;
    player.position.z = 5;

    document.getElementById('gameOverModal').classList.add('hidden');
    updateUI();
}

function restartGame() {
    resetGame();
}

function startAIDemo() {
    resetGame();
    isAIDemo = true;
}

function aiDecision() {
    if (!isAIDemo || isGameOver) return;

    let bestLane = playerLane;
    let minDanger = Infinity;

    for (let lane = 0; lane <= 2; lane++) {
        let danger = 0;
        for (const obstacle of obstacles) {
            if (obstacle.position.z < 10 && obstacle.position.z > -10) {
                const obstacleLane = lanes.indexOf(obstacle.position.x);
                if (obstacleLane === lane) {
                    danger += 100 / (Math.abs(obstacle.position.z) + 1);
                }
            }
        }
        for (const coin of coins) {
            if (coin.position.z < 10 && coin.position.z > -10) {
                const coinLane = lanes.indexOf(coin.position.x);
                if (coinLane === lane) {
                    danger -= 50 / (Math.abs(coin.position.z) + 1);
                }
            }
        }
        if (Math.abs(lane - playerLane) > 1) {
            danger += 10;
        }
        if (danger < minDanger) {
            minDanger = danger;
            bestLane = lane;
        }
    }

    if (bestLane !== playerLane) {
        movePlayer(bestLane - playerLane);
    }

    let shouldJump = false;
    for (const obstacle of obstacles) {
        if (obstacle.position.z < 5 && obstacle.position.z > 0) {
            const obstacleLane = lanes.indexOf(obstacle.position.x);
            if (obstacleLane === playerLane) {
                shouldJump = true;
                break;
            }
        }
    }
    if (shouldJump) {
        jump();
    }
}

function animate() {
    requestAnimationFrame(animate);

    if (!isGameOver) {
        gameSpeed = Math.min(gameSpeed + 0.0001, 0.8);
        distance += gameSpeed;
        score += Math.floor(gameSpeed);

        const targetX = lanes[playerLane];
        player.position.x += (targetX - player.position.x) * 0.2;

        if (isJumping) {
            player.position.y += jumpVelocity;
            jumpVelocity -= 0.015;
            if (player.position.y <= 1.25) {
                player.position.y = 1.25;
                isJumping = false;
                jumpVelocity = 0;
            }
        }

        if (player.position.y > 1.25) {
            player.rotation.x += 0.1;
        } else {
            player.rotation.x = 0;
        }

        for (let i = obstacles.length - 1; i >= 0; i--) {
            obstacles[i].position.z += gameSpeed;
            obstacles[i].rotation.y += 0.02;
            if (obstacles[i].position.z > 20) {
                scene.remove(obstacles[i]);
                obstacles.splice(i, 1);
            }
        }

        for (let i = coins.length - 1; i >= 0; i--) {
            coins[i].position.z += gameSpeed;
            coins[i].rotation.y += 0.05;
            coins[i].rotation.x += 0.03;
            if (coins[i].position.z > 20) {
                scene.remove(coins[i]);
                coins.splice(i, 1);
            }
        }

        if (lastObstacleZ > -80) {
            spawnObstacle();
        }
        if (lastCoinZ > -60) {
            spawnCoin();
        }

        checkCollisions();
        aiDecision();
        updateUI();
    }

    camera.position.z = player.position.z + 8;
    camera.position.x = player.position.x * 0.3;

    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

init();
