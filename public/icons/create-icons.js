// Скрипт для создания иконок разных размеров
// В реальном проекте это бы делалось через ImageMagick или sharp

const fs = require('fs');
const path = require('path');

// Создаем простые placeholder иконки
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Поскольку у нас нет инструментов для обработки изображений,
// создаем HTML файл с инструкциями по созданию иконок
const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>PWA Icon Generator</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .icon-preview { 
            border: 1px solid #ccc; 
            margin: 10px; 
            display: inline-block;
            text-align: center;
        }
        .icon-box {
            width: 100px;
            height: 100px;
            background: #3b82f6;
            border-radius: 20px;
            margin: 10px auto;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <h1>PWA Icons for My Weekly Planner</h1>
    <p>Используйте icon-1024x1024.png как основу и создайте следующие размеры:</p>
    
    ${sizes.map(size => `
        <div class="icon-preview">
            <div class="icon-box" style="width: ${size/4}px; height: ${size/4}px; font-size: ${size/20}px;">
                P
            </div>
            <p>icon-${size}x${size}.png</p>
        </div>
    `).join('')}
    
    <h2>Инструкции:</h2>
    <ol>
        <li>Используйте icon-1024x1024.png как основу</li>
        <li>Создайте иконки размеров: ${sizes.join(', ')}px</li>
        <li>Сохраните их в папке /public/icons/</li>
        <li>Используйте инструменты вроде ImageMagick или онлайн-сервисы</li>
    </ol>
    
    <h2>Команды для ImageMagick:</h2>
    <pre>
${sizes.map(size => `convert icon-1024x1024.png -resize ${size}x${size} icon-${size}x${size}.png`).join('\n')}
    </pre>
</body>
</html>
`;

fs.writeFileSync(path.join(__dirname, 'icon-instructions.html'), htmlContent);
console.log('Создан файл icon-instructions.html с инструкциями');

// Создаем простые placeholder файлы
sizes.forEach(size => {
    const placeholder = `# Placeholder для icon-${size}x${size}.png
# Замените этот файл реальной иконкой
# Используйте icon-1024x1024.png как основу
`;
    fs.writeFileSync(path.join(__dirname, `icon-${size}x${size}.png.placeholder`), placeholder);
});

console.log('Созданы placeholder файлы для всех размеров иконок');