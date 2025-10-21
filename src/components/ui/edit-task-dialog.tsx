'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { CalendarIcon, Tag, Flag, Palette, Clock } from 'lucide-react'
import { Task } from '@/types'

const categories = [
  { value: 'work', label: 'Работа', color: '#3B82F6' },
  { value: 'personal', label: 'Личное', color: '#10B981' },
  { value: 'shopping', label: 'Покупки', color: '#F59E0B' },
  { value: 'health', label: 'Здоровье', color: '#EF4444' },
  { value: 'general', label: 'Общее', color: '#6B7280' }
]

const priorities = [
  { value: 'low', label: 'Низкий', color: '#10B981' },
  { value: 'medium', label: 'Средний', color: '#F59E0B' },
  { value: 'high', label: 'Высокий', color: '#EF4444' },
  { value: 'urgent', label: 'Срочный', color: '#DC2626' }
]

const taskColors = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', 
  '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16'
]

interface EditTaskDialogProps {
  task: Task | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (task: Task) => Promise<boolean>
}

export function EditTaskDialog({ task, open, onOpenChange, onSave }: EditTaskDialogProps) {
  const [editedTask, setEditedTask] = useState<Task | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (task) {
      setEditedTask({ ...task })
    }
  }, [task])

  if (!editedTask) return null

  const handleSave = async () => {
    if (!editedTask) return
    
    setIsSaving(true)
    const success = await onSave(editedTask)
    setIsSaving(false)
    
    if (success) {
      onOpenChange(false)
    }
  }

  const handleCancel = () => {
    setEditedTask(task)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto break-words overflow-wrap-anywhere">
        <DialogHeader>
          <DialogTitle>Редактировать задачу</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Название задачи */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Название задачи
            </label>
            <Input
              value={editedTask.content}
              onChange={(e) => setEditedTask({ ...editedTask, content: e.target.value })}
              placeholder="Введите название задачи..."
              className="break-words overflow-wrap-anywhere input-break-words"
            />
          </div>

          {/* Комментарий */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Комментарий
            </label>
            <Textarea
              value={editedTask.comment || ''}
              onChange={(e) => setEditedTask({ ...editedTask, comment: e.target.value || undefined })}
              placeholder="Добавьте комментарий к задаче..."
              rows={3}
              className="break-words overflow-wrap-anywhere resize-none input-break-words"
            />
          </div>

          {/* Дата начала */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              <CalendarIcon className="w-4 h-4 inline mr-1" />
              Дата начала
            </label>
            <Input
              type="date"
              value={editedTask.dueDate}
              onChange={(e) => setEditedTask({ ...editedTask, dueDate: e.target.value })}
              className="w-full"
            />
          </div>

          {/* Параметры задачи */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Категория */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                <Tag className="w-4 h-4 inline mr-1" />
                Категория
              </label>
              <Select 
                value={editedTask.category} 
                onValueChange={(value) => setEditedTask({ ...editedTask, category: value })}
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
                value={editedTask.priority} 
                onValueChange={(value) => setEditedTask({ ...editedTask, priority: value })}
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

            {/* Дата окончания */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                <Clock className="w-4 h-4 inline mr-1" />
                Дата окончания
              </label>
              <Input
                type="date"
                value={editedTask.endDate || ''}
                onChange={(e) => setEditedTask({ ...editedTask, endDate: e.target.value || undefined })}
                min={editedTask.dueDate}
                className="w-full"
              />
              {editedTask.endDate && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditedTask({ ...editedTask, endDate: undefined })}
                  className="mt-2 text-xs"
                >
                  Убрать дату окончания
                </Button>
              )}
            </div>
          </div>

          {/* Цвет */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              <Palette className="w-4 h-4 inline mr-1" />
              Цвет задачи
            </label>
            <div className="flex gap-2 flex-wrap">
              {taskColors.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setEditedTask({ ...editedTask, color })}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    editedTask.color === color 
                      ? 'border-gray-900 scale-110' 
                      : 'border-gray-300 hover:border-gray-500'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Предпросмотр */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Предпросмотр
            </label>
            <div 
              className="rounded-lg p-4 border-2 min-w-0 max-w-full"
              style={{ 
                backgroundColor: `${editedTask.color}15`,
                borderColor: `${editedTask.color}40`,
                borderLeftColor: editedTask.color,
                borderLeftWidth: '6px',
                wordWrap: 'break-word',
                overflowWrap: 'break-word',
                wordBreak: 'break-word'
              }}
            >
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2 break-words overflow-wrap-anywhere">
                {editedTask.content || 'Название задачи'}
              </h4>
              {editedTask.comment && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 break-words overflow-wrap-anywhere whitespace-pre-wrap">
                  {editedTask.comment}
                </p>
              )}
              <div className="flex gap-2 flex-wrap">
                <Badge 
                  variant="secondary" 
                  style={{ 
                    backgroundColor: `${categories.find(c => c.value === editedTask.category)?.color}20`, 
                    color: categories.find(c => c.value === editedTask.category)?.color 
                  }}
                >
                  {categories.find(c => c.value === editedTask.category)?.label}
                </Badge>
                <Badge 
                  variant="outline"
                  style={{ 
                    borderColor: `${priorities.find(p => p.value === editedTask.priority)?.color}40`,
                    color: priorities.find(p => p.value === editedTask.priority)?.color 
                  }}
                >
                  {priorities.find(p => p.value === editedTask.priority)?.label}
                </Badge>
                {editedTask.endDate && (
                  <Badge variant="outline">
                    {(() => {
                      const start = new Date(editedTask.dueDate)
                      const end = new Date(editedTask.endDate)
                      const diffTime = Math.abs(end.getTime() - start.getTime())
                      const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
                      return days === 1 ? '1 день' : days < 5 ? `${days} дня` : `${days} дней`
                    })()}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Кнопки */}
          <div className="flex gap-3 pt-4">
            <Button 
              onClick={handleSave} 
              disabled={isSaving || !editedTask.content.trim()}
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