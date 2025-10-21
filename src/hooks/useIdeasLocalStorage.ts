import { useState, useEffect } from 'react'
import { Idea } from '@/types'
import { localStorageUtils, STORAGE_KEYS } from '@/lib/local-storage'

export function useIdeasLocalStorage() {
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Загрузка идей из localStorage при монтировании
  useEffect(() => {
    loadIdeas()
  }, [])

  // Загрузка идей из localStorage
  const loadIdeas = () => {
    try {
      setLoading(true)
      const savedIdeas = localStorageUtils.get<Idea[]>(STORAGE_KEYS.IDEAS)
      setIdeas(savedIdeas || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load ideas')
    } finally {
      setLoading(false)
    }
  }

  // Сохранение идей в localStorage
  const saveIdeas = (updatedIdeas: Idea[]) => {
    try {
      const success = localStorageUtils.set(STORAGE_KEYS.IDEAS, updatedIdeas)
      if (!success) {
        throw new Error('Failed to save ideas to localStorage')
      }
    } catch (err) {
      console.error('Error saving ideas:', err)
      setError(err instanceof Error ? err.message : 'Failed to save ideas')
    }
  }

  // Создание новой идеи
  const createIdea = async (
    title: string,
    content: string,
    category = "general",
    priority = "medium",
    color = "#F59E0B",
    tags: string[] = []
  ): Promise<boolean> => {
    try {
      const newIdea: Idea = {
        id: `idea_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: title || "Без названия",
        content,
        category,
        priority,
        color,
        tags: JSON.stringify(tags),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      const updatedIdeas = [...ideas, newIdea]
      setIdeas(updatedIdeas)
      saveIdeas(updatedIdeas)
      
      return true
    } catch (err) {
      console.error('Error creating idea:', err)
      setError(err instanceof Error ? err.message : 'Failed to create idea')
      return false
    }
  }

  // Обновление идеи
  const updateIdea = async (id: string, updates: Partial<Idea>): Promise<boolean> => {
    try {
      const updatedIdeas = ideas.map(idea => 
        idea.id === id 
          ? { 
              ...idea, 
              ...updates, 
              updatedAt: new Date().toISOString() 
            }
          : idea
      )
      
      setIdeas(updatedIdeas)
      saveIdeas(updatedIdeas)
      
      return true
    } catch (err) {
      console.error('Error updating idea:', err)
      setError(err instanceof Error ? err.message : 'Failed to update idea')
      return false
    }
  }

  // Удаление идеи
  const deleteIdea = async (id: string): Promise<boolean> => {
    try {
      const updatedIdeas = ideas.filter(idea => idea.id !== id)
      setIdeas(updatedIdeas)
      saveIdeas(updatedIdeas)
      
      return true
    } catch (err) {
      console.error('Error deleting idea:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete idea')
      return false
    }
  }

  // Получение идей по категории
  const getIdeasByCategory = (category: string): Idea[] => {
    return ideas.filter(idea => idea.category === category)
  }

  // Получение идей по приоритету
  const getIdeasByPriority = (priority: string): Idea[] => {
    return ideas.filter(idea => idea.priority === priority)
  }

  // Поиск идей по тексту
  const searchIdeas = (query: string): Idea[] => {
    const lowercaseQuery = query.toLowerCase()
    return ideas.filter(idea => 
      idea.title.toLowerCase().includes(lowercaseQuery) ||
      idea.content.toLowerCase().includes(lowercaseQuery)
    )
  }

  // Получение тегов из идеи
  const getIdeaTags = (idea: Idea): string[] => {
    try {
      return JSON.parse(idea.tags || '[]')
    } catch {
      return []
    }
  }

  // Очистка всех идей
  const clearAllIdeas = (): boolean => {
    try {
      setIdeas([])
      localStorageUtils.remove(STORAGE_KEYS.IDEAS)
      return true
    } catch (err) {
      console.error('Error clearing ideas:', err)
      return false
    }
  }

  return {
    ideas,
    loading,
    error,
    createIdea,
    updateIdea,
    deleteIdea,
    getIdeasByCategory,
    getIdeasByPriority,
    searchIdeas,
    getIdeaTags,
    clearAllIdeas,
    refetch: loadIdeas
  }
}