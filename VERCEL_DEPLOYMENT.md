# Развертывание на Vercel через GitHub

Это руководство поможет вам развернуть приложение My Weekly Planner на Vercel с интеграцией GitHub.

## 🚀 Предварительные требования

1. **GitHub репозиторий** с кодом проекта
2. **Аккаунт Vercel** (можно войти через GitHub)
3. **Настроенный проект** с исправленными ошибками сборки

## 📋 Проверка готовности проекта

Перед развертыванием убедитесь, что:

✅ **Сборка проходит успешно**:
```bash
npm run build
```

✅ **Все файлы на месте**:
- `src/lib/local-storage.ts` - утилиты localStorage
- `src/components/ui/local-storage-indicator.tsx` - индикатор хранилища
- `src/app/page.tsx` - основной компонент с SSR-защитой

✅ **Конфигурация Next.js корректна**:
- `next.config.ts` не содержит конфликтующих настроек
- `package.json` содержит все необходимые зависимости

## 🔧 Настройка развертывания

### 1. Создание репозитория GitHub

Если еще не создан, инициализируйте Git и загрузите код:

```bash
git init
git add .
git commit -m "Initial commit: Weekly Planner ready for deployment"
git branch -M main
git remote add origin https://github.com/yourusername/weekly-planner.git
git push -u origin main
```

### 2. Подключение к Vercel

1. Перейдите на [vercel.com](https://vercel.com)
2. Войдите через свой GitHub аккаунт
3. Нажмите "New Project"
4. Выберите репозиторий `weekly-planner`
5. Нажмите "Import"

### 3. Конфигурация проекта в Vercel

#### Build Settings:
- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

#### Environment Variables (если нужны):
- `NODE_ENV`: `production`

#### Advanced Settings:
- **Node.js Version**: `18.x` или `20.x`
- **Build Output**: Default (для Next.js)

### 4. Развертывание

Нажмите "Deploy" и дождитесь завершения сборки.

## 🐛 Устранение常见 проблем

### Ошибка: "Module not found: Can't resolve './local-storage'"

**Причина**: Отсутствует файл `src/lib/local-storage.ts`

**Решение**: Убедитесь, что файл существует и содержит:
```typescript
export const localStorageUtils = {
  get: <T>(key: string): T | null => { /* ... */ },
  set: <T>(key: string, value: T): boolean => { /* ... */ },
  // другие методы
}
```

### Ошибка: "useSession is not defined"

**Причина**: Отсутствует импорт NextAuth

**Решение**: Удалите или закомментируйте использование `useSession` в `SettingsView.tsx`

### Ошибка: "Cannot access 'today' before initialization"

**Причина**: Использование переменной до объявления

**Решение**: Используйте `useState` с правильным порядком объявления

### Ошибка сборки с localStorage

**Причина**: localStorage недоступен на сервере

**Решение**: Добавьте проверку `mounted` состояния:
```typescript
const [mounted, setMounted] = useState(false)

useEffect(() => {
  setMounted(true)
}, [])

if (!mounted) {
  return <div>Loading...</div>
}
```

## 📝 Файл vercel.json (опционально)

Если нужна дополнительная конфигурация:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "regions": ["iad1"],
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

## 🔄 Автоматическое развертывание

После первоначальной настройки:

1. Каждый `push` в основную ветку автоматически запускает развертывание
2. Pull Request'ы создают preview-версии
3. Изменения в коде появляются на сайте через несколько минут

## 🌐 Домен и HTTPS

1. Vercel автоматически предоставляет домен вида `your-project.vercel.app`
2. Можно подключить собственный домен в настройках проекта
3. HTTPS включен по умолчанию

## 📊 Мониторинг

В панели Vercel доступны:
- Логи сборки и выполнения
- Метрики производительности
- Информация о посетителях
- История развертываний

## ✅ Проверка после развертывания

1. **Основная страница**: Убедитесь, что страница загружается
2. **Авторизация**: Проверьте вход с паролем `alex_planner`
3. **Функциональность**: Проверьте создание задач и идей
4. **Адаптивность**: Проверьте на мобильных устройствах
5. **API эндпоинты**: Убедитесь, что API работает корректно

## 🚨 Важные замечания

1. **localStorage работает только в браузере** - данные не сохраняются между сессиями на сервере
2. **База данных SQLite** не работает на Vercel - используйте внешнюю БД для продакшена
3. **Пароль авторизации** хранится в коде - для продакшена используйте переменные окружения

## 🔐 Безопасность в продакшене

Для реального развертывания рекомендуется:

1. Вынести пароль в переменные окружения:
   ```typescript
   const correctPassword = process.env.APP_PASSWORD || 'alex_planner'
   ```

2. Добавить дополнительные проверки безопасности
3. Настроить CORS для API
4. Использовать внешнюю базу данных

## 📞 Поддержка

Если возникнут проблемы:
1. Проверьте логи сборки в Vercel
2. Сравните с локальной версией
3. Проверьте переменные окружения
4. Обратитесь к документации Vercel и Next.js