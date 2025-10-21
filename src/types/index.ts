export interface Task {
  id: string
  content: string
  comment?: string
  dueDate: string
  endDate?: string
  isCompleted: boolean
  category: 'work' | 'personal' | 'shopping' | 'health' | 'general'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  color: string
  createdAt: string
  updatedAt: string
}

export interface Idea {
  id: string
  title: string
  description?: string
  category: 'work' | 'personal' | 'shopping' | 'health' | 'general' | 'creative' | 'business' | 'learning'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  color: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface User {
  id: string
  googleId: string
  email: string
  name: string
  themePreference: 'light' | 'dark'
  createdAt: string
  updatedAt: string
}