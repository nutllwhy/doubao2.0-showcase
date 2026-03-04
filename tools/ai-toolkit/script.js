// AI博主工具箱
const STORAGE_KEY = 'ai-toolkit-settings';

let settings = {
    provider: 'openai',
    baseUrl: 'https://api.openai.com/v1',
    apiKey: '',
    model: 'gpt-4o'
};

const providerPresets = {
    openai: {
        baseUrl: 'https://api.openai.com/v1',
        model: 'gpt-4o'
    },
    anthropic: {
        baseUrl: 'https://api.anthropic.com/v1',
        model: 'claude-3-5-sonnet-20241022'
    },
    doubao: {
        baseUrl: 'https://ark.cn-beijing.volces.com/api/v3',
        model: 'doubao-pro-32k'
    },
    qwen: {
        baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
        model: 'qwen-plus'
    },
    custom: {
        baseUrl: '',
        model: ''
    }
};

const toolConfigs = {
    'video-script': {
        title: '🎬 视频脚本生成器',
        inputs: [
            { id: 'topic', label: '视频主题', type: 'textarea', placeholder: '请输入视频主题，例如：AI视频生成工具介绍' },
            { id: 'duration', label: '视频时长', type: 'select', options: ['1分钟', '3分钟', '5分钟', '10分钟'] },
            { id: 'style', label: '视频风格', type: 'select', options: ['科技干货', '轻松科普', '产品测评', '教程教学'] }
        ],
        prompt: (data) => `请帮我生成一个关于"${data.topic}"的${data.duration}视频脚本，风格是${data.style}。

请提供以下内容：
1. 视频标题（3个备选）
2. 分镜脚本，包含：
   - 序号
   - 画面描述
   - 台词/口播文案
   - 建议时长
3. 开头要在3秒内抓住观众注意力
4. 结尾要有引导关注/点赞的话术

请用Markdown格式输出，确保结构清晰。`
    },
    'title-generator': {
        title: '📝 爆款标题生成器',
        inputs: [
            { id: 'topic', label: '文章/视频主题', type: 'textarea', placeholder: '请输入主题，例如：AI视频生成工具测评' },
            { id: 'platform', label: '发布平台', type: 'select', options: ['公众号', 'B站', '抖音', '小红书', '知乎'] }
        ],
        prompt: (data) => `请为"${data.topic}"这个主题生成10个吸引人的${data.platform}标题。

要求：
1. 标题要吸引眼球，有点击欲望
2. 包含数字、悬念、痛点或利益点
3. 符合${data.platform}平台的风格
4. 每个标题不超过30字

请用Markdown列表输出，每个标题前面加上 emoji。`
    },
    'copy-polisher': {
        title: '✨ 文案润色器',
        inputs: [
            { id: 'content', label: '原始文案', type: 'textarea', placeholder: '请粘贴你想润色的文案...' },
            { id: 'goal', label: '润色目标', type: 'select', options: ['更吸引人', '更简洁', '更专业', '更口语化', '更有感染力'] },
            { id: 'platform', label: '发布平台', type: 'select', options: ['公众号', 'B站', '抖音', '小红书', '知乎'] }
        ],
        prompt: (data) => `请帮我润色以下文案，目标是${data.goal}，发布在${data.platform}平台。

原始文案：
${data.content}

请提供：
1. 润色后的文案
2. 润色说明（解释做了哪些改动以及为什么）

请用Markdown格式输出。`
    },
    'cover-prompt': {
        title: '🎨 封面提示词生成器',
        inputs: [
            { id: 'topic', label: '视频/文章主题', type: 'textarea', placeholder: '请输入主题，例如：AI视频生成工具介绍' },
            { id: 'style', label: '画面风格', type: 'select', options: ['科技感', '扁平化', '手绘插画', '3D渲染', '简约设计', '赛博朋克'] },
            { id: 'tool', label: 'AI绘图工具', type: 'select', options: ['Midjourney', 'Stable Diffusion', 'DALL-E', '通用'] }
        ],
        prompt: (data) => `请为"${data.topic}"这个主题生成一个封面图的AI提示词，风格是${data.style}，用于${data.tool}。

请提供：
1. 详细的英文提示词（适合${data.tool}）
2. 中文解释说明
3. 3个不同风格的变体提示词

提示词应该包含：主体、风格、光影、构图、色彩等要素。`
    },
    'outline-to-speech': {
        title: '🎤 大纲转演讲稿',
        inputs: [
            { id: 'outline', label: '文章/视频大纲', type: 'textarea', placeholder: '请粘贴你的大纲，用Markdown格式...' },
            { id: 'style', label: '演讲风格', type: 'select', options: ['亲切自然', '专业严谨', '激情澎湃', '幽默风趣'] },
            { id: 'duration', label: '预计时长', type: 'select', options: ['5分钟', '10分钟', '20分钟', '30分钟'] }
        ],
        prompt: (data) => `请把以下大纲转成一份${data.style}风格的演讲稿/口播稿，预计时长${data.duration}。

大纲：
${data.outline}

要求：
1. 口语化表达，适合口头讲述
2. 有开场和结尾
3. 适当加入语气词和互动感
4. 控制在${data.duration}左右的篇幅

请用Markdown格式输出。`
    }
};

function init() {
    loadSettings();
    bindEvents();
    checkFirstTime();
}

function loadSettings() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            settings = JSON.parse(saved);
        }
    } catch (e) {
        console.log('No settings found');
    }
}

function saveSettings() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

function checkFirstTime() {
    if (!settings.apiKey) {
        document.getElementById('welcomeBanner').classList.remove('hidden');
    }
}

function bindEvents() {
    document.getElementById('settingsBtn').addEventListener('click', openSettings);
    document.getElementById('closeSettingsBtn').addEventListener('click', closeSettings);
    document.getElementById('saveSettingsBtn').addEventListener('click', saveSettingsAndClose);
    document.getElementById('resetSettingsBtn').addEventListener('click', resetSettings);
    document.getElementById('welcomeConfigBtn').addEventListener('click', openSettings);
    document.getElementById('testApiBtn').addEventListener('click', testAPI);

    document.getElementById('providerSelect').addEventListener('change', (e) => {
        const preset = providerPresets[e.target.value];
        if (preset) {
            document.getElementById('baseUrlInput').value = preset.baseUrl;
            document.getElementById('modelInput').value = preset.model;
        }
    });

    document.getElementById('backBtn').addEventListener('click', goBack);

    document.querySelectorAll('.tool-card').forEach(card => {
        card.addEventListener('click', () => openTool(card.dataset.tool));
    });
}

function openSettings() {
    document.getElementById('welcomeBanner').classList.add('hidden');
    
    document.getElementById('providerSelect').value = settings.provider;
    document.getElementById('baseUrlInput').value = settings.baseUrl;
    document.getElementById('apiKeyInput').value = settings.apiKey;
    document.getElementById('modelInput').value = settings.model;
    
    document.getElementById('settingsModal').classList.remove('hidden');
}

function closeSettings() {
    document.getElementById('settingsModal').classList.add('hidden');
}

function saveSettingsAndClose() {
    settings.provider = document.getElementById('providerSelect').value;
    settings.baseUrl = document.getElementById('baseUrlInput').value.trim();
    settings.apiKey = document.getElementById('apiKeyInput').value.trim();
    settings.model = document.getElementById('modelInput').value.trim();
    
    if (!settings.apiKey) {
        alert('请输入API Key');
        return;
    }
    if (!settings.model) {
        alert('请输入模型名称');
        return;
    }
    
    saveSettings();
    closeSettings();
}

function resetSettings() {
    if (!confirm('确定要重置所有设置吗？')) return;
    
    settings = {
        provider: 'openai',
        baseUrl: 'https://api.openai.com/v1',
        apiKey: '',
        model: 'gpt-4o'
    };
    saveSettings();
    closeSettings();
}

async function testAPI() {
    const tempProvider = document.getElementById('providerSelect').value;
    const tempBaseUrl = document.getElementById('baseUrlInput').value.trim();
    const tempApiKey = document.getElementById('apiKeyInput').value.trim();
    const tempModel = document.getElementById('modelInput').value.trim();
    
    if (!tempApiKey) {
        alert('请输入API Key');
        return;
    }
    if (!tempModel) {
        alert('请输入模型名称');
        return;
    }
    if (!tempBaseUrl) {
        alert('请输入API Base URL');
        return;
    }
    
    showLoading('正在测试API...');
    
    try {
        const url = tempBaseUrl.endsWith('/') 
            ? tempBaseUrl + 'chat/completions' 
            : tempBaseUrl + '/chat/completions';
        
        let headers, body;
        
        if (tempProvider === 'anthropic') {
            const msgUrl = tempBaseUrl.endsWith('/') 
                ? tempBaseUrl + 'messages' 
                : tempBaseUrl + '/messages';
            
            headers = {
                'Content-Type': 'application/json',
                'x-api-key': tempApiKey,
                'anthropic-version': '2023-06-01'
            };
            
            body = JSON.stringify({
                model: tempModel,
                max_tokens: 100,
                messages: [
                    { role: 'user', content: '你好，请回复"API测试成功"' }
                ]
            });
            
            const response = await fetch(msgUrl, {
                method: 'POST',
                headers,
                body
            });
            
            if (!response.ok) {
                const error = await response.text();
                throw new Error(`API测试失败：${response.status} - ${error}`);
            }
            
            const data = await response.json();
            hideLoading();
            alert('✅ API测试成功！\n\n模型返回：' + data.content[0].text);
        } else {
            headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${tempApiKey}`
            };
            
            body = JSON.stringify({
                model: tempModel,
                messages: [
                    { role: 'user', content: '你好，请回复"API测试成功"' }
                ],
                max_tokens: 50
            });
            
            const response = await fetch(url, {
                method: 'POST',
                headers,
                body
            });
            
            if (!response.ok) {
                const error = await response.text();
                throw new Error(`API测试失败：${response.status} - ${error}`);
            }
            
            const data = await response.json();
            hideLoading();
            alert('✅ API测试成功！\n\n模型返回：' + data.choices[0].message.content);
        }
    } catch (err) {
        hideLoading();
        console.error('API Test Error:', err);
        alert('❌ API测试失败：\n\n' + err.message + '\n\n请检查：\n1. API Base URL是否正确\n2. API Key是否正确\n3. 模型名称是否正确\n4. 网络连接是否正常');
    }
}

function openTool(toolId) {
    if (!settings.apiKey) {
        alert('请先配置API Key');
        openSettings();
        return;
    }
    
    const config = toolConfigs[toolId];
    document.getElementById('panelTitle').textContent = config.title;
    
    let html = '<div class="tool-form">';
    config.inputs.forEach(input => {
        html += '<div class="form-group">';
        html += `<label>${input.label}</label>`;
        
        if (input.type === 'textarea') {
            html += `<textarea id="input-${input.id}" class="textarea" placeholder="${input.placeholder}"></textarea>`;
        } else if (input.type === 'select') {
            html += `<select id="input-${input.id}" class="select">`;
            input.options.forEach(opt => {
                html += `<option value="${opt}">${opt}</option>`;
            });
            html += '</select>';
        }
        
        html += '</div>';
    });
    
    html += '<div style="margin-top: 30px;">';
    html += '<button id="generateBtn" class="primary-btn large" style="width: 100%;">🚀 开始生成</button>';
    html += '</div>';
    html += '</div>';
    
    html += '<div id="outputSection" class="hidden">';
    html += '<div class="output-box">';
    html += '<div class="output-header">';
    html += '<h4>✨ 生成结果</h4>';
    html += '<button id="copyOutputBtn" class="copy-btn">📋 复制全部</button>';
    html += '</div>';
    html += '<div id="outputContent" class="output-content"></div>';
    html += '</div>';
    html += '</div>';
    
    document.getElementById('panelContent').innerHTML = html;
    
    document.getElementById('generateBtn').addEventListener('click', () => generateContent(toolId));
    
    document.getElementById('toolsGrid').classList.add('hidden');
    document.getElementById('toolPanel').classList.remove('hidden');
}

function goBack() {
    document.getElementById('toolPanel').classList.add('hidden');
    document.getElementById('toolsGrid').classList.remove('hidden');
}

async function generateContent(toolId) {
    const config = toolConfigs[toolId];
    const inputData = {};
    
    config.inputs.forEach(input => {
        inputData[input.id] = document.getElementById(`input-${input.id}`).value.trim();
    });
    
    const hasEmpty = config.inputs.some(input => !inputData[input.id]);
    if (hasEmpty) {
        alert('请填写所有字段');
        return;
    }
    
    const prompt = config.prompt(inputData);
    
    showLoading('正在生成中...');
    
    try {
        const result = await callAPI(prompt);
        document.getElementById('outputContent').textContent = result;
        document.getElementById('outputSection').classList.remove('hidden');
        
        document.getElementById('copyOutputBtn').onclick = () => {
            copyToClipboard(result);
        };
    } catch (err) {
        console.error('API Error:', err);
        alert('生成失败：\n\n' + err.message + '\n\n请检查：\n1. API Base URL是否正确\n2. API Key是否正确\n3. 模型名称是否正确');
    } finally {
        hideLoading();
    }
}

async function callAPI(prompt) {
    let url, headers, body;
    
    if (settings.provider === 'doubao') {
        url = settings.baseUrl.endsWith('/') 
            ? settings.baseUrl + 'chat/completions' 
            : settings.baseUrl + '/chat/completions';
        
        headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${settings.apiKey}`
        };
        
        body = JSON.stringify({
            model: settings.model,
            messages: [
                {
                    role: 'system',
                    content: '你是一个专业的AI内容助手，帮助博主创作优质内容。请用Markdown格式输出。'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.7
        });
    } else if (settings.provider === 'anthropic') {
        url = settings.baseUrl.endsWith('/') 
            ? settings.baseUrl + 'messages' 
            : settings.baseUrl + '/messages';
        
        headers = {
            'Content-Type': 'application/json',
            'x-api-key': settings.apiKey,
            'anthropic-version': '2023-06-01'
        };
        
        body = JSON.stringify({
            model: settings.model,
            max_tokens: 4096,
            system: '你是一个专业的AI内容助手，帮助博主创作优质内容。请用Markdown格式输出。',
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.7
        });
    } else {
        url = settings.baseUrl.endsWith('/') 
            ? settings.baseUrl + 'chat/completions' 
            : settings.baseUrl + '/chat/completions';
        
        headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${settings.apiKey}`
        };
        
        body = JSON.stringify({
            model: settings.model,
            messages: [
                {
                    role: 'system',
                    content: '你是一个专业的AI内容助手，帮助博主创作优质内容。请用Markdown格式输出。'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.7
        });
    }
    
    const response = await fetch(url, {
        method: 'POST',
        headers,
        body
    });
    
    if (!response.ok) {
        const error = await response.text();
        throw new Error(`API请求失败：${response.status} - ${error}`);
    }
    
    const data = await response.json();
    
    if (settings.provider === 'anthropic') {
        return data.content[0].text;
    } else {
        return data.choices[0].message.content;
    }
}

function showLoading(text) {
    document.getElementById('loadingText').textContent = text;
    document.getElementById('loadingOverlay').classList.remove('hidden');
}

function hideLoading() {
    document.getElementById('loadingOverlay').classList.add('hidden');
}

function copyToClipboard(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    
    try {
        document.execCommand('copy');
        alert('已复制到剪贴板！');
    } catch (err) {
        alert('复制失败，请手动复制');
    }
    
    document.body.removeChild(textarea);
}

init();
