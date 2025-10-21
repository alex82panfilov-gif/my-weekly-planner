'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Calendar, Plus, Settings, LogOut, Lightbulb, Menu, X, Eye, EyeOff, Moon, Sun } from 'lucide-react'
import { LocalStorageIndicator } from '@/components/ui/local-storage-indicator'
import { useTheme } from 'next-themes'

type ViewType = 'today' | 'week' | 'month' | 'ideas' | 'settings'

export default function SafeHome() {
  const [currentView, setCurrentView] = useState<ViewType>('today')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loginError, setLoginError] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  const correctPassword = 'alex_planner'

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogin = () => {
    if (password === correctPassword) {
      setIsAuthenticated(true)
      setLoginError(false)
    } else {
      setLoginError(true)
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setPassword('')
    setLoginError(false)
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Загрузка...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold">My Weekly Planner</CardTitle>
            <p className="text-gray-600 dark:text-gray-400">
              Введите пароль для доступа к планировщику
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Введите пароль"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setLoginError(false)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleLogin()
                  }
                }}
                className={loginError ? "border-red-500" : ""}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {loginError && (
              <p className="text-red-500 text-sm">Неверный пароль</p>
            )}
            <Button 
              onClick={handleLogin}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white"
              size="lg"
            >
              Войти
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'today':
        return (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar className="w-6 h-6 text-blue-500" />
                <div>
                  <h1 className="text-2xl font-bold">Сегодня</h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    {new Date().toLocaleDateString('ru-RU', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Добавить задачу
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Активные задачи (0)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400 text-center py-8">
                  Нет задач на сегодня
                </p>
              </CardContent>
            </Card>
          </div>
        )
      case 'week':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Неделя</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Представление недели в разработке...</p>
            </CardContent>
          </Card>
        )
      case 'month':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Месяц</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Представление месяца в разработке...</p>
            </CardContent>
          </Card>
        )
      case 'ideas':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Идеи</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Раздел идей в разработке...</p>
            </CardContent>
          </Card>
        )
      case 'settings':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Настройки</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Настройки в разработке...</p>
              <Button className="mt-4" onClick={handleLogout}>
                Выйти
              </Button>
            </CardContent>
          </Card>
        )
      default:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Сегодня</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Выберите раздел...</p>
            </CardContent>
          </Card>
        )
    }
  }

  const navigationItems = [
    { id: 'today', label: 'Сегодня', icon: Calendar },
    { id: 'week', label: 'Неделя', icon: Calendar },
    { id: 'month', label: 'Месяц', icon: Calendar },
    { id: 'ideas', label: 'Идеи', icon: Lightbulb },
    { id: 'settings', label: 'Настройки', icon: Settings },
  ]

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
              </div>
              <h1 className="ml-3 text-xl font-semibold text-gray-900 dark:text-white">
                My Weekly Planner
              </h1>
              <div className="ml-4">
                <LocalStorageIndicator />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
              >
                {theme === 'dark' ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>
              
              {/* Mobile menu button */}
              <div className="md:hidden">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                  {isMobileMenuOpen ? (
                    <X className="w-5 h-5" />
                  ) : (
                    <Menu className="w-5 h-5" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar Navigation */}
        <nav className={`
          ${isMobileMenuOpen ? 'block' : 'hidden'} 
          md:block w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
        `}>
          <div className="p-4 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon
              return (
                <Button
                  key={item.id}
                  variant={currentView === item.id ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => {
                    setCurrentView(item.id as ViewType)
                    setIsMobileMenuOpen(false)
                  }}
                >
                  <Icon className="w-4 h-4 mr-3" />
                  {item.label}
                </Button>
              )
            })}
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6 lg:p-8">
            {renderCurrentView()}
          </div>
        </main>
      </div>
    </div>
  )
}