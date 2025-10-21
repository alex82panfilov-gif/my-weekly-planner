'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { EditTaskDialog } from '@/components/ui/edit-task-dialog'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Edit2, Trash2, Tag, Flag, Clock, MessageSquare } from 'lucide-react'
import { Task } from '@/types'
import { useTasks } from '@/hooks/useTasks'

const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь']

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

export function WeekView() {
  const { tasks, createTask, updateTask, deleteTask, toggleTask, loading, error, getTasksByDate } = useTasks()
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [editingTaskFull, setEditingTaskFull] = useState<Task | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskComment, setNewTaskComment] = useState('')
  const [newTaskCategory, setNewTaskCategory] = useState('general')
  const [newTaskPriority, setNewTaskPriority] = useState('medium')
  const [newTaskColor, setNewTaskColor] = useState('#3B82F6')

  // Получаем начало недели (понедельник)
  const getWeekStart = (date: Date) => {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Adjust for Sunday
    return new Date(d.setDate(diff))
  }

  // Получаем дни недели
  const getWeekDays = (startDate: Date) => {
    const days = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      days.push(date)
    }
    return days
  }

  // Навигация по неделям
  const goToPreviousWeek = () => {
    const prevWeek = new Date(currentWeekStart)
    prevWeek.setDate(currentWeekStart.getDate() - 7)
    setCurrentWeekStart(prevWeek)
  }

  const goToNextWeek = () => {
    const nextWeek = new Date(currentWeekStart)
    nextWeek.setDate(currentWeekStart.getDate() + 7)
    setCurrentWeekStart(nextWeek)
  }

  const goToCurrentWeek = () => {
    setCurrentWeekStart(getWeekStart(new Date()))
  }

  // Форматирование даты
  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0]
  }

  // Получаем задачи для конкретной даты
  const getTasksForDate = (date: Date) => {
    const dateStr = formatDate(date)
    return getTasksByDate(dateStr)
  }

  // Получаем только активные задачи для конкретной даты
  const getActiveTasksForDate = (date: Date) => {
    return getTasksForDate(date).filter(task => !task.isCompleted)
  }

  const weekStart = getWeekStart(currentWeekStart)
  const weekDaysList = getWeekDays(weekStart)
  const today = formatDate(new Date())

  const addTask = async () => {
    if (!selectedDate || !newTaskTitle.trim()) return

    const dateStr = formatDate(selectedDate)
    const success = await createTask(
      newTaskTitle.trim(),
      dateStr,
      newTaskCategory,
      newTaskPriority,
      newTaskColor,
      newTaskComment || undefined
    )
    
    if (success) {
      setNewTaskTitle('')
      setNewTaskComment('')
      setNewTaskCategory('general')
      setNewTaskPriority('medium')
      setNewTaskColor('#3B82F6')
      setShowAddDialog(false)
    }
  }

  
  const deleteTaskHandler = async (taskId: string) => {
    await deleteTask(taskId)
  }

  const openFullEditDialog = (task: Task) => {
    setEditingTaskFull(task)
    setShowEditDialog(true)
  }

  const handleSaveTask = async (task: Task) => {
    return await updateTask(task.id, task)
  }

  const getCategoryInfo = (categoryValue: string) => {
    return categories.find(cat => cat.value === categoryValue) || categories[4]
  }

  const getPriorityInfo = (priorityValue: string) => {
    return priorities.find(pri => pri.value === priorityValue) || priorities[1]
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <CalendarIcon className="w-6 h-6 text-blue-500" />
          <h1 className="text-2xl font-bold">Неделя</h1>
        </div>
        <div className="text-center py-8">
          <div className="text-gray-500">Загрузка...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <CalendarIcon className="w-6 h-6 text-blue-500" />
          <h1 className="text-2xl font-bold">Неделя</h1>
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
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CalendarIcon className="w-6 h-6 text-blue-500" />
          <div>
            <h1 className="text-2xl font-bold">Неделя</h1>
            <p className="text-gray-600 dark:text-gray-400">
              {weekDaysList[0].getDate()} {monthNames[weekDaysList[0].getMonth()]} - {weekDaysList[6].getDate()} {monthNames[weekDaysList[6].getMonth()]} {weekDaysList[0].getFullYear()}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPreviousWeek}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={goToCurrentWeek}
          >
            Сегодня
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={goToNextWeek}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Week Grid */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {weekDaysList.map((date, index) => {
          const dateStr = formatDate(date)
          const activeTasks = getActiveTasksForDate(date)
          const allTasks = getTasksForDate(date)
          const isToday = dateStr === today
          const isSelected = selectedDate && formatDate(selectedDate) === dateStr

          return (
            <Card 
              key={dateStr} 
              className={`min-h-[120px] cursor-pointer transition-all hover:shadow-md ${
                isToday ? 'ring-2 ring-blue-500' : ''
              } ${isSelected ? 'ring-2 ring-green-500' : ''}`}
              onClick={() => setSelectedDate(date)}
            >
              <CardHeader className="pb-2">
                <CardTitle className={`text-sm font-medium ${
                  isToday ? 'text-blue-600' : 'text-gray-900 dark:text-gray-100'
                }`}>
                  <div className="text-center">
                    <div className="text-xs text-gray-500">{weekDays[index]}</div>
                    <div className="text-lg">{date.getDate()}</div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-center">
                  {activeTasks.length > 0 ? (
                    <div className="space-y-2">
                      <div className="text-lg font-semibold text-blue-600">
                        {activeTasks.length}
                      </div>
                      <div className="text-xs text-gray-500">
                        {activeTasks.length === 1 ? 'активная задача' : 
                         activeTasks.length < 5 ? 'активные задачи' : 'активных задач'}
                      </div>
                    </div>
                  ) : allTasks.length > 0 ? (
                    <div className="text-xs text-gray-400">
                      Все задачи выполнены
                    </div>
                  ) : (
                    <div className="text-xs text-gray-400">
                      Нет задач
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Selected Date Details */}
      {selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>
                Задачи на {selectedDate.getDate()} {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddDialog(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Добавить
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedDate(null)}
                >
                  Закрыть
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getTasksForDate(selectedDate).map((task) => {
                const categoryInfo = getCategoryInfo(task.category)
                const priorityInfo = getPriorityInfo(task.priority)
                
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
                          <p className={`font-medium mb-2 ${task.isCompleted ? 'line-through text-gray-500' : ''}`}>
                            {task.content}
                          </p>
                          {task.comment && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              {task.comment}
                            </p>
                          )}
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge 
                              variant="secondary" 
                              style={{ 
                                backgroundColor: `${categoryInfo.color}20`, 
                                color: categoryInfo.color 
                              }}
                            >
                              {categoryInfo.label}
                            </Badge>
                            <Badge 
                              variant="outline"
                              style={{ 
                                borderColor: `${priorityInfo.color}40`,
                                color: priorityInfo.color 
                              }}
                            >
                              {priorityInfo.label}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteTaskHandler(task.id)
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
              {getTasksForDate(selectedDate).length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">Нет задач на этот день</p>
                  <Button
                    variant="outline"
                    onClick={() => setShowAddDialog(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Добавить задачу
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Task Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Добавить задачу на {selectedDate?.getDate()} {selectedDate && monthNames[selectedDate.getMonth()]} {selectedDate?.getFullYear()}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Название задачи</label>
              <input
                type="text"
                placeholder="Введите название задачи..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="w-full p-2 border rounded-md"
                autoFocus
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Комментарий</label>
              <textarea
                placeholder="Комментарий к задаче (необязательно)..."
                value={newTaskComment}
                onChange={(e) => setNewTaskComment(e.target.value)}
                rows={3}
                className="w-full p-2 border rounded-md resize-none"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Категория</label>
                <select
                  value={newTaskCategory}
                  onChange={(e) => setNewTaskCategory(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Приоритет</label>
                <select
                  value={newTaskPriority}
                  onChange={(e) => setNewTaskPriority(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  {priorities.map(priority => (
                    <option key={priority.value} value={priority.value}>
                      {priority.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={addTask} className="flex-1">
                Добавить
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowAddDialog(false)
                  setNewTaskTitle('')
                  setNewTaskComment('')
                  setNewTaskCategory('general')
                  setNewTaskPriority('medium')
                  setNewTaskColor('#3B82F6')
                }}
              >
                Отмена
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Task Dialog */}
      <EditTaskDialog
        task={editingTaskFull}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onSave={handleSaveTask}
      />
    </div>
  )
}