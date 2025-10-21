'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Calendar, Eye, EyeOff } from 'lucide-react'
import { LocalStorageIndicator } from '@/components/ui/local-storage-indicator'

export default function WithIndicatorHome() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loginError, setLoginError] = useState(false)
  const [mounted, setMounted] = useState(false)

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

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold">My Weekly Planner</CardTitle>
            <p className="text-gray-600">
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold">My Weekly Planner</h1>
          <LocalStorageIndicator />
        </div>
      </div>
      
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>Добро пожаловать!</CardTitle>
          </CardHeader>
          <CardContent>
            <p>LocalStorageIndicator работает корректно.</p>
            <Button className="mt-4" onClick={() => setIsAuthenticated(false)}>
              Выйти
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}