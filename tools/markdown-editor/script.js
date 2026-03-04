// 公众号排版器
const STORAGE_KEY = 'wechat-editor-content';
const THEME_KEY = 'wechat-editor-template';

let editor = null;
let preview = null;
let currentTemplate = 'tech';

const exampleTemplate = `# 公众号文章标题

这是一段公众号文章的开头内容，可以用来吸引读者的注意力。

## 二级标题

这里是二级标题的内容，你可以在这里详细阐述你的观点。

### 三级标题

更细分的内容可以使用三级标题。

## 列表示例

### 无序列表

- 这是第一个列表项
- 这是第二个列表项
- 这是第三个列表项

### 有序列表

1. 第一步
2. 第二步
3. 第三步

## 引用和强调

> 这是一段引用文字，可以用来强调重要的观点或者引用他人的话语。

**粗体文字**，*斜体文字*，~~删除线~~

## 代码展示

行内代码：\`console.log('Hello World')\`

代码块：

\`\`\`javascript
// JavaScript 示例
function greet(name) {
    return \`Hello, \${name}!\`;
}

console.log(greet('公众号'));
\`\`\`

## 表格

| 功能 | 描述 | 状态 |
|------|------|------|
| Markdown编辑 | 左侧编辑区域 | ✅ 完成 |
| 公众号预览 | 右侧实时预览 | ✅ 完成 |
| 样式模板 | 多种排版风格 | ✅ 完成 |
| 一键复制 | 复制到公众号 | ✅ 完成 |

---

## 总结

这就是公众号排版器的使用示例！选择不同的样式模板，编辑你的内容，然后点击"复制到公众号"按钮，就可以直接粘贴到微信公众号后台了！
`;

function init() {
    editor = document.getElementById('editor');
    preview = document.getElementById('preview');

    marked.setOptions({
        breaks: true,
        gfm: true,
        highlight: function(code, lang) {
            if (lang && Prism.languages[lang]) {
                return Prism.highlight(code, Prism.languages[lang], lang);
            }
            return code;
        }
    });

    loadContent();
    bindEvents();
    updatePreview();
}

function bindEvents() {
    editor.addEventListener('input', () => {
        updatePreview();
        scheduleSave();
    });

    document.querySelectorAll('.template-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            setTemplate(btn.dataset.template);
        });
    });

    document.querySelectorAll('.toolbar-btn').forEach(btn => {
        if (btn.dataset.insert) {
            btn.addEventListener('click', () => insertText(btn.dataset.insert));
        }
    });

    document.getElementById('loadTemplateBtn').addEventListener('click', loadTemplate);
    document.getElementById('clearBtn').addEventListener('click', clearEditor);
    document.getElementById('copyWechatBtn').addEventListener('click', copyToWechat);
}

function setTemplate(template) {
    currentTemplate = template;
    
    document.querySelectorAll('.template-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.template === template) {
            btn.classList.add('active');
        }
    });
    
    preview.className = 'wechat-preview template-' + template;
    updatePreview();
    
    localStorage.setItem(THEME_KEY, template);
}

function insertText(type) {
    const insertMap = {
        'h2': '## 二级标题\n\n',
        'h3': '### 三级标题\n\n',
        'quote': '> 引用文字\n\n',
        'code': '```\n代码内容\n```\n\n',
        'list': '- 列表项\n'
    };
    
    const text = insertMap[type] || '';
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    
    editor.value = editor.value.substring(0, start) + text + editor.value.substring(end);
    editor.focus();
    editor.setSelectionRange(start + text.length, start + text.length);
    
    updatePreview();
    scheduleSave();
}

function updatePreview() {
    const content = editor.value;
    const html = marked.parse(content);
    
    preview.innerHTML = '<div class="wechat-content">' + html + '</div>';
    
    preview.querySelectorAll('pre code').forEach(block => {
        Prism.highlightElement(block);
    });
}

function loadTemplate() {
    if (editor.value && !confirm('加载示例会覆盖当前内容，确定吗？')) {
        return;
    }
    editor.value = exampleTemplate;
    updatePreview();
    scheduleSave();
    showCopyStatus('示例模板已加载！');
}

function clearEditor() {
    if (editor.value && !confirm('确定要清空编辑器吗？')) {
        return;
    }
    editor.value = '';
    updatePreview();
    scheduleSave();
    showCopyStatus('编辑器已清空！');
}

function copyToWechat() {
    const contentDiv = preview.querySelector('.wechat-content');
    if (!contentDiv) {
        showCopyStatus('没有内容可复制！');
        return;
    }

    const tempDiv = contentDiv.cloneNode(true);
    
    tempDiv.querySelectorAll('pre code').forEach(code => {
        const pre = code.parentElement;
        const newPre = document.createElement('pre');
        newPre.style.cssText = window.getComputedStyle(pre).cssText;
        newPre.textContent = code.textContent;
        pre.parentNode.replaceChild(newPre, pre);
    });

    const style = getComputedStyle(preview);
    const bgColor = style.getPropertyValue('--wechat-bg') || '#ffffff';
    const textColor = style.getPropertyValue('--wechat-text') || '#333333';
    const primaryColor = style.getPropertyValue('--wechat-primary') || '#1890ff';

    tempDiv.style.backgroundColor = bgColor;
    tempDiv.style.color = textColor;
    tempDiv.querySelectorAll('h1, h2, h3, strong, b, a').forEach(el => {
        el.style.color = primaryColor;
    });

    const range = document.createRange();
    range.selectNode(tempDiv);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);

    try {
        document.execCommand('copy');
        showCopyStatus('✓ 已复制到剪贴板！请到公众号后台粘贴');
    } catch (err) {
        showCopyStatus('复制失败，请手动选择复制');
    }

    selection.removeAllRanges();
}

function showCopyStatus(message) {
    const status = document.getElementById('copyStatus');
    status.textContent = message;
    status.classList.remove('hidden');
    
    setTimeout(() => {
        status.classList.add('hidden');
    }, 2500);
}

function scheduleSave() {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
        saveContent();
    }, 1000);
}

function saveContent() {
    localStorage.setItem(STORAGE_KEY, editor.value);
}

function loadContent() {
    const saved = localStorage.getItem(STORAGE_KEY);
    const savedTemplate = localStorage.getItem(THEME_KEY);
    
    if (saved) {
        editor.value = saved;
    } else {
        editor.value = exampleTemplate;
    }
    
    if (savedTemplate) {
        setTemplate(savedTemplate);
    } else {
        setTemplate('tech');
    }
}

let saveTimeout = null;

init();
