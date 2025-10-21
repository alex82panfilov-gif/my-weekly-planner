import { Task, Idea } from '@/types'
import { localStorageUtils, STORAGE_KEYS } from './local-storage'

// Интерфейс для структуры экспортируемых данных
export interface ExportData {
  version: string
  exportDate: string
  tasks: Task[]
  ideas: Idea[]
  metadata: {
    totalTasks: number
    totalIdeas: number
    completedTasks: number
    categories: string[]
    priorities: string[]
  }
}

// Функция для экспорта всех данных
export function exportAllData(): ExportData {
  const tasks = localStorageUtils.get<Task[]>(STORAGE_KEYS.TASKS) || []
  const ideas = localStorageUtils.get<Idea[]>(STORAGE_KEYS.IDEAS) || []
  
  const categories = [...new Set([
    ...tasks.map(t => t.category),
    ...ideas.map(i => i.category)
  ])].filter(Boolean)
  
  const priorities = [...new Set([
    ...tasks.map(t => t.priority),
    ...ideas.map(i => i.priority)
  ])].filter(Boolean)
  
  const completedTasks = tasks.filter(t => t.isCompleted).length

  return {
    version: '1.0.0',
    exportDate: new Date().toISOString(),
    tasks,
    ideas,
    metadata: {
      totalTasks: tasks.length,
      totalIdeas: ideas.length,
      completedTasks,
      categories,
      priorities
    }
  }
}

// Функция для экспорта только задач
export function exportTasks(): Task[] {
  return localStorageUtils.get<Task[]>(STORAGE_KEYS.TASKS) || []
}

// Функция для экспорта только идей
export function exportIdeas(): Idea[] {
  return localStorageUtils.get<Idea[]>(STORAGE_KEYS.IDEAS) || []
}

// Функция для валидации данных
export function validateImportData(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!data || typeof data !== 'object') {
    errors.push('Неверный формат данных')
    return { isValid: false, errors }
  }
  
  // Проверка задач
  if (data.tasks && Array.isArray(data.tasks)) {
    data.tasks.forEach((task: any, index: number) => {
      if (!task.id || typeof task.id !== 'string') {
        errors.push(`Задача ${index + 1}: отсутствует или неверный ID`)
      }
      if (!task.content || typeof task.content !== 'string') {
        errors.push(`Задача ${index + 1}: отсутствует или неверное содержание`)
      }
      if (!task.dueDate || typeof task.dueDate !== 'string') {
        errors.push(`Задача ${index + 1}: отсутствует или неверная дата`)
      }
    })
  }
  
  // Проверка идей
  if (data.ideas && Array.isArray(data.ideas)) {
    data.ideas.forEach((idea: any, index: number) => {
      if (!idea.id || typeof idea.id !== 'string') {
        errors.push(`Идея ${index + 1}: отсутствует или неверный ID`)
      }
      if (!idea.title || typeof idea.title !== 'string') {
        errors.push(`Идея ${index + 1}: отсутствует или неверное название`)
      }
    })
  }
  
  return { isValid: errors.length === 0, errors }
}

// Функция для импорта всех данных
export function importAllData(data: ExportData, options: {
  mergeWithExisting?: boolean
  clearBeforeImport?: boolean
} = {}): { success: boolean; errors: string[]; imported: { tasks: number; ideas: number } } {
  const { mergeWithExisting = false, clearBeforeImport = false } = options
  const errors: string[] = []
  let importedTasks = 0
  let importedIdeas = 0
  
  try {
    // Валидация данных
    const validation = validateImportData(data)
    if (!validation.isValid) {
      return { 
        success: false, 
        errors: validation.errors, 
        imported: { tasks: 0, ideas: 0 } 
      }
    }
    
    // Получаем существующие данные если нужно
    const existingTasks = clearBeforeImport ? [] : (localStorageUtils.get<Task[]>(STORAGE_KEYS.TASKS) || [])
    const existingIdeas = clearBeforeImport ? [] : (localStorageUtils.get<Idea[]>(STORAGE_KEYS.IDEAS) || [])
    
    // Обработка задач
    let finalTasks: Task[] = []
    if (data.tasks && Array.isArray(data.tasks)) {
      if (mergeWithExisting) {
        // Объединяем с существующими, избегая дубликатов по ID
        const existingIds = new Set(existingTasks.map(t => t.id))
        const newTasks = data.tasks.filter((task: Task) => !existingIds.has(task.id))
        finalTasks = [...existingTasks, ...newTasks]
      } else {
        // Заменяем существующие
        finalTasks = data.tasks
      }
      importedTasks = finalTasks.length
    }
    
    // Обработка идей
    let finalIdeas: Idea[] = []
    if (data.ideas && Array.isArray(data.ideas)) {
      if (mergeWithExisting) {
        // Объединяем с существующими, избегая дубликатов по ID
        const existingIds = new Set(existingIdeas.map(i => i.id))
        const newIdeas = data.ideas.filter((idea: Idea) => !existingIds.has(idea.id))
        finalIdeas = [...existingIdeas, ...newIdeas]
      } else {
        // Заменяем существующие
        finalIdeas = data.ideas
      }
      importedIdeas = finalIdeas.length
    }
    
    // Сохранение данных
    localStorageUtils.set(STORAGE_KEYS.TASKS, finalTasks)
    localStorageUtils.set(STORAGE_KEYS.IDEAS, finalIdeas)
    
    return { 
      success: true, 
      errors: [], 
      imported: { tasks: importedTasks, ideas: importedIdeas } 
    }
    
  } catch (error) {
    errors.push(`Ошибка при импорте: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`)
    return { 
      success: false, 
      errors, 
      imported: { tasks: importedTasks, ideas: importedIdeas } 
    }
  }
}

// Функция для импорта только задач
export function importTasks(tasks: Task[], options: {
  mergeWithExisting?: boolean
  clearBeforeImport?: boolean
} = {}): { success: boolean; errors: string[]; imported: number } {
  const { mergeWithExisting = false, clearBeforeImport = false } = options
  const errors: string[] = []
  
  try {
    // Валидация задач
    const validation = validateImportData({ tasks })
    if (!validation.isValid) {
      return { success: false, errors: validation.errors, imported: 0 }
    }
    
    // Получаем существующие задачи если нужно
    const existingTasks = clearBeforeImport ? [] : (localStorageUtils.get<Task[]>(STORAGE_KEYS.TASKS) || [])
    
    // Обработка задач
    let finalTasks: Task[] = []
    if (mergeWithExisting) {
      // Объединяем с существующими, избегая дубликатов по ID
      const existingIds = new Set(existingTasks.map(t => t.id))
      const newTasks = tasks.filter(task => !existingIds.has(task.id))
      finalTasks = [...existingTasks, ...newTasks]
    } else {
      // Заменяем существующие
      finalTasks = tasks
    }
    
    // Сохранение данных
    localStorageUtils.set(STORAGE_KEYS.TASKS, finalTasks)
    
    return { success: true, errors: [], imported: finalTasks.length }
    
  } catch (error) {
    errors.push(`Ошибка при импорте задач: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`)
    return { success: false, errors, imported: 0 }
  }
}

// Функция для импорта только идей
export function importIdeas(ideas: Idea[], options: {
  mergeWithExisting?: boolean
  clearBeforeImport?: boolean
} = {}): { success: boolean; errors: string[]; imported: number } {
  const { mergeWithExisting = false, clearBeforeImport = false } = options
  const errors: string[] = []
  
  try {
    // Валидация идей
    const validation = validateImportData({ ideas })
    if (!validation.isValid) {
      return { success: false, errors: validation.errors, imported: 0 }
    }
    
    // Получаем существующие идеи если нужно
    const existingIdeas = clearBeforeImport ? [] : (localStorageUtils.get<Idea[]>(STORAGE_KEYS.IDEAS) || [])
    
    // Обработка идей
    let finalIdeas: Idea[] = []
    if (mergeWithExisting) {
      // Объединяем с существующими, избегая дубликатов по ID
      const existingIds = new Set(existingIdeas.map(i => i.id))
      const newIdeas = ideas.filter(idea => !existingIds.has(idea.id))
      finalIdeas = [...existingIdeas, ...newIdeas]
    } else {
      // Заменяем существующие
      finalIdeas = ideas
    }
    
    // Сохранение данных
    localStorageUtils.set(STORAGE_KEYS.IDEAS, finalIdeas)
    
    return { success: true, errors: [], imported: finalIdeas.length }
    
  } catch (error) {
    errors.push(`Ошибка при импорте идей: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`)
    return { success: false, errors, imported: 0 }
  }
}

// Функция для очистки всех данных
export function clearAllData(): { success: boolean; errors: string[] } {
  const errors: string[] = []
  
  try {
    localStorageUtils.remove(STORAGE_KEYS.TASKS)
    localStorageUtils.remove(STORAGE_KEYS.IDEAS)
    return { success: true, errors: [] }
  } catch (error) {
    errors.push(`Ошибка при очистке данных: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`)
    return { success: false, errors }
  }
}

// Функция для получения статистики данных
export function getDataStats() {
  const tasks = localStorageUtils.get<Task[]>(STORAGE_KEYS.TASKS) || []
  const ideas = localStorageUtils.get<Idea[]>(STORAGE_KEYS.IDEAS) || []
  
  const completedTasks = tasks.filter(t => t.isCompleted).length
  const pendingTasks = tasks.filter(t => !t.isCompleted).length
  
  const categories = [...new Set([
    ...tasks.map(t => t.category),
    ...ideas.map(i => i.category)
  ])].filter(Boolean)
  
  const priorities = [...new Set([
    ...tasks.map(t => t.priority),
    ...ideas.map(i => i.priority)
  ])].filter(Boolean)
  
  // Расчет размера данных
  const tasksSize = JSON.stringify(tasks).length
  const ideasSize = JSON.stringify(ideas).length
  const totalSize = tasksSize + ideasSize
  
  return {
    tasks: {
      total: tasks.length,
      completed: completedTasks,
      pending: pendingTasks,
      size: tasksSize
    },
    ideas: {
      total: ideas.length,
      size: ideasSize
    },
    categories: categories.length,
    priorities: priorities.length,
    totalSize,
    formattedSize: formatBytes(totalSize)
  }
}

// Вспомогательная функция для форматирования байтов
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}