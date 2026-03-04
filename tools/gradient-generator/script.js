// CSS渐变生成器
let gradientType = 'linear';
let direction = 'to bottom';
let angle = 180;
let shape = 'circle';
let size = 50;
let position = 'center';
let colorStops = [];

function init() {
    colorStops = [
        { color: '#667eea', position: 0 },
        { color: '#764ba2', position: 100 }
    ];

    bindEvents();
    renderColorStops();
    applyPresetBackgrounds();
    updatePreview();
}

function bindEvents() {
    document.querySelectorAll('.type-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            gradientType = btn.dataset.type;
            toggleControls();
            updatePreview();
        });
    });

    document.querySelectorAll('.dir-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.dir-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            direction = btn.dataset.dir;
            updatePreview();
        });
    });

    document.querySelectorAll('.shape-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.shape-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            shape = btn.dataset.shape;
            updatePreview();
        });
    });

    document.querySelectorAll('.pos-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.pos-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            position = btn.dataset.pos;
            updatePreview();
        });
    });

    document.getElementById('angleSlider').addEventListener('input', (e) => {
        angle = parseInt(e.target.value);
        document.getElementById('angleValue').textContent = angle + '°';
        document.querySelectorAll('.dir-btn').forEach(b => b.classList.remove('active'));
        updatePreview();
    });

    document.getElementById('sizeSlider').addEventListener('input', (e) => {
        size = parseInt(e.target.value);
        document.getElementById('sizeValue').textContent = size + '%';
        updatePreview();
    });

    document.getElementById('previewWidth').addEventListener('input', (e) => {
        const width = e.target.value;
        document.getElementById('previewWidthValue').textContent = width + 'px';
        document.getElementById('preview').style.width = width + 'px';
    });

    document.getElementById('addColorBtn').addEventListener('click', addColorStop);

    document.getElementById('copyCodeBtn').addEventListener('click', copyCode);

    document.querySelectorAll('.preset').forEach(preset => {
        preset.addEventListener('click', () => {
            const colors = preset.dataset.colors.split(',');
            colorStops = colors.map((color, index) => ({
                color: color.trim(),
                position: index === 0 ? 0 : index === colors.length - 1 ? 100 : Math.round((index / (colors.length - 1)) * 100)
            }));
            renderColorStops();
            updatePreview();
            showNotification('预设已应用！');
        });
    });
}

function toggleControls() {
    const linearControls = document.getElementById('linearControls');
    const radialControls = document.getElementById('radialControls');

    if (gradientType.includes('linear')) {
        linearControls.classList.remove('hidden');
        radialControls.classList.add('hidden');
    } else {
        linearControls.classList.add('hidden');
        radialControls.classList.remove('hidden');
    }
}

function renderColorStops() {
    const container = document.getElementById('colorStops');
    container.innerHTML = '';

    colorStops.forEach((stop, index) => {
        const div = document.createElement('div');
        div.className = 'color-stop';
        div.innerHTML = `
            <input type="color" value="${stop.color}" data-index="${index}" class="color-input">
            <input type="number" value="${stop.position}" min="0" max="100" data-index="${index}" class="position-input">
            <span>%</span>
            ${colorStops.length > 2 ? `<button class="remove-btn" data-index="${index}">✕</button>` : ''}
        `;
        container.appendChild(div);
    });

    container.querySelectorAll('.color-input').forEach(input => {
        input.addEventListener('input', (e) => {
            colorStops[parseInt(e.target.dataset.index)].color = e.target.value;
            updatePreview();
        });
    });

    container.querySelectorAll('.position-input').forEach(input => {
        input.addEventListener('input', (e) => {
            colorStops[parseInt(e.target.dataset.index)].position = parseInt(e.target.value);
            updatePreview();
        });
    });

    container.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            colorStops.splice(parseInt(e.target.dataset.index), 1);
            renderColorStops();
            updatePreview();
        });
    });
}

function addColorStop() {
    const lastColor = colorStops[colorStops.length - 1];
    const newPosition = Math.min(100, lastColor.position + 25);
    colorStops.push({
        color: '#ffffff',
        position: newPosition
    });
    renderColorStops();
    updatePreview();
}

function generateCSS() {
    const sortedStops = [...colorStops].sort((a, b) => a.position - b.position);
    const colorStr = sortedStops.map(s => `${s.color} ${s.position}%`).join(', ');

    let gradient;
    if (gradientType === 'linear') {
        const dir = document.querySelectorAll('.dir-btn.active').length > 0 ? direction : `${angle}deg`;
        gradient = `linear-gradient(${dir}, ${colorStr})`;
    } else if (gradientType === 'radial') {
        const sizeStr = shape === 'circle' ? `${size}%` : `${size}% ${size}%`;
        gradient = `radial-gradient(${shape} ${sizeStr} at ${position}, ${colorStr})`;
    } else if (gradientType === 'repeating-linear') {
        const dir = document.querySelectorAll('.dir-btn.active').length > 0 ? direction : `${angle}deg`;
        gradient = `repeating-linear-gradient(${dir}, ${colorStr})`;
    } else if (gradientType === 'repeating-radial') {
        const sizeStr = shape === 'circle' ? `${size}%` : `${size}% ${size}%`;
        gradient = `repeating-radial-gradient(${shape} ${sizeStr} at ${position}, ${colorStr})`;
    }

    return gradient;
}

function updatePreview() {
    const preview = document.getElementById('preview');
    const cssCode = document.getElementById('cssCode');
    const gradient = generateCSS();

    preview.style.background = gradient;
    preview.style.width = document.getElementById('previewWidth').value + 'px';

    const fullCSS = `.your-element {
    background: ${gradient};
}`;
    cssCode.textContent = fullCSS;
}

function copyCode() {
    const gradient = generateCSS();
    const fullCSS = `background: ${gradient};`;
    
    navigator.clipboard.writeText(fullCSS).then(() => {
        const status = document.getElementById('copyStatus');
        status.textContent = '✓ 已复制！';
        status.classList.add('show');
        setTimeout(() => status.classList.remove('show'), 2000);
        showNotification('CSS代码已复制！');
    }).catch(() => {
        showNotification('复制失败，请手动复制');
    });
}

function applyPresetBackgrounds() {
    document.querySelectorAll('.preset').forEach(preset => {
        const colors = preset.dataset.colors.split(',');
        preset.style.background = `linear-gradient(135deg, ${colors.join(', ')})`;
    });
}

function showNotification(message) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.classList.remove('hidden');
    
    setTimeout(() => {
        notification.classList.add('hidden');
    }, 2000);
}

init();
