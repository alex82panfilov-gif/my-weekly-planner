'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { EditTaskDialog } from '@/components/ui/edit-task-dialog'
import { Plus, Edit2, Trash2, Calendar as CalendarIcon, Tag, Flag, Palette, Clock, MessageSquare } from 'lucide-react'
import { Task } from '@/types'
import { useTasks } from '@/hooks/useTasks'

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

export function TodayView() {
  const { tasks, createTask, updateTask, deleteTask, toggleTask, loading, error } = useTasks()
  const [newTaskInput, setNewTaskInput] = useState('')
  const [newTaskComment, setNewTaskComment] = useState('')
  const [editingTask, setEditingTask] = useState<{ [key: string]: string }>({})
  const [showAddForm, setShowAddForm] = useState(false)
  const [newTaskCategory, setNewTaskCategory] = useState('general')
  const [newTaskPriority, setNewTaskPriority] = useState('medium')
  const [newTaskColor, setNewTaskColor] = useState('#3B82F6')
  const [newTaskEndDate, setNewTaskEndDate] = useState<Date | undefined>(undefined)
  const [editingTaskFull, setEditingTaskFull] = useState<Task | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)

  const today = new Date().toISOString().split('T')[0]
  const todayTasks = tasks.filter(task => {
    const taskStart = new Date(task.dueDate)
    const taskEnd = task.endDate ? new Date(task.endDate) : taskStart
    const checkDate = new Date(today)
    
    return checkDate >= taskStart && checkDate <= taskEnd
  })

  const addTask = async () => {
    const content = newTaskInput.trim()
    if (!content) return

    const endDate = newTaskEndDate ? 
      new Date(newTaskEndDate.getFullYear(), newTaskEndDate.getMonth(), newTaskEndDate.getDate()).toISOString().split('T')[0] : 
      undefined

    const success = await createTask(
      content, 
      today, 
      newTaskCategory, 
      newTaskPriority, 
      newTaskColor,
      newTaskComment || undefined,
      endDate
    )
    
    if (success) {
      setNewTaskInput('')
      setNewTaskComment('')
      setShowAddForm(false)
      setNewTaskCategory('general')
      setNewTaskPriority('medium')
      setNewTaskColor('#3B82F6')
      setNewTaskEndDate(undefined)
    }
  }

  
  const deleteTaskHandler = async (taskId: string) => {
    await deleteTask(taskId)
  }

  const startEditingTask = (taskId: string, content: string) => {
    setEditingTask(prev => ({ ...prev, [taskId]: content }))
  }

  const saveEditedTask = async (taskId: string) => {
    const newContent = editingTask[taskId]?.trim()
    if (!newContent) return

    const success = await updateTask(taskId, { content: newContent })
    if (success) {
      setEditingTask(prev => {
        const newState = { ...prev }
        delete newState[taskId]
        return newState
      })
    }
  }

  const openFullEditDialog = (task: Task) => {
    setEditingTaskFull(task)
    setShowEditDialog(true)
  }

  const getCategoryInfo = (categoryValue: string) => {
    return categories.find(cat => cat.value === categoryValue) || categories[4]
  }

  const getPriorityInfo = (priorityValue: string) => {
    return priorities.find(pri => pri.value === priorityValue) || priorities[1]
  }

  const getTaskDuration = (task: Task) => {
    if (!task.endDate) return 1
    const start = new Date(task.dueDate)
    const end = new Date(task.endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
  }

  const completedTasks = todayTasks.filter(task => task.isCompleted)
  const pendingTasks = todayTasks.filter(task => !task.isCompleted)

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <CalendarIcon className="w-6 h-6 text-blue-500" />
          <h1 className="text-2xl font-bold">Сегодня</h1>
        </div>
        <div className="text-center py-8">
          <div className="text-gray-500">Загрузка...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <CalendarIcon className="w-6 h-6 text-blue-500" />
          <h1 className="text-2xl font-bold">Сегодня</h1>
        </div>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-red-500 mb-4">Ошибка загрузки задач</div>
            <div className="text-gray-600 mb-4">{error}</div>
            <Button onClick={() => window.location.reload()}>
              Перезагрузить страницу
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CalendarIcon className="w-6 h-6 text-blue-500" />
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
        <Button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="shrink-0"
        >
          <Plus className="w-4 h-4 mr-2" />
          Добавить задачу
        </Button>
      </div>

      {/* Add Task Form */}
      {showAddForm && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <Input
                placeholder="Название задачи..."
                value={newTaskInput}
                onChange={(e) => setNewTaskInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addTask()
                  }
                }}
                autoFocus
                className="break-words overflow-wrap-anywhere input-break-words"
              />

              <Textarea
                placeholder="Комментарий к задаче (необязательно)..."
                value={newTaskComment}
                onChange={(e) => setNewTaskComment(e.target.value)}
                rows={3}
                className="break-words overflow-wrap-anywhere resize-none input-break-words"
              />
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    <Tag className="w-4 h-4 inline mr-1" />
                    Категория
                  </label>
                  <Select value={newTaskCategory} onValueChange={setNewTaskCategory}>
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

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    <Flag className="w-4 h-4 inline mr-1" />
                    Приоритет
                  </label>
                  <Select value={newTaskPriority} onValueChange={setNewTaskPriority}>
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

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Дата окончания
                  </label>
                  <Input
                    type="date"
                    value={newTaskEndDate ? new Date(newTaskEndDate.getTime() - newTaskEndDate.getTimezoneOffset() * 60000).toISOString().split('T')[0] : ''}
                    onChange={(e) => {
                      if (e.target.value) {
                        const date = new Date(e.target.value + 'T12:00:00')
                        setNewTaskEndDate(date)
                      } else {
                        setNewTaskEndDate(undefined)
                      }
                    }}
                    min={today}
                    className="w-full"
                  />
                  {newTaskEndDate && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setNewTaskEndDate(undefined)}
                      className="mt-2 text-xs"
                    >
                      Убрать дату окончания
                    </Button>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    <Palette className="w-4 h-4 inline mr-1" />
                    Цвет
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {taskColors.map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setNewTaskColor(color)}
                        className={`w-6 h-6 rounded-full border-2 ${
                          newTaskColor === color ? 'border-gray-900' : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={addTask} className="flex-1">
                  Добавить
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowAddForm(false)
                    setNewTaskInput('')
                    setNewTaskComment('')
                    setNewTaskCategory('general')
                    setNewTaskPriority('medium')
                    setNewTaskColor('#3B82F6')
                    setNewTaskEndDate(undefined)
                  }}
                >
                  Отмена
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pending Tasks */}
      {pendingTasks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Активные задачи ({pendingTasks.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {pendingTasks.map((task) => {
              const categoryInfo = getCategoryInfo(task.category)
              const priorityInfo = getPriorityInfo(task.priority)
              const duration = getTaskDuration(task)
              
              return (
                <div
                  key={task.id}
                  className="group rounded-lg hover:shadow-md transition-all cursor-pointer"
                  style={{ 
                    backgroundColor: `${task.color}15`,
                    border: `2px solid ${task.color}40`,
                    borderLeft: `6px solid ${task.color}`
                  }}
                  onClick={() => openFullEditDialog(task)}
                >
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={task.isCompleted}
                        onCheckedChange={(checked) => {
                          toggleTask(task.id, checked)
                        }}
                        className="mt-1"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex-1 min-w-0">
                        {editingTask[task.id] !== undefined ? (
                          <Input
                            value={editingTask[task.id]}
                            onChange={(e) => setEditingTask(prev => ({ ...prev, [task.id]: e.target.value }))}
                            onBlur={(e) => {
                              e.stopPropagation()
                              saveEditedTask(task.id)
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.stopPropagation()
                                saveEditedTask(task.id)
                              }
                            }}
                            onClick={(e) => e.stopPropagation()}
                            autoFocus
                            className="break-words overflow-wrap-anywhere input-break-words"
                          />
                        ) : (
                          <div>
                            <p
                              className="text-gray-900 dark:text-gray-100 cursor-pointer mb-2 font-medium"
                              onClick={(e) => {
                                e.stopPropagation()
                                startEditingTask(task.id, task.content)
                              }}
                            >
                              {task.content}
                            </p>
                            {task.comment && (
                              <p 
                                className="text-gray-600 dark:text-gray-400 text-sm mb-2 flex items-start gap-1"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MessageSquare className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                <span className="line-clamp-2 break-words overflow-wrap-anywhere">
                                  {task.comment.length > 50 ? `${task.comment.substring(0, 50)}...` : task.comment}
                                </span>
                              </p>
                            )}
                            <div className="flex gap-2 flex-wrap items-center">
                              <Badge 
                                variant="secondary" 
                                style={{ backgroundColor: `${categoryInfo.color}20`, color: categoryInfo.color }}
                              >
                                {categoryInfo.label}
                              </Badge>
                              <Badge 
                                variant="outline"
                                style={{ borderColor: priorityInfo.color, color: priorityInfo.color }}
                              >
                                {priorityInfo.label}
                              </Badge>
                              {duration > 1 && (
                                <Badge variant="outline" className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {duration} дня
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            openFullEditDialog(task)
                          }}
                          className="h-8 w-8 p-0"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteTaskHandler(task.id)
                          }}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-gray-600 dark:text-gray-400">
              Выполненные задачи ({completedTasks.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {completedTasks.map((task) => {
              const categoryInfo = getCategoryInfo(task.category)
              const priorityInfo = getPriorityInfo(task.priority)
              const duration = getTaskDuration(task)
              
              return (
                <div
                  key={task.id}
                  className="group rounded-lg hover:shadow-md transition-all cursor-pointer opacity-60"
                  style={{ 
                    backgroundColor: `${task.color}10`,
                    border: `2px solid ${task.color}30`,
                    borderLeft: `6px solid ${task.color}`
                  }}
                  onClick={() => openFullEditDialog(task)}
                >
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={task.isCompleted}
                        onCheckedChange={(checked) => {
                          toggleTask(task.id, checked)
                        }}
                        className="mt-1"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex-1 min-w-0">
                        {editingTask[task.id] !== undefined ? (
                          <Input
                            value={editingTask[task.id]}
                            onChange={(e) => setEditingTask(prev => ({ ...prev, [task.id]: e.target.value }))}
                            onBlur={(e) => {
                              e.stopPropagation()
                              saveEditedTask(task.id)
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.stopPropagation()
                                saveEditedTask(task.id)
                              }
                            }}
                            onClick={(e) => e.stopPropagation()}
                            autoFocus
                            className="break-words overflow-wrap-anywhere input-break-words"
                          />
                        ) : (
                          <div>
                            <p
                              className="line-through text-gray-500 dark:text-gray-400 cursor-pointer mb-2"
                              onClick={(e) => {
                                e.stopPropagation()
                                startEditingTask(task.id, task.content)
                              }}
                            >
                              {task.content}
                            </p>
                            {task.comment && (
                              <p 
                                className="text-gray-500 dark:text-gray-400 text-sm mb-2 flex items-start gap-1"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MessageSquare className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                {task.comment}
                              </p>
                            )}
                            <div className="flex gap-2 flex-wrap items-center">
                              <Badge 
                                variant="secondary" 
                                style={{ backgroundColor: `${categoryInfo.color}20`, color: categoryInfo.color }}
                              >
                                {categoryInfo.label}
                              </Badge>
                              <Badge 
                                variant="outline"
                                style={{ borderColor: priorityInfo.color, color: priorityInfo.color }}
                              >
                                {priorityInfo.label}
                              </Badge>
                              {duration > 1 && (
                                <Badge variant="outline" className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {duration} дня
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            openFullEditDialog(task)
                          }}
                          className="h-8 w-8 p-0"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteTaskHandler(task.id)
                          }}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {todayTasks.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-gray-500 dark:text-gray-400">
              <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Нет задач на сегодня</p>
              <p className="text-sm mt-2">Нажмите "Добавить задачу" чтобы начать планирование</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Task Dialog */}
      <EditTaskDialog
        task={editingTaskFull}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onSave={async (updatedTask) => {
          const success = await updateTask(updatedTask.id, updatedTask)
          if (success) {
            setEditingTaskFull(null)
            return true
          }
          return false
        }}
      />
    </div>
  )
}