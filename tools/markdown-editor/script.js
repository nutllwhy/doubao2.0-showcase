// 公众号排版器
const STORAGE_KEY = 'wechat-editor-content';

let editor = null;
let preview = null;
let currentTemplate = 'tech';

// 模板样式配置
const templateStyles = {
    tech: {
        bg: '#ffffff',
        text: '#333333',
        primary: '#1890ff',
        codeBg: '#f5f7fa',
        quoteBg: '#e6f7ff',
        quoteBorder: '#1890ff'
    },
    minimal: {
        bg: '#ffffff',
        text: '#333333',
        primary: '#333333',
        codeBg: '#f8f8f8',
        quoteBg: '#f5f5f5',
        quoteBorder: '#999999'
    },
    warm: {
        bg: '#fffbf5',
        text: '#4a4a4a',
        primary: '#ff6b35',
        codeBg: '#fff5e6',
        quoteBg: '#fff0e6',
        quoteBorder: '#ff6b35'
    },
    dark: {
        bg: '#1a1a2e',
        text: '#eaeaea',
        primary: '#00ff88',
        codeBg: '#16213e',
        quoteBg: '#0f3460',
        quoteBorder: '#00ff88'
    },
    fresh: {
        bg: '#f0fdf4',
        text: '#166534',
        primary: '#22c55e',
        codeBg: '#dcfce7',
        quoteBg: '#d1fae5',
        quoteBorder: '#22c55e'
    },
    magazine: {
        bg: '#fafaf9',
        text: '#292524',
        primary: '#ea580c',
        codeBg: '#f5f5f4',
        quoteBg: '#fef3c7',
        quoteBorder: '#ea580c'
    },
    academic: {
        bg: '#f8fafc',
        text: '#1e293b',
        primary: '#4f46e5',
        codeBg: '#f1f5f9',
        quoteBg: '#e0e7ff',
        quoteBorder: '#4f46e5'
    },
    notebook: {
        bg: '#fefce8',
        text: '#713f12',
        primary: '#eab308',
        codeBg: '#fef9c3',
        quoteBg: '#fef08a',
        quoteBorder: '#eab308'
    }
};

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
    currentTemplate = template;
    preview.className = 'wechat-preview template-' + template;
    updatePreview();
}

function updatePreview() {
    const html = marked.parse(editor.value || '');
    const styles = templateStyles[currentTemplate];
    
    // 把样式应用到内联样式，确保复制到公众号时能保留
    const styledHtml = applyInlineStyles(html, styles);
    
    // 用表格包裹，表格背景色在公众号更稳定
    preview.innerHTML = `
        <table style="width: 100%; border-collapse: collapse; margin: 0; padding: 0;">
            <tr>
                <td style="background: ${styles.bg}; padding: 30px 20px;">
                    <div style="max-width: 680px; margin: 0 auto; color: ${styles.text}; font-size: 15px; line-height: 1.8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                        ${styledHtml}
                    </div>
                </td>
            </tr>
        </table>
    `;
}

function applyInlineStyles(html, styles) {
    let result = html;
    
    // h1
    result = result.replace(/<h1>/g, '<h1 style="font-size: 28px; font-weight: bold; margin: 30px 0 20px 0; padding-bottom: 15px; border-bottom: 3px solid ' + styles.primary + '; color: ' + styles.primary + ';">');
    
    // h2
    result = result.replace(/<h2>/g, '<h2 style="font-size: 22px; font-weight: bold; margin: 25px 0 15px 0; padding-left: 12px; border-left: 4px solid ' + styles.primary + '; color: ' + styles.text + ';">');
    
    // h3
    result = result.replace(/<h3>/g, '<h3 style="font-size: 18px; font-weight: bold; margin: 20px 0 10px 0; color: ' + styles.text + ';">');
    
    // p
    result = result.replace(/<p>/g, '<p style="margin: 15px 0; text-align: justify; color: ' + styles.text + ';">');
    
    // strong/b
    result = result.replace(/<strong>/g, '<strong style="font-weight: bold; color: ' + styles.primary + ';">');
    result = result.replace(/<b>/g, '<b style="font-weight: bold; color: ' + styles.primary + ';">');
    
    // a
    result = result.replace(/<a /g, '<a style="color: ' + styles.primary + '; text-decoration: underline;" ');
    
    // blockquote
    result = result.replace(/<blockquote>/g, '<blockquote style="margin: 20px 0; padding: 15px 20px; background: ' + styles.quoteBg + '; border-left: 4px solid ' + styles.quoteBorder + '; color: ' + styles.text + '; font-style: italic;">');
    
    // code (inline)
    result = result.replace(/<code>/g, '<code style="background: ' + styles.codeBg + '; padding: 2px 6px; border-radius: 4px; font-family: Monaco, Menlo, monospace; font-size: 14px; color: ' + styles.primary + ';">');
    
    // pre/code (code block)
    result = result.replace(/<pre>/g, '<pre style="margin: 20px 0; padding: 15px 20px; background: ' + styles.codeBg + '; border-radius: 8px; overflow-x: auto;">');
    result = result.replace(/<pre><code/g, '<pre><code style="background: transparent; padding: 0; color: ' + styles.text + '; font-size: 14px; line-height: 1.6;"');
    
    // hr
    result = result.replace(/<hr>/g, '<hr style="border: none; border-top: 2px solid ' + styles.primary + '; margin: 30px 0; opacity: 0.3;">');
    
    // th
    result = result.replace(/<th>/g, '<th style="border: 1px solid ' + styles.quoteBorder + '; padding: 10px 15px; text-align: left; background: ' + styles.quoteBg + '; font-weight: bold; color: ' + styles.primary + ';">');
    
    // ul
    result = result.replace(/<ul>/g, '<ul style="margin: 15px 0; padding-left: 30px; color: ' + styles.text + ';">');
    
    // ol
    result = result.replace(/<ol>/g, '<ol style="margin: 15px 0; padding-left: 30px; color: ' + styles.text + ';">');
    
    // li
    result = result.replace(/<li>/g, '<li style="margin: 8px 0; color: ' + styles.text + ';">');
    
    // td
    result = result.replace(/<td>/g, '<td style="border: 1px solid ' + styles.quoteBorder + '; padding: 10px 15px; text-align: left; color: ' + styles.text + ';">');
    
    return result;
}

function copyToWechat() {
    if (!editor.value.trim()) {
        alert('请先输入内容');
        return;
    }

    // 创建一个临时div，把preview的内容复制过去
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = preview.innerHTML;
    
    // 添加到body但隐藏
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    document.body.appendChild(tempDiv);

    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(tempDiv);
    selection.removeAllRanges();
    selection.addRange(range);

    try {
        document.execCommand('copy');
        showCopyStatus();
    } catch (err) {
        alert('复制失败，请手动选择并复制');
    }

    selection.removeAllRanges();
    document.body.removeChild(tempDiv);
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
