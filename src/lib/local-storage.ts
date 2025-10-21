// Утилиты для работы с localStorage в браузере

export const STORAGE_KEYS = {
  TASKS: 'weekly-planner-tasks',
  IDEAS: 'weekly-planner-ideas',
  SETTINGS: 'weekly-planner-settings'
} as const

export const localStorageUtils = {
  // Получение данных из localStorage
  get<T>(key: string): T | null {
    if (typeof window === 'undefined') return null
    
    try {
      const item = window.localStorage.getItem(key)
      if (item === null) return null
      return JSON.parse(item) as T
    } catch (error) {
      console.error(`Error getting item from localStorage: ${key}`, error)
      return null
    }
  },

  // Сохранение данных в localStorage
  set<T>(key: string, value: T): boolean {
    if (typeof window === 'undefined') return false
    
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch (error) {
      console.error(`Error setting item in localStorage: ${key}`, error)
      return false
    }
  },

  // Удаление данных из localStorage
  remove(key: string): boolean {
    if (typeof window === 'undefined') return false
    
    try {
      window.localStorage.removeItem(key)
      return true
    } catch (error) {
      console.error(`Error removing item from localStorage: ${key}`, error)
      return false
    }
  },

  // Очистка всех данных
  clear(): boolean {
    if (typeof window === 'undefined') return false
    
    try {
      window.localStorage.clear()
      return true
    } catch (error) {
      console.error('Error clearing localStorage', error)
      return false
    }
  },

  // Проверка доступности localStorage
  isAvailable(): boolean {
    if (typeof window === 'undefined') return false
    
    try {
      const test = '__localStorage_test__'
      window.localStorage.setItem(test, test)
      window.localStorage.removeItem(test)
      return true
    } catch {
      return false
    }
  },

  // Получение размера хранилища в байтах
  getSize(): number {
    if (typeof window === 'undefined') return 0
    
    let total = 0
    for (const key in window.localStorage) {
      if (window.localStorage.hasOwnProperty(key)) {
        total += window.localStorage[key].length + key.length
      }
    }
    return total
  }
}
