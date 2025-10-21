'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Lightbulb, Plus, Search, Tag, Calendar, Trash2, Edit } from 'lucide-react'

interface Idea {
  id: string
  title: string
  description?: string
  category: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

const ideaCategories = [
  { value: 'personal', label: 'Личное', color: '#10B981' },
  { value: 'work', label: 'Работа', color: '#3B82F6' },
  { value: 'creative', label: 'Творчество', color: '#8B5CF6' },
  { value: 'business', label: 'Бизнес', color: '#F59E0B' },
  { value: 'learning', label: 'Обучение', color: '#EF4444' },
  { value: 'health', label: 'Здоровье', color: '#14B8A6' },
  { value: 'general', label: 'Общее', color: '#6B7280' }
]

export function IdeasViewFixed() {
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingIdea, setEditingIdea] = useState<Idea | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [mounted, setMounted] = useState(false)
  
  // Form states
  const [newIdeaTitle, setNewIdeaTitle] = useState('')
  const [newIdeaDescription, setNewIdeaDescription] = useState('')
  const [newIdeaCategory, setNewIdeaCategory] = useState('general')
  const [newIdeaTags, setNewIdeaTags] = useState('')

  useEffect(() => {
    setMounted(true)
    loadIdeas()
  }, [])

  const ensureTagsArray = (tags: any): string[] => {
    return Array.isArray(tags) ? tags : []
  }

  const loadIdeas = () => {
    try {
      const savedIdeas = localStorage.getItem('weekly-planner-ideas')
      if (savedIdeas) {
        const parsed = JSON.parse(savedIdeas)
        // Ensure all ideas have valid tags array
        const sanitizedIdeas = parsed.map((idea: any) => ({
          ...idea,
          tags: ensureTagsArray(idea.tags)
        }))
        setIdeas(sanitizedIdeas)
      }
    } catch (error) {
      console.error('Error loading ideas:', error)
    }
  }

  const saveIdeas = (updatedIdeas: Idea[]) => {
    try {
      localStorage.setItem('weekly-planner-ideas', JSON.stringify(updatedIdeas))
    } catch (error) {
      console.error('Error saving ideas:', error)
    }
  }

  const resetForm = () => {
    setNewIdeaTitle('')
    setNewIdeaDescription('')
    setNewIdeaCategory('general')
    setNewIdeaTags('')
  }

  const handleAddIdea = () => {
    if (!newIdeaTitle.trim()) return

    const tags = newIdeaTags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)

    const newIdea: Idea = {
      id: `idea_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: newIdeaTitle.trim(),
      description: newIdeaDescription.trim() || undefined,
      category: newIdeaCategory,
      tags,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const updatedIdeas = [newIdea, ...ideas]
    setIdeas(updatedIdeas)
    saveIdeas(updatedIdeas)
    
    resetForm()
    setShowAddDialog(false)
  }

  const handleEditIdea = () => {
    if (!editingIdea || !newIdeaTitle.trim()) return

    const tags = newIdeaTags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)

    const updatedIdeas = ideas.map(idea => 
      idea.id === editingIdea.id 
        ? { 
            ...idea, 
            title: newIdeaTitle.trim(),
            description: newIdeaDescription.trim() || undefined,
            category: newIdeaCategory,
            tags,
            updatedAt: new Date().toISOString()
          }
        : idea
    )

    setIdeas(updatedIdeas)
    saveIdeas(updatedIdeas)
    
    resetForm()
    setShowEditDialog(false)
    setEditingIdea(null)
  }

  const handleDeleteIdea = (id: string) => {
    if (confirm('Вы уверены, что хотите удалить эту идею?')) {
      const updatedIdeas = ideas.filter(idea => idea.id !== id)
      setIdeas(updatedIdeas)
      saveIdeas(updatedIdeas)
    }
  }

  const openEditDialog = (idea: Idea) => {
    setEditingIdea(idea)
    setNewIdeaTitle(idea.title)
    setNewIdeaDescription(idea.description || '')
    setNewIdeaCategory(idea.category)
    // Ensure tags is an array before joining
    const tagsArray = ensureTagsArray(idea.tags)
    setNewIdeaTags(tagsArray.join(', '))
    setShowEditDialog(true)
  }

  // Фильтрация идей
  const filteredIdeas = ideas.filter(idea => {
    const tagsArray = ensureTagsArray(idea.tags)
    const matchesSearch = idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (idea.description && idea.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         tagsArray.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'all' || idea.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  // Сортировка по дате (новые первые)
  const sortedIdeas = filteredIdeas.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  if (!mounted) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Lightbulb className="w-6 h-6 text-yellow-500" />
          <h1 className="text-2xl font-bold">Идеи</h1>
        </div>
        <div className="text-center py-8">
          <div className="text-gray-500">Загрузка...</div>
        </div>
      </div>
    )
  }

  const getCategoryInfo = (categoryValue: string) => {
    return ideaCategories.find(cat => cat.value === categoryValue) || ideaCategories[6]
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Lightbulb className="w-6 h-6 text-yellow-500" />
          <div>
            <h1 className="text-2xl font-bold">Идеи</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Сохраняйте свои идеи и вдохновение
            </p>
          </div>
        </div>
        
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Добавить идею
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Новая идея</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Название идеи</label>
                <Input
                  placeholder="Введите название идеи..."
                  value={newIdeaTitle}
                  onChange={(e) => setNewIdeaTitle(e.target.value)}
                  autoFocus
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Описание</label>
                <Textarea
                  placeholder="Подробное описание идеи (необязательно)..."
                  value={newIdeaDescription}
                  onChange={(e) => setNewIdeaDescription(e.target.value)}
                  rows={3}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Категория</label>
                <div className="grid grid-cols-2 gap-2">
                  {ideaCategories.map(category => (
                    <Button
                      key={category.value}
                      type="button"
                      variant={newIdeaCategory === category.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setNewIdeaCategory(category.value)}
                      className="justify-start"
                    >
                      <div 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: category.color }}
                      />
                      {category.label}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Теги</label>
                <Input
                  placeholder="Введите теги через запятую..."
                  value={newIdeaTags}
                  onChange={(e) => setNewIdeaTags(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2">
                <Button onClick={handleAddIdea} className="flex-1">
                  Добавить идею
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowAddDialog(false)
                    resetForm()
                  }}
                >
                  Отмена
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Поиск идей..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={selectedCategory === 'all' ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory('all')}
          >
            Все категории
          </Button>
          {ideaCategories.map(category => (
            <Button
              key={category.value}
              variant={selectedCategory === category.value ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.value)}
            >
              <div 
                className="w-3 h-3 rounded-full mr-1" 
                style={{ backgroundColor: category.color }}
              />
              {category.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Ideas Grid */}
      {sortedIdeas.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <Lightbulb className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              {searchTerm || selectedCategory !== 'all' ? 'Идеи не найдены' : 'У вас пока нет идей'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchTerm || selectedCategory !== 'all' 
                ? 'Попробуйте изменить параметры поиска или фильтры'
                : 'Начните добавлять идеи, чтобы не потерять важные мысли'
              }
            </p>
            {!searchTerm && selectedCategory === 'all' && (
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Добавить первую идею
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedIdeas.map(idea => {
            const categoryInfo = getCategoryInfo(idea.category)
            
            return (
              <Card 
                key={idea.id} 
                className="hover:shadow-md transition-all cursor-pointer group"
                style={{ 
                  borderTop: `4px solid ${categoryInfo.color}`
                }}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">
                        {idea.title}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge 
                          variant="secondary" 
                          style={{ 
                            backgroundColor: `${categoryInfo.color}20`,
                            color: categoryInfo.color
                          }}
                        >
                          {categoryInfo.label}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(idea)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteIdea(idea.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  {idea.description && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                      {idea.description}
                    </p>
                  )}
                  
                  {(() => {
                    const tagsArray = ensureTagsArray(idea.tags)
                    return tagsArray.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {tagsArray.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    )
                  })()}
                  
                  <div className="flex items-center text-xs text-gray-500">
                    <Calendar className="w-3 h-3 mr-1" />
                    {new Date(idea.createdAt).toLocaleDateString('ru-RU')}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать идею</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Название идеи</label>
              <Input
                placeholder="Введите название идеи..."
                value={newIdeaTitle}
                onChange={(e) => setNewIdeaTitle(e.target.value)}
                autoFocus
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Описание</label>
              <Textarea
                placeholder="Подробное описание идеи (необязательно)..."
                value={newIdeaDescription}
                onChange={(e) => setNewIdeaDescription(e.target.value)}
                rows={3}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Категория</label>
              <div className="grid grid-cols-2 gap-2">
                {ideaCategories.map(category => (
                  <Button
                    key={category.value}
                    type="button"
                    variant={newIdeaCategory === category.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setNewIdeaCategory(category.value)}
                    className="justify-start"
                  >
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: category.color }}
                    />
                    {category.label}
                  </Button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Теги</label>
              <Input
                placeholder="Введите теги через запятую..."
                value={newIdeaTags}
                onChange={(e) => setNewIdeaTags(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleEditIdea} className="flex-1">
                Сохранить изменения
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowEditDialog(false)
                  setEditingIdea(null)
                  resetForm()
                }}
              >
                Отмена
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}