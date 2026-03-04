// 手势塔罗 - 神秘运势解读
const tarotCards = [
    { name: "愚者", icon: "🃏", meaning: "新的开始、冒险、天真", 
      love: "爱情上有新的机会，保持开放的心态去迎接。",
      career: "工作上可能会有新的起点，勇敢去尝试。",
      wealth: "财务上需要谨慎，但也有新的机遇。",
      health: "注意劳逸结合，保持轻松的心态。" },
    { name: "魔术师", icon: "✨", meaning: "创造力、技能、意志力",
      love: "用你的魅力和智慧去经营感情。",
      career: "展现你的才能，会有好的发展。",
      wealth: "通过自己的努力可以获得收益。",
      health: "保持积极的心态，身体会更健康。" },
    { name: "女祭司", icon: "🌙", meaning: "直觉、神秘、内在智慧",
      love: "倾听内心的声音，感受真实的感情。",
      career: "需要冷静思考，不要冲动做决定。",
      wealth: "保守一些，不要冒险投资。",
      health: "注意休息，保持内心平静。" },
    { name: "女皇", icon: "👑", meaning: "丰饶、母性、自然",
      love: "感情会很甜蜜，充满温暖。",
      career: "工作上会有收获，得到认可。",
      wealth: "财运不错，有物质回报。",
      health: "状态很好，充满活力。" },
    { name: "皇帝", icon: "👨", meaning: "权威、稳定、领导力",
      love: "感情中需要责任感和承诺。",
      career: "有机会获得晋升或领导位置。",
      wealth: "财务稳定，但不要太固执。",
      health: "注意骨骼和关节健康。" },
    { name: "恋人", icon: "💕", meaning: "爱情、选择、和谐",
      love: "爱情运势极佳，可能遇到心仪对象。",
      career: "面临选择，需要认真权衡。",
      wealth: "合作运势不错，可以考虑合伙。",
      health: "心情愉悦，身体状况良好。" },
    { name: "战车", icon: "🏛️", meaning: "胜利、意志力、决心",
      love: "需要主动出击，把握感情机会。",
      career: "通过努力可以达成目标。",
      wealth: "需要主动争取，财运会来。",
      health: "保持运动，增强体质。" },
    { name: "力量", icon: "🦁", meaning: "勇气、耐心、内心力量",
      love: "用温柔和耐心去经营感情。",
      career: "有能力解决困难的问题。",
      wealth: "稳健理财，不要冲动。",
      health: "心态很好，抵抗力强。" },
    { name: "隐士", icon: "🏔️", meaning: "内省、寻找、独处",
      love: "需要一些时间独处，想清楚自己要什么。",
      career: "适合学习和提升自己。",
      wealth: "保守为主，不要冒险。",
      health: "注意睡眠，给自己一些休息时间。" },
    { name: "命运之轮", icon: "🎡", meaning: "变化、转折、机遇",
      love: "感情可能会有意外的变化。",
      career: "工作上会有转机，把握机会。",
      wealth: "财运起伏，保持平常心。",
      health: "注意适应变化，保持灵活。" },
    { name: "正义", icon: "⚖️", meaning: "公平、真理、因果",
      love: "感情中需要诚实和公平。",
      career: "你的付出会得到公正的回报。",
      wealth: "合理理财，不贪不占。",
      health: "保持平衡的生活方式。" },
    { name: "倒吊人", icon: "🙃", meaning: "放下、新视角、牺牲",
      love: "换个角度看待感情，会有新发现。",
      career: "暂时的等待是为了更好的前进。",
      wealth: "不要急于求成，耐心等待。",
      health: "换个方式休养，可能更有效。" },
    { name: "死神", icon: "💀", meaning: "结束、转变、新生",
      love: "一段关系的结束，也是新的开始。",
      career: "旧的工作模式结束，新的机会到来。",
      wealth: "财务上有变动，但不一定是坏事。",
      health: "身体在排毒和更新，注意休养。" },
    { name: "节制", icon: "⚗️", meaning: "平衡、调和、耐心",
      love: "感情需要慢慢培养，循序渐进。",
      career: "稳健发展，不要急于求成。",
      wealth: "量入为出，保持平衡。",
      health: "生活规律，饮食有节。" },
    { name: "恶魔", icon: "😈", meaning: "束缚、诱惑、欲望",
      love: "不要被欲望冲昏头脑，保持清醒。",
      career: "警惕工作中的诱惑和陷阱。",
      wealth: "不要贪心，避免高风险投资。",
      health: "注意节制，不要过度放纵。" },
    { name: "塔", icon: "🗼", meaning: "突变、觉醒、破坏",
      love: "感情可能会有突发状况，保持冷静。",
      career: "意外事件可能打破现状，但也是转机。",
      wealth: "财务上可能有损失，要做好准备。",
      health: "注意安全，避免意外。" },
    { name: "星星", icon: "⭐", meaning: "希望、灵感、平静",
      love: "对爱情保持希望，美好的事情会发生。",
      career: "充满灵感，工作有创意。",
      wealth: "财运逐渐好转，保持信心。",
      health: "心情放松，身体自然好。" },
    { name: "月亮", icon: "🌕", meaning: "不安、幻觉、潜意识",
      love: "感情中有些不确定，需要时间验证。",
      career: "工作上有些迷茫，找朋友聊聊。",
      wealth: "不要轻信高收益的诱惑。",
      health: "注意情绪健康，可能有些焦虑。" },
    { name: "太阳", icon: "☀️", meaning: "成功、快乐、活力",
      love: "感情充满阳光，甜蜜幸福。",
      career: "工作顺利，充满正能量。",
      wealth: "财运旺盛，有好的收获。",
      health: "精力充沛，身体很棒。" },
    { name: "审判", icon: "📯", meaning: "觉醒、重生、救赎",
      love: "感情有新的领悟，重新开始。",
      career: "对工作有新的认识，找到方向。",
      wealth: "财务状况会有明显改善。",
      health: "身心都在好转，焕然一新。" },
    { name: "世界", icon: "🌍", meaning: "完成、圆满、旅行",
      love: "感情圆满，修成正果。",
      career: "达成目标，获得成功。",
      wealth: "财务丰收，心想事成。",
      health: "身心都处于最佳状态。" }
];

let selectedCards = [];
let currentSpread = 'one';
let hands, videoElement, canvasElement, canvasCtx;
let isGestureActive = false;
let lastGesture = null;
let gestureHoldTime = 0;

function init() {
    showStatus('📷', '请允许访问摄像头', true);
    
    videoElement = document.getElementById('video');
    canvasElement = document.getElementById('canvas');
    canvasCtx = canvasElement.getContext('2d');

    hands = new Hands({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
    });

    hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.7,
        minTrackingConfidence: 0.5
    });

    hands.onResults(onResults);

    requestCameraPermission();
    initCards();
    
    document.querySelectorAll('.spread-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.spread-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentSpread = btn.dataset.spread;
            initCards();
        });
    });

    document.querySelectorAll('.reading-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.reading-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            showReading(tab.dataset.type);
        });
    });

    document.getElementById('resetBtn').addEventListener('click', resetGame);
}

async function requestCameraPermission() {
    try {
        showStatus('📷', '正在请求摄像头权限...');
        
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: 640,
                height: 480,
                facingMode: 'user'
            }
        });
        
        videoElement.srcObject = stream;
        await videoElement.play();
        
        showStatus('🔮', '正在加载手势识别...');
        
        const camera = new Camera(videoElement, {
            onFrame: async () => {
                await hands.send({ image: videoElement });
            },
            width: 640,
            height: 480
        });
        
        await camera.start();
        hideStatus();
        
    } catch (err) {
        console.error('Camera error:', err);
        showStatus('⚠️', '无法访问摄像头，请检查权限设置后刷新页面', true);
    }
}

function onResults(results) {
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasElement.width = videoElement.videoWidth;
    canvasElement.height = videoElement.videoHeight;

    canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        for (const landmarks of results.multiHandLandmarks) {
            drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, { color: '#9d4edd', lineWidth: 3 });
            drawLandmarks(canvasCtx, landmarks, { color: '#c77dff', lineWidth: 1, radius: 4 });
        }

        const gesture = detectGesture(results.multiHandLandmarks[0]);
        handleGesture(gesture);
    } else {
        updateGestureDisplay('等待手势...');
        isGestureActive = false;
        gestureHoldTime = 0;
    }

    canvasCtx.restore();
}

function detectGesture(landmarks) {
    const thumbTip = landmarks[4];
    const indexTip = landmarks[8];
    const indexPIP = landmarks[6];
    const middleTip = landmarks[12];
    const middlePIP = landmarks[10];
    const ringTip = landmarks[16];
    const ringPIP = landmarks[14];
    const pinkyTip = landmarks[20];
    const pinkyPIP = landmarks[18];

    const indexUp = indexTip.y < indexPIP.y;
    const middleUp = middleTip.y < middlePIP.y;
    const ringUp = ringTip.y < ringPIP.y;
    const pinkyUp = pinkyTip.y < pinkyPIP.y;

    if (indexUp && !middleUp && !ringUp && !pinkyUp) {
        return 'one';
    } else if (indexUp && middleUp && !ringUp && !pinkyUp) {
        return 'two';
    } else if (indexUp && middleUp && ringUp && !pinkyUp) {
        return 'three';
    } else if (indexUp && middleUp && ringUp && pinkyUp) {
        return 'palm';
    }

    return 'unknown';
}

function handleGesture(gesture) {
    const gestureNames = {
        'one': '👆 选择第1张牌',
        'two': '✌️ 选择第2张牌',
        'three': '🤟 选择第3张牌',
        'palm': '🖐️ 重新开始',
        'unknown': '🤔 无法识别'
    };

    updateGestureDisplay(gestureNames[gesture] || '等待手势...');

    if (gesture === lastGesture && gesture !== 'unknown') {
        gestureHoldTime++;
        if (gestureHoldTime > 15 && !isGestureActive) {
            isGestureActive = true;
            executeGestureAction(gesture);
        }
    } else {
        lastGesture = gesture;
        gestureHoldTime = 0;
        isGestureActive = false;
    }
}

function executeGestureAction(gesture) {
    if (selectedCards.length >= (currentSpread === 'one' ? 1 : 3)) {
        if (gesture === 'palm') {
            resetGame();
        }
        return;
    }

    let cardIndex;
    switch(gesture) {
        case 'one':
            cardIndex = 0;
            break;
        case 'two':
            cardIndex = 1;
            break;
        case 'three':
            cardIndex = 2;
            break;
        case 'palm':
            resetGame();
            return;
        default:
            return;
    }

    if (currentSpread === 'one') {
        selectCard(cardIndex);
    } else if (currentSpread === 'three') {
        if (!selectedCards.includes(cardIndex)) {
            selectCard(cardIndex);
        }
    }
}

function updateGestureDisplay(text) {
    document.getElementById('currentGesture').textContent = text;
}

function initCards() {
    const container = document.getElementById('cardsContainer');
    container.innerHTML = '';
    selectedCards = [];
    
    const numCards = currentSpread === 'one' ? 3 : 5;
    const shuffled = [...tarotCards].sort(() => Math.random() - 0.5).slice(0, numCards);
    
    shuffled.forEach((card, index) => {
        const cardEl = document.createElement('div');
        cardEl.className = 'card';
        cardEl.dataset.index = index;
        cardEl.dataset.card = JSON.stringify(card);
        cardEl.innerHTML = `
            <div class="card-inner">
                <div class="card-back"></div>
                <div class="card-front">
                    <div class="card-icon">${card.icon}</div>
                    <div class="card-name">${card.name}</div>
                    <div class="card-meaning">${card.meaning}</div>
                </div>
            </div>
        `;
        cardEl.addEventListener('click', () => selectCard(index));
        container.appendChild(cardEl);
    });

    document.getElementById('readingSection').classList.remove('show');
    document.getElementById('actionButtons').style.display = 'none';
}

function selectCard(index) {
    if (selectedCards.includes(index)) return;
    
    const cards = document.querySelectorAll('.card');
    const cardEl = cards[index];
    const cardData = JSON.parse(cardEl.dataset.card);
    
    cardEl.classList.add('flipped');
    selectedCards.push(index);
    
    const needed = currentSpread === 'one' ? 1 : 3;
    if (selectedCards.length >= needed) {
        setTimeout(() => showReading('love'), 1000);
    }
}

function showReading(type) {
    const container = document.getElementById('readingContent');
    const cards = document.querySelectorAll('.card');
    let html = '';

    selectedCards.forEach((index, i) => {
        const cardData = JSON.parse(cards[index].dataset.card);
        let position;
        if (currentSpread === 'one') {
            position = '当前指引';
        } else {
            position = ['过去', '现在', '未来'][i];
        }
        
        html += `
            <div class="reading-card">
                <div class="reading-card-name">${cardData.icon} ${cardData.name} - ${position}</div>
                <div class="reading-card-text">${cardData[type]}</div>
            </div>
        `;
    });

    container.innerHTML = html;
    document.getElementById('readingSection').classList.add('show');
    document.getElementById('actionButtons').style.display = 'flex';
}

function resetGame() {
    initCards();
    isGestureActive = false;
    gestureHoldTime = 0;
}

function showStatus(icon, text, showRefresh = false) {
    document.getElementById('statusIcon').textContent = icon;
    document.getElementById('statusText').textContent = text;
    
    let refreshBtn = document.getElementById('refreshBtn');
    if (showRefresh) {
        if (!refreshBtn) {
            refreshBtn = document.createElement('button');
            refreshBtn.id = 'refreshBtn';
            refreshBtn.style.cssText = `
                margin-top: 20px;
                padding: 12px 25px;
                background: linear-gradient(135deg, #9d4edd 0%, #7b2cbf 100%);
                border: none;
                border-radius: 8px;
                color: white;
                font-size: 1rem;
                cursor: pointer;
                font-family: Georgia, serif;
                transition: all 0.3s ease;
            `;
            refreshBtn.textContent = '🔄 刷新页面';
            refreshBtn.onclick = () => location.reload();
            document.getElementById('statusOverlay').appendChild(refreshBtn);
        }
        refreshBtn.style.display = 'block';
    } else {
        if (refreshBtn) {
            refreshBtn.style.display = 'none';
        }
    }
    
    document.getElementById('statusOverlay').classList.remove('hidden');
}

function hideStatus() {
    document.getElementById('statusOverlay').classList.add('hidden');
}

init();
