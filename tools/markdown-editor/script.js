// 公众号排版器
const STORAGE_KEY = 'wechat-editor-content';

let editor = null;
let preview = null;
let currentTemplate = 'tech';

const insertTemplates = {
    h2: '## 二级标题\n\n',
    h3: '### 三级标题\n\n',
    quote: '> 这是一段引用文字\n\n',
    code: '```\n在这里写代码\n```\n\n',
    list: '- 列表项1\n- 列表项2\n- 列表项3\n\n'
};

const exampleTemplate = `# 公众号排版示例

欢迎使用公众号排版器！

## 为什么选择这个工具？

这是一个专为公众号设计的排版工具，支持多种样式模板。

### 主要特点

- 🎨 **多种样式模板** - 科技风、简约风、温暖风、暗黑风
- 📝 **Markdown编辑** - 简单易用的Markdown语法
- 📋 **一键复制** - 直接复制到公众号
- 👁️ **实时预览** - 所见即所得

## 常用语法演示

### 文本样式

**粗体文字**，*斜体文字*

### 列表

无序列表：
- 项目一
- 项目二
- 项目三

有序列表：
1. 第一项
2. 第二项
3. 第三项

### 引用

> 这是一段引用文字
> 
> 可以有多行

### 代码

行内代码：\`console.log('Hello World')\`

代码块：

\`\`\`javascript
function greet(name) {
    return \`Hello, \${name}!\`;
}

console.log(greet('公众号'));
\`\`\`

### 表格

| 功能 | 描述 |
|------|------|
| 多模板 | 4种精美样式 |
| 实时预览 | 所见即所得 |
| 一键复制 | 直接粘贴公众号 |

---

## 开始使用

在左侧编辑Markdown内容，右侧实时预览公众号效果！选择喜欢的样式模板，编辑完成后点击"复制到公众号"，然后在公众号编辑器中粘贴即可！
`;

function init() {
    editor = document.getElementById('editor');
    preview = document.getElementById('preview');

    marked.setOptions({
        breaks: true,
        gfm: true
    });

    loadContent();
    bindEvents();
    applyTemplate(currentTemplate);
    updatePreview();
}

function bindEvents() {
    editor.addEventListener('input', () => {
        updatePreview();
        scheduleSave();
    });

    document.querySelectorAll('.template-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.template-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentTemplate = btn.dataset.template;
            applyTemplate(currentTemplate);
        });
    });

    document.querySelectorAll('.toolbar-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.dataset.insert) {
                insertText(insertTemplates[btn.dataset.insert]);
            }
        });
    });

    document.getElementById('loadTemplateBtn').addEventListener('click', loadTemplate);
    document.getElementById('clearBtn').addEventListener('click', clearEditor);
    document.getElementById('copyWechatBtn').addEventListener('click', copyToWechat);
}

function insertText(text) {
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    editor.value = editor.value.substring(0, start) + text + editor.value.substring(end);
    editor.focus();
    editor.setSelectionRange(start + text.length, start + text.length);
    updatePreview();
    scheduleSave();
}

function loadTemplate() {
    if (editor.value && !confirm('加载示例会覆盖当前内容，确定吗？')) {
        return;
    }
    editor.value = exampleTemplate;
    updatePreview();
    scheduleSave();
    showCopyStatus();
}

function clearEditor() {
    if (editor.value && !confirm('确定要清空编辑器吗？')) {
        return;
    }
    editor.value = '';
    updatePreview();
    scheduleSave();
}

function applyTemplate(template) {
    preview.className = 'wechat-preview template-' + template;
}

function updatePreview() {
    const html = marked.parse(editor.value || '');
    preview.innerHTML = '<div class="wechat-content">' + html + '</div>';
}

function copyToWechat() {
    const content = preview.querySelector('.wechat-content');
    if (!content) {
        alert('请先输入内容');
        return;
    }

    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(content);
    selection.removeAllRanges();
    selection.addRange(range);

    try {
        document.execCommand('copy');
        showCopyStatus();
    } catch (err) {
        alert('复制失败，请手动选择并复制');
    }

    selection.removeAllRanges();
}

function showCopyStatus() {
    const status = document.getElementById('copyStatus');
    status.classList.remove('hidden');
    setTimeout(() => {
        status.classList.add('hidden');
    }, 2000);
}

let saveTimeout = null;

function scheduleSave() {
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(saveContent, 500);
}

function saveContent() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
        content: editor.value,
        template: currentTemplate
    }));
}

function loadContent() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const data = JSON.parse(saved);
            editor.value = data.content || '';
            if (data.template) {
                currentTemplate = data.template;
                document.querySelectorAll('.template-btn').forEach(btn => {
                    btn.classList.remove('active');
                    if (btn.dataset.template === currentTemplate) {
                        btn.classList.add('active');
                    }
                });
            }
        }
    } catch (e) {
        console.log('No saved content found');
    }
}

init();
