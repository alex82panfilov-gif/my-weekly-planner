'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tag, Flag, Palette, X } from 'lucide-react'
import { Idea } from '@/types'

const categories = [
  { value: 'work', label: 'Работа', color: '#3B82F6' },
  { value: 'personal', label: 'Личное', color: '#10B981' },
  { value: 'shopping', label: 'Покупки', color: '#F59E0B' },
  { value: 'health', label: 'Здоровье', color: '#EF4444' },
  { value: 'general', label: 'Общее', color: '#6B7280' },
  { value: 'creative', label: 'Творчество', color: '#8B5CF6' },
  { value: 'business', label: 'Бизнес', color: '#EC4899' },
  { value: 'learning', label: 'Обучение', color: '#14B8A6' }
]

const priorities = [
  { value: 'low', label: 'Низкий', color: '#10B981' },
  { value: 'medium', label: 'Средний', color: '#F59E0B' },
  { value: 'high', label: 'Высокий', color: '#EF4444' },
  { value: 'urgent', label: 'Срочный', color: '#DC2626' }
]

const ideaColors = [
  '#F59E0B', '#3B82F6', '#10B981', '#EF4444', '#8B5CF6', 
  '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16'
]

interface EditIdeaDialogProps {
  idea: Idea | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (idea: Idea) => Promise<boolean>
}

export function EditIdeaDialog({ idea, open, onOpenChange, onSave }: EditIdeaDialogProps) {
  const [editedIdea, setEditedIdea] = useState<Idea | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [newTag, setNewTag] = useState('')

  useEffect(() => {
    if (idea) {
      // Редактирование существующей идеи
      // Парсим теги из JSON строки в массив
      const parsedTags = typeof idea.tags === 'string' 
        ? JSON.parse(idea.tags || '[]') 
        : (idea.tags || [])
      
      setEditedIdea({ 
        ...idea, 
        tags: parsedTags 
      })
    } else {
      // Создание новой идеи - инициализируем поля по умолчанию
      setEditedIdea({
        id: '',
        title: '',
        content: '',
        category: 'general',
        priority: 'medium',
        color: '#F59E0B',
        tags: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
    }
    setNewTag('')
  }, [idea, open])

  if (!editedIdea) return null

  const handleSave = async () => {
    if (!editedIdea) return
    
    setIsSaving(true)
    const success = await onSave(editedIdea)
    setIsSaving(false)
    
    if (success) {
      onOpenChange(false)
    }
  }

  const handleCancel = () => {
    setEditedIdea(idea)
    setNewTag('')
    onOpenChange(false)
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // При закрытии диалога сбрасываем состояние
      setEditedIdea(null)
      setNewTag('')
    }
    onOpenChange(open)
  }

  const addTag = () => {
    const tag = newTag.trim()
    if (tag && !editedIdea.tags.includes(tag)) {
      setEditedIdea({ 
        ...editedIdea, 
        tags: [...editedIdea.tags, tag] 
      })
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setEditedIdea({ 
      ...editedIdea, 
      tags: editedIdea.tags.filter(tag => tag !== tagToRemove) 
    })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {idea?.id ? 'Редактировать идею' : 'Новая идея'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Название идеи */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Название идеи
            </label>
            <Input
              value={editedIdea.title}
              onChange={(e) => setEditedIdea({ ...editedIdea, title: e.target.value })}
              placeholder="Введите название идеи..."
              className="font-medium"
            />
          </div>

          {/* Описание */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Описание идеи
            </label>
            <Textarea
              value={editedIdea.content}
              onChange={(e) => setEditedIdea({ ...editedIdea, content: e.target.value })}
              placeholder="Опишите вашу идею подробнее..."
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Теги */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              <Tag className="w-4 h-4 inline mr-1" />
              Теги
            </label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Добавить тег..."
                  className="flex-1"
                />
                <Button 
                  onClick={addTag}
                  disabled={!newTag.trim()}
                  variant="outline"
                >
                  Добавить
                </Button>
              </div>
              {editedIdea.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {editedIdea.tags.map((tag, index) => (
                    <Badge 
                      key={index}
                      variant="secondary" 
                      className="flex items-center gap-1 px-2 py-1"
                    >
                      {tag}
                      <X 
                        className="w-3 h-3 cursor-pointer hover:text-red-500" 
                        onClick={() => removeTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Параметры идеи */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Категория */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Категория
              </label>
              <Select 
                value={editedIdea.category} 
                onValueChange={(value) => setEditedIdea({ ...editedIdea, category: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.value} value={category.value}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: category.color }}
                        />
                        {category.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Приоритет */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                <Flag className="w-4 h-4 inline mr-1" />
                Приоритет
              </label>
              <Select 
                value={editedIdea.priority} 
                onValueChange={(value) => setEditedIdea({ ...editedIdea, priority: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map(priority => (
                    <SelectItem key={priority.value} value={priority.value}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: priority.color }}
                        />
                        {priority.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Цвет */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                <Palette className="w-4 h-4 inline mr-1" />
                Цвет
              </label>
              <div className="flex gap-2 flex-wrap">
                {ideaColors.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setEditedIdea({ ...editedIdea, color })}
                    className={`w-6 h-6 rounded-full border-2 transition-all ${
                      editedIdea.color === color 
                        ? 'border-gray-900 scale-110' 
                        : 'border-gray-300 hover:border-gray-500'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Предпросмотр */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Предпросмотр
            </label>
            <div 
              className="rounded-lg p-4 border-2"
              style={{ 
                backgroundColor: `${editedIdea.color}15`,
                borderColor: `${editedIdea.color}40`,
                borderLeftColor: editedIdea.color,
                borderLeftWidth: '6px'
              }}
            >
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {editedIdea.title || 'Название идеи'}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 whitespace-pre-wrap">
                {editedIdea.content || 'Описание идеи'}
              </p>
              <div className="flex gap-2 flex-wrap items-center">
                <Badge 
                  variant="secondary" 
                  style={{ 
                    backgroundColor: `${categories.find(c => c.value === editedIdea.category)?.color}20`, 
                    color: categories.find(c => c.value === editedIdea.category)?.color 
                  }}
                >
                  {categories.find(c => c.value === editedIdea.category)?.label}
                </Badge>
                <Badge 
                  variant="outline"
                  style={{ 
                    borderColor: `${priorities.find(p => p.value === editedIdea.priority)?.color}40`,
                    color: priorities.find(p => p.value === editedIdea.priority)?.color 
                  }}
                >
                  {priorities.find(p => p.value === editedIdea.priority)?.label}
                </Badge>
                {editedIdea.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Кнопки */}
          <div className="flex gap-3 pt-4">
            <Button 
              onClick={handleSave} 
              disabled={isSaving || !editedIdea.title.trim() || !editedIdea.content.trim()}
              className="flex-1"
            >
              {isSaving ? 'Сохранение...' : 'Сохранить'}
            </Button>
            <Button 
              variant="outline" 
              onClick={handleCancel}
              disabled={isSaving}
            >
              Отмена
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}