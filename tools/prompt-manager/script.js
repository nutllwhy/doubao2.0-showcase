// AI提示词管理器
const STORAGE_KEY = 'ai-prompt-manager';

let categories = [];
let prompts = [];
let currentCategory = 'all';
let editingCategoryId = null;
let editingPromptId = null;
let viewingPromptId = null;

const defaultCategories = [
    { id: 'writing', name: '写作', icon: '✍️' },
    { id: 'video', name: '视频', icon: '🎬' },
    { id: 'image', name: '绘图', icon: '🎨' },
    { id: 'coding', name: '编程', icon: '💻' }
];

const defaultPrompts = [
    {
        id: '1',
        title: '公众号文章大纲',
        category: 'writing',
        content: `请帮我写一篇关于[主题]的公众号文章大纲，要求：
1. 引人入胜的标题
2. 清晰的逻辑结构
3. 有深度的内容
4. 适合公众号读者阅读

请提供：
- 主标题（3个备选）
- 文章大纲（5-7个部分）
- 每个部分的核心观点`
    },
    {
        id: '2',
        title: '视频脚本生成',
        category: 'video',
        content: `请帮我生成一个关于[主题]的短视频脚本，时长约[时长]。

要求：
1. 开头3秒抓住注意力
2. 内容紧凑有节奏
3. 结尾有引导关注

请提供：
- 画面描述
- 台词文案
- 时长标注`
    },
    {
        id: '3',
        title: 'AI绘图提示词',
        category: 'image',
        content: `请生成一幅[描述]的图片。

风格要求：[风格，如：动漫风格、写实风格、赛博朋克等]
画面内容：[详细描述]
色彩：[色调，如：暖色调、冷色调等]
光影：[光影效果]
构图：[构图方式]

请用英文提供Midjourney/Stable Diffusion格式的提示词。`
    },
    {
        id: '4',
        title: '代码解释器',
        category: 'coding',
        content: `请帮我解释以下代码，并提供优化建议：

\`\`\`
[在此粘贴代码]
\`\`\`

请提供：
1. 代码功能解释
2. 关键逻辑分析
3. 潜在问题指出
4. 优化建议（代码+解释）`
    }
];

function init() {
    loadData();
    bindEvents();
    renderCategories();
    renderPrompts();
}

function loadData() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const data = JSON.parse(saved);
            categories = data.categories || defaultCategories;
            prompts = data.prompts || defaultPrompts;
        } else {
            categories = defaultCategories;
            prompts = defaultPrompts;
            saveData();
        }
    } catch (e) {
        categories = defaultCategories;
        prompts = defaultPrompts;
    }
}

function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
        categories,
        prompts
    }));
}

function bindEvents() {
    document.getElementById('addCategoryBtn').addEventListener('click', () => openCategoryModal());
    document.getElementById('cancelCategoryBtn').addEventListener('click', closeCategoryModal);
    document.getElementById('saveCategoryBtn').addEventListener('click', saveCategory);

    document.getElementById('addPromptBtn').addEventListener('click', () => openPromptModal());
    document.getElementById('cancelPromptBtn').addEventListener('click', closePromptModal);
    document.getElementById('savePromptBtn').addEventListener('click', savePrompt);

    document.getElementById('editPromptBtn').addEventListener('click', () => {
        closeViewPromptModal();
        openPromptModal(viewingPromptId);
    });
    document.getElementById('copyPromptBtn').addEventListener('click', copyViewingPrompt);
    document.getElementById('closeViewBtn').addEventListener('click', closeViewPromptModal);
    document.getElementById('deletePromptBtn').addEventListener('click', deleteViewingPrompt);
}

function renderCategories() {
    const list = document.getElementById('categoryList');
    list.innerHTML = `
        <div class="category-item ${currentCategory === 'all' ? 'active' : ''}" data-id="all">
            <span>📋</span>
            <span>全部</span>
            <span style="margin-left: auto; opacity: 0.7;">${prompts.length}</span>
        </div>
        ${categories.map(cat => `
            <div class="category-item ${currentCategory === cat.id ? 'active' : ''}" data-id="${cat.id}">
                <span>${cat.icon}</span>
                <span>${cat.name}</span>
                <span style="margin-left: auto; opacity: 0.7;">${prompts.filter(p => p.category === cat.id).length}</span>
            </div>
        `).join('')}
    `;

    list.querySelectorAll('.category-item').forEach(item => {
        item.addEventListener('click', () => {
            currentCategory = item.dataset.id;
            renderCategories();
            renderPrompts();
        });
    });
}

function renderPrompts() {
    const list = document.getElementById('promptList');
    const title = document.getElementById('currentCategoryTitle');
    
    const filteredPrompts = currentCategory === 'all' 
        ? prompts 
        : prompts.filter(p => p.category === currentCategory);
    
    const cat = categories.find(c => c.id === currentCategory);
    title.textContent = currentCategory === 'all' ? '📝 全部提示词' : `${cat ? cat.icon : '📝'} ${cat ? cat.name : ''}`;

    if (filteredPrompts.length === 0) {
        list.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: #999;">
                <div style="font-size: 4rem; margin-bottom: 20px;">📭</div>
                <p>暂无提示词，点击"新建提示词"添加</p>
            </div>
        `;
        return;
    }

    list.innerHTML = filteredPrompts.map(prompt => {
        const cat = categories.find(c => c.id === prompt.category);
        return `
            <div class="prompt-card" data-id="${prompt.id}">
                <div class="prompt-card-header">
                    <h3 class="prompt-card-title">${escapeHtml(prompt.title)}</h3>
                    <span class="prompt-card-category">${cat ? cat.icon + ' ' + cat.name : ''}</span>
                </div>
                <div class="prompt-card-preview">${escapeHtml(prompt.content.substring(0, 100))}...</div>
            </div>
        `;
    }).join('');

    list.querySelectorAll('.prompt-card').forEach(card => {
        card.addEventListener('click', () => openViewPromptModal(card.dataset.id));
    });
}

function openCategoryModal(id = null) {
    editingCategoryId = id;
    const modal = document.getElementById('categoryModal');
    const title = document.getElementById('categoryModalTitle');
    const nameInput = document.getElementById('categoryNameInput');
    const iconInput = document.getElementById('categoryIconInput');

    if (id) {
        const cat = categories.find(c => c.id === id);
        title.textContent = '编辑分类';
        nameInput.value = cat.name;
        iconInput.value = cat.icon;
    } else {
        title.textContent = '新建分类';
        nameInput.value = '';
        iconInput.value = '📁';
    }

    modal.classList.remove('hidden');
    nameInput.focus();
}

function closeCategoryModal() {
    document.getElementById('categoryModal').classList.add('hidden');
    editingCategoryId = null;
}

function saveCategory() {
    const name = document.getElementById('categoryNameInput').value.trim();
    const icon = document.getElementById('categoryIconInput').value.trim() || '📁';

    if (!name) {
        alert('请输入分类名称');
        return;
    }

    if (editingCategoryId) {
        const idx = categories.findIndex(c => c.id === editingCategoryId);
        if (idx !== -1) {
            categories[idx].name = name;
            categories[idx].icon = icon;
        }
    } else {
        categories.push({
            id: 'cat_' + Date.now(),
            name,
            icon
        });
    }

    saveData();
    renderCategories();
    renderPrompts();
    closeCategoryModal();
}

function openPromptModal(id = null) {
    editingPromptId = id;
    const modal = document.getElementById('promptModal');
    const title = document.getElementById('promptModalTitle');
    const titleInput = document.getElementById('promptTitleInput');
    const categorySelect = document.getElementById('promptCategorySelect');
    const contentInput = document.getElementById('promptContentInput');

    categorySelect.innerHTML = categories.map(cat => 
        `<option value="${cat.id}">${cat.icon} ${cat.name}</option>`
    ).join('');

    if (id) {
        const prompt = prompts.find(p => p.id === id);
        title.textContent = '编辑提示词';
        titleInput.value = prompt.title;
        categorySelect.value = prompt.category;
        contentInput.value = prompt.content;
    } else {
        title.textContent = '新建提示词';
        titleInput.value = '';
        categorySelect.value = currentCategory !== 'all' ? currentCategory : categories[0].id;
        contentInput.value = '';
    }

    modal.classList.remove('hidden');
    titleInput.focus();
}

function closePromptModal() {
    document.getElementById('promptModal').classList.add('hidden');
    editingPromptId = null;
}

function savePrompt() {
    const title = document.getElementById('promptTitleInput').value.trim();
    const category = document.getElementById('promptCategorySelect').value;
    const content = document.getElementById('promptContentInput').value.trim();

    if (!title) {
        alert('请输入提示词标题');
        return;
    }
    if (!content) {
        alert('请输入提示词内容');
        return;
    }

    if (editingPromptId) {
        const idx = prompts.findIndex(p => p.id === editingPromptId);
        if (idx !== -1) {
            prompts[idx].title = title;
            prompts[idx].category = category;
            prompts[idx].content = content;
        }
    } else {
        prompts.unshift({
            id: 'prompt_' + Date.now(),
            title,
            category,
            content
        });
    }

    saveData();
    renderCategories();
    renderPrompts();
    closePromptModal();
}

function openViewPromptModal(id) {
    viewingPromptId = id;
    const prompt = prompts.find(p => p.id === id);
    const cat = categories.find(c => c.id === prompt.category);
    
    document.getElementById('viewPromptTitle').textContent = `${cat ? cat.icon : ''} ${escapeHtml(prompt.title)}`;
    document.getElementById('viewPromptContent').textContent = prompt.content;
    
    document.getElementById('viewPromptModal').classList.remove('hidden');
}

function closeViewPromptModal() {
    document.getElementById('viewPromptModal').classList.add('hidden');
    viewingPromptId = null;
}

function copyViewingPrompt() {
    const prompt = prompts.find(p => p.id === viewingPromptId);
    copyToClipboard(prompt.content);
}

function deleteViewingPrompt() {
    if (!confirm('确定要删除这个提示词吗？')) return;
    
    prompts = prompts.filter(p => p.id !== viewingPromptId);
    saveData();
    renderCategories();
    renderPrompts();
    closeViewPromptModal();
}

function copyToClipboard(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    
    try {
        document.execCommand('copy');
        showCopyStatus();
    } catch (err) {
        alert('复制失败，请手动复制');
    }
    
    document.body.removeChild(textarea);
}

function showCopyStatus() {
    const status = document.getElementById('copyStatus');
    status.classList.remove('hidden');
    setTimeout(() => {
        status.classList.add('hidden');
    }, 2000);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

init();
