'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Settings, Moon, Sun, LogOut, User, Database, Palette, Info } from 'lucide-react'
import { useTheme } from 'next-themes'
import { DataManager } from '@/components/ui/data-manager'

interface SettingsViewProps {
  onLogout: () => void
}

export function SettingsView({ onLogout }: SettingsViewProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDarkMode = theme === 'dark'

  const toggleTheme = () => {
    setTheme(isDarkMode ? 'light' : 'dark')
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Settings className="w-6 h-6 text-gray-600 dark:text-gray-400" />
        <div>
          <h1 className="text-2xl font-bold">Настройки</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Управление приложением, данными и профилем
          </p>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Общие
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center gap-2">
            <Database className="w-4 h-4" />
            Данные
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Внешний вид
          </TabsTrigger>
          <TabsTrigger value="about" className="flex items-center gap-2">
            <Info className="w-4 h-4" />
            О приложении
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          {/* Profile Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Профиль
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <div className="font-medium">Имя пользователя</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Локальный пользователь</div>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  localhost
                </div>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Вы используете локальный режим. Данные хранятся только в этом браузере.
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Быстрые действия</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  onClick={onLogout}
                  className="flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Выйти из приложения
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => window.location.reload()}
                  className="flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  Перезагрузить приложение
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Management */}
        <TabsContent value="data">
          <DataManager />
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                Тема оформления
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Темная тема</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Переключите между светлой и темной темой оформления
                  </div>
                </div>
                <Switch
                  checked={isDarkMode}
                  onCheckedChange={toggleTheme}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div 
                  className={`
                    p-4 rounded-lg border-2 cursor-pointer transition-all
                    ${!isDarkMode 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }
                  `}
                  onClick={() => setTheme('light')}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Sun className="w-4 h-4" />
                    <span className="font-medium">Светлая</span>
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Классический светлый интерфейс
                  </div>
                </div>
                
                <div 
                  className={`
                    p-4 rounded-lg border-2 cursor-pointer transition-all
                    ${isDarkMode 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }
                  `}
                  onClick={() => setTheme('dark')}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Moon className="w-4 h-4" />
                    <span className="font-medium">Темная</span>
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Комфортный темный интерфейс
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* About */}
        <TabsContent value="about" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>О приложении</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Версия</span>
                <span>1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Название</span>
                <span>My Weekly Planner</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Технологии</span>
                <span>Next.js 15, TypeScript, Tailwind CSS</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Хранилище</span>
                <span>LocalStorage (локальное)</span>
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Settings className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                    Советы по использованию
                  </h4>
                  <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                    <li>• Используйте клавишу Enter для быстрого добавления задач</li>
                    <li>• Кликните по задаче, чтобы отредактировать ее текст</li>
                    <li>• В месячном виде кликните на день, чтобы увидеть задачи</li>
                    <li>• Переключайте темы для комфортной работы в любое время суток</li>
                    <li>• Делайте резервные копии данных регулярно</li>
                    <li>• Используйте экспорт/импорт для переноса данных между браузерами</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <Card>
            <CardHeader>
              <CardTitle>Возможности приложения</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h5 className="font-medium mb-2">📅 Планирование</h5>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Ежедневные задачи</li>
                    <li>• Недельный вид</li>
                    <li>• Месячный календарь</li>
                    <li>• Многодневные задачи</li>
                  </ul>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h5 className="font-medium mb-2">💡 Идеи</h5>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Категоризация</li>
                    <li>• Приоритеты</li>
                    <li>• Цветовые метки</li>
                    <li>• Теги</li>
                  </ul>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h5 className="font-medium mb-2">🎨 Кастомизация</h5>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Светлая/темная тема</li>
                    <li>• Цветовые категории</li>
                    <li>• Приоритеты</li>
                    <li>• Комментарии</li>
                  </ul>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h5 className="font-medium mb-2">💾 Данные</h5>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Локальное хранилище</li>
                    <li>• Экспорт в JSON</li>
                    <li>• Импорт данных</li>
                    <li>• Резервные копии</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}