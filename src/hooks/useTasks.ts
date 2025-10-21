import { useState, useEffect } from 'react'
import { Task } from '@/types'
import { localStorageUtils, STORAGE_KEYS } from '@/lib/local-storage'

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Загрузка задач из localStorage при монтировании
  useEffect(() => {
    loadTasks()
  }, [])

  // Загрузка задач из localStorage
  const loadTasks = () => {
    try {
      setLoading(true)
      const savedTasks = localStorageUtils.get<Task[]>(STORAGE_KEYS.TASKS)
      setTasks(savedTasks || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }

  // Сохранение задач в localStorage
  const saveTasks = (updatedTasks: Task[]) => {
    try {
      const success = localStorageUtils.set(STORAGE_KEYS.TASKS, updatedTasks)
      if (!success) {
        throw new Error('Failed to save tasks to localStorage')
      }
    } catch (err) {
      console.error('Error saving tasks:', err)
      setError(err instanceof Error ? err.message : 'Failed to save tasks')
    }
  }

  // Создание новой задачи
  const createTask = async (
    content: string, 
    dueDate: string, 
    category = "general", 
    priority = "medium", 
    color = "#3B82F6",
    comment?: string,
    endDate?: string
  ): Promise<boolean> => {
    try {
      const newTask: Task = {
        id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        content,
        comment: comment || null,
        dueDate,
        endDate: endDate || null,
        isCompleted: false,
        category,
        priority,
        color,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      const updatedTasks = [...tasks, newTask]
      setTasks(updatedTasks)
      saveTasks(updatedTasks)
      
      return true
    } catch (err) {
      console.error('Error creating task:', err)
      setError(err instanceof Error ? err.message : 'Failed to create task')
      return false
    }
  }

  // Обновление задачи
  const updateTask = async (id: string, updates: Partial<Task>): Promise<boolean> => {
    try {
      const updatedTasks = tasks.map(task => 
        task.id === id 
          ? { 
              ...task, 
              ...updates, 
              updatedAt: new Date().toISOString() 
            }
          : task
      )
      
      setTasks(updatedTasks)
      saveTasks(updatedTasks)
      
      return true
    } catch (err) {
      console.error('Error updating task:', err)
      setError(err instanceof Error ? err.message : 'Failed to update task')
      return false
    }
  }

  // Удаление задачи
  const deleteTask = async (id: string): Promise<boolean> => {
    try {
      const updatedTasks = tasks.filter(task => task.id !== id)
      setTasks(updatedTasks)
      saveTasks(updatedTasks)
      
      return true
    } catch (err) {
      console.error('Error deleting task:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete task')
      return false
    }
  }

  // Получение задач по дате
  const getTasksByDate = (date: string): Task[] => {
    return tasks.filter(task => {
      const taskStart = new Date(task.dueDate)
      const taskEnd = task.endDate ? new Date(task.endDate) : taskStart
      const checkDate = new Date(date)
      
      return checkDate >= taskStart && checkDate <= taskEnd
    })
  }

  // Получение задач по диапазону дат
  const getTasksByDateRange = (startDate: string, endDate: string): Task[] => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    return tasks.filter(task => {
      const taskStart = new Date(task.dueDate)
      const taskEnd = task.endDate ? new Date(task.endDate) : taskStart
      
      return taskStart <= end && taskEnd >= start
    })
  }

  // Переключение статуса выполнения задачи
  const toggleTask = async (id: string, isCompleted: boolean): Promise<boolean> => {
    return updateTask(id, { isCompleted })
  }

  // Очистка всех задач
  const clearAllTasks = (): boolean => {
    try {
      setTasks([])
      localStorageUtils.remove(STORAGE_KEYS.TASKS)
      return true
    } catch (err) {
      console.error('Error clearing tasks:', err)
      return false
    }
  }

  return {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    toggleTask,
    getTasksByDate,
    getTasksByDateRange,
    clearAllTasks,
    refetch: loadTasks
  }
}