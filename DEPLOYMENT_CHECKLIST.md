# Контрольный список файлов для развертывания

## 📁 Обязательные файлы для Vercel развертывания

### 🎯 Критически важные файлы (должны быть в репозитории):

✅ **src/lib/local-storage.ts** - Утилиты localStorage
```bash
# Проверка наличия:
ls -la src/lib/local-storage.ts
```

✅ **src/components/ui/local-storage-indicator.tsx** - Индикатор хранилища
```bash
# Проверка наличия:
ls -la src/components/ui/local-storage-indicator.tsx
```

✅ **src/app/page.tsx** - Основная страница с SSR-защитой
```bash
# Проверка наличия:
ls -la src/app/page.tsx
```

✅ **vercel.json** - Конфигурация Vercel
```bash
# Проверка наличия:
ls -la vercel.json
```

### 📋 Полный список файлов проекта:

#### Конфигурация:
- `package.json` - Зависимости проекта
- `next.config.ts` - Конфигурация Next.js
- `tailwind.config.ts` - Конфигурация Tailwind
- `tsconfig.json` - Конфигурация TypeScript
- `vercel.json` - Конфигурация Vercel

#### Основной код:
- `src/app/page.tsx` - Главная страница
- `src/app/layout.tsx` - Layout приложения
- `src/app/globals.css` - Глобальные стили

#### Библиотеки:
- `src/lib/local-storage.ts` - **ВАЖНО: localStorage утилиты**
- `src/lib/utils.ts` - Общие утилиты
- `src/lib/db.ts` - База данных
- `src/lib/data-manager.ts` - Управление данными
- `src/lib/socket.ts` - WebSocket

#### Компоненты:
- `src/components/ui/local-storage-indicator.tsx` - **ВАЖНО: Индикатор хранилища**
- `src/components/views/` - Все view компоненты
- `src/components/ui/` - Все UI компоненты

#### Хуки:
- `src/hooks/useTasks.ts` - Управление задачами
- `src/hooks/useIdeas.ts` - Управление идеями
- `src/hooks/use-*.ts` - Остальные хуки

#### API:
- `src/app/api/tasks/route.ts` - API для задач
- `src/app/api/ideas/route.ts` - API для идей
- `src/app/api/auth/route.ts` - API авторизации
- `src/app/api/health/route.ts` - API проверки состояния

#### Типы:
- `src/types/index.ts` - TypeScript типы

#### Публичные файлы:
- `public/` - Все статические файлы
- `public/icons/` - Иконки приложения
- `public/manifest.json` - PWA манифест

## 🔍 Проверка перед коммитом

### 1. Проверить наличие всех файлов:
```bash
# Основные файлы
find src -name "*.ts" -o -name "*.tsx" | head -20

# Конфигурационные файлы
ls -la *.json *.ts *.js *.mjs

# Публичные файлы
ls -la public/
```

### 2. Проверить содержимое критически важных файлов:
```bash
# Проверить local-storage.ts
head -10 src/lib/local-storage.ts

# Проверить LocalStorageIndicator
head -10 src/components/ui/local-storage-indicator.tsx

# Проверить импорты в page.tsx
grep "local-storage" src/app/page.tsx
```

### 3. Проверить сборку:
```bash
npm run build
```

### 4. Проверить Git статус:
```bash
git status
git add .
git status
```

## 🚨 Частые проблемы

### Файл не добавляется в Git:
```bash
# Проверить .gitignore
cat .gitignore

# Принудительно добавить файл
git add -f src/lib/local-storage.ts
git add -f src/components/ui/local-storage-indicator.tsx
```

### Права доступа:
```bash
# Проверить права
ls -la src/lib/local-storage.ts

# Исправить права если нужно
chmod 644 src/lib/local-storage.ts
```

### Кэш сборки:
```bash
# Очистить кэш Next.js
rm -rf .next

# Очистить node_modules если нужно
rm -rf node_modules package-lock.json
npm install
```

## ✅ Финальная проверка

Перед тем как делать push в GitHub:

1. ✅ Все файлы добавлены в Git: `git status`
2. ✅ Сборка проходит успешно: `npm run build` 
3. ✅ Локально приложение работает: `npm run dev`
4. ✅ Критически важные файлы на месте:
   - `src/lib/local-storage.ts`
   - `src/components/ui/local-storage-indicator.tsx`
   - `src/app/page.tsx`
   - `vercel.json`

## 📝 Коммит для развертывания

```bash
git add .
git commit -m "fix: add missing local-storage utilities for Vercel deployment

- Added src/lib/local-storage.ts with localStorage utilities
- Added src/components/ui/local-storage-indicator.tsx component  
- Fixed SSR compatibility issues
- Added vercel.json configuration
- All build errors resolved"
git push origin main
```

После этого Vercel автоматически соберет и развернет приложение!