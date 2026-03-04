// Markdown实时预览编辑器
const STORAGE_KEY = 'markdown-editor-content';
const THEME_KEY = 'markdown-editor-theme';

let editor = null;
let preview = null;
let saveTimeout = null;
let isDarkTheme = false;

const exampleTemplate = `# Markdown 示例文档

欢迎使用 Markdown 实时预览编辑器！

## 基础语法

### 文本样式

**粗体文字**，*斜体文字*，~~删除线~~

### 列表

无序列表：
- 项目一
- 项目二
- 项目三

有序列表：
1. 第一项
2. 第二项
3. 第三项

### 链接和图片

[访问 GitHub](https://github.com)

![Markdown Logo](https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Markdown-mark.svg/208px-Markdown-mark.svg.png)

### 引用

> 这是一段引用文字
> 
> 可以有多行

### 代码

行内代码：\`console.log('Hello World')\`

代码块：

\`\`\`javascript
// JavaScript 示例
function greet(name) {
    return \`Hello, \${name}!\`;
}

console.log(greet('World'));
\`\`\`

\`\`\`python
# Python 示例
def greet(name):
    return f"Hello, {name}!"

print(greet("World"))
\`\`\`

### 表格

| 姓名 | 年龄 | 职业 |
|------|------|------|
| 张三 | 25 | 工程师 |
| 李四 | 30 | 设计师 |
| 王五 | 28 | 产品经理 |

### 分隔线

---

## 开始编辑

在左侧编辑器中修改内容，右侧会实时预览！
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
    loadTheme();
    bindEvents();
    updatePreview();
}

function bindEvents() {
    editor.addEventListener('input', () => {
        updatePreview();
        scheduleSave();
    });

    document.getElementById('loadTemplateBtn').addEventListener('click', loadTemplate);
    document.getElementById('clearBtn').addEventListener('click', clearEditor);
    document.getElementById('exportHtmlBtn').addEventListener('click', exportHtml);
    document.getElementById('exportPdfBtn').addEventListener('click', exportPdf);
    document.getElementById('toggleThemeBtn').addEventListener('click', toggleTheme);
}

function updatePreview() {
    const content = editor.value;
    preview.innerHTML = marked.parse(content);
    preview.querySelectorAll('pre code').forEach((block) => {
        Prism.highlightElement(block);
    });
}

function scheduleSave() {
    const saveStatus = document.getElementById('saveStatus');
    saveStatus.textContent = '保存中...';
    saveStatus.classList.add('saving');

    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
        saveContent();
        saveStatus.textContent = '已保存';
        saveStatus.classList.remove('saving');
    }, 500);
}

function saveContent() {
    localStorage.setItem(STORAGE_KEY, editor.value);
}

function loadContent() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        editor.value = saved;
    } else {
        editor.value = exampleTemplate;
    }
}

function loadTemplate() {
    if (editor.value && !confirm('加载示例会覆盖当前内容，确定吗？')) {
        return;
    }
    editor.value = exampleTemplate;
    updatePreview();
    scheduleSave();
    showNotification('示例模板已加载！');
}

function clearEditor() {
    if (editor.value && !confirm('确定要清空编辑器吗？')) {
        return;
    }
    editor.value = '';
    updatePreview();
    scheduleSave();
    showNotification('编辑器已清空！');
}

function exportHtml() {
    const htmlContent = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>导出的文档</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
            line-height: 1.8;
        }
        h1, h2, h3 { border-bottom: 1px solid #eee; padding-bottom: 0.3em; }
        code { background: #f4f4f4; padding: 0.2em 0.4em; border-radius: 3px; }
        pre { background: #2d2d2d; color: #ccc; padding: 1em; border-radius: 5px; overflow-x: auto; }
        blockquote { border-left: 4px solid #667eea; padding-left: 1em; color: #666; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px 12px; }
        th { background: #f4f4f4; }
        img { max-width: 100%; }
    </style>
</head>
<body>
${preview.innerHTML}
</body>
</html>`;

    downloadFile(htmlContent, 'document.html', 'text/html');
    showNotification('HTML已导出！');
}

async function exportPdf() {
    showNotification('正在生成PDF，请稍候...');
    
    try {
        const { jsPDF } = window.jspdf;
        const canvas = await html2canvas(preview, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff'
        });
        
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
            unit: 'mm',
            format: 'a4'
        });
        
        const imgWidth = pdf.internal.pageSize.getWidth();
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        pdf.save('document.pdf');
        showNotification('PDF已导出！');
    } catch (error) {
        console.error('PDF导出失败:', error);
        showNotification('PDF导出失败，尝试使用浏览器打印功能');
        window.print();
    }
}

function downloadFile(content, filename, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function loadTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme === 'dark') {
        isDarkTheme = true;
        document.body.classList.add('dark');
        updateThemeButton();
    }
}

function toggleTheme() {
    isDarkTheme = !isDarkTheme;
    document.body.classList.toggle('dark');
    localStorage.setItem(THEME_KEY, isDarkTheme ? 'dark' : 'light');
    updateThemeButton();
}

function updateThemeButton() {
    const btn = document.getElementById('toggleThemeBtn');
    btn.textContent = isDarkTheme ? '☀️ 切换主题' : '🌙 切换主题';
}

function showNotification(message) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.classList.remove('hidden');
    
    setTimeout(() => {
        notification.classList.add('hidden');
    }, 2500);
}

init();
