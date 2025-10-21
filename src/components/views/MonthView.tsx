'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { EditTaskDialog } from '@/components/ui/edit-task-dialog'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Trash2, Tag, Flag } from 'lucide-react'
import { Task } from '@/types'
import { useTasks } from '@/hooks/useTasks'

const monthNames = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
]
const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

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

export function MonthView() {
  const { tasks, createTask, updateTask, deleteTask, toggleTask, loading, error, getTasksByDate } = useTasks()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [editingTaskFull, setEditingTaskFull] = useState<Task | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskComment, setNewTaskComment] = useState('')
  const [newTaskCategory, setNewTaskCategory] = useState('general')
  const [newTaskPriority, setNewTaskPriority] = useState('medium')
  const [newTaskColor, setNewTaskColor] = useState('#3B82F6')

  // Получаем количество дней в месяце
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  // Получаем первый день месяца (0-6, где 0 - воскресенье)
  const getFirstDayOfMonth = (date: Date) => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay()
    // Преобразуем в формат, где понедельник = 0, воскресенье = 6
    return firstDay === 0 ? 6 : firstDay - 1
  }

  // Навигация по месяцам
  const goToPreviousMonth = () => {
    const prevMonth = new Date(currentDate)
    prevMonth.setMonth(prevMonth.getMonth() - 1)
    setCurrentDate(prevMonth)
  }

  const goToNextMonth = () => {
    const nextMonth = new Date(currentDate)
    nextMonth.setMonth(nextMonth.getMonth() + 1)
    setCurrentDate(nextMonth)
  }

  const goToCurrentMonth = () => {
    setCurrentDate(new Date())
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

  const daysInMonth = getDaysInMonth(currentDate)
  const firstDayOfMonth = getFirstDayOfMonth(currentDate)
  const today = formatDate(new Date())

  // Создаем массив дней для календаря
  const calendarDays = []
  
  // Добавляем пустые ячейки для дней до начала месяца
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null)
  }
  
  // Добавляем дни месяца
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i)
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <CalendarIcon className="w-6 h-6 text-blue-500" />
          <h1 className="text-2xl font-bold">Месяц</h1>
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
          <h1 className="text-2xl font-bold">Месяц</h1>
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
            <h1 className="text-2xl font-bold">Месяц</h1>
            <p className="text-gray-600 dark:text-gray-400">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPreviousMonth}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={goToCurrentMonth}
          >
            Сегодня
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={goToNextMonth}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-4">
          {/* Days of week header */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {weekDays.map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-600 dark:text-gray-400 p-2">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day, index) => {
              if (day === null) {
                return <div key={`empty-${index}`} className="aspect-square"></div>
              }

              const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
              const dateStr = formatDate(date)
              const activeTasks = getActiveTasksForDate(date)
              const allTasks = getTasksForDate(date)
              const isToday = dateStr === today
              const isSelected = selectedDate && formatDate(selectedDate) === dateStr

              return (
                <div
                  key={dateStr}
                  className={`aspect-square border rounded-lg p-2 cursor-pointer transition-all hover:shadow-md ${
                    isToday ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''
                  } ${isSelected ? 'ring-2 ring-green-500' : ''} ${
                    'border-gray-200 dark:border-gray-700'
                  }`}
                  onClick={() => setSelectedDate(date)}
                >
                  <div className="h-full flex flex-col">
                    <div className={`text-sm font-medium mb-1 ${
                      isToday ? 'text-blue-600' : 'text-gray-900 dark:text-gray-100'
                    }`}>
                      {day}
                    </div>
                    
                    <div className="flex-1 flex items-center justify-center">
                      {activeTasks.length > 0 ? (
                        <div className="text-center">
                          <div className="text-lg font-bold text-blue-600">
                            {activeTasks.length}
                          </div>
                          <div className="text-xs text-gray-500">
                            {activeTasks.length === 1 ? 'задача' : 
                             activeTasks.length < 5 ? 'задачи' : 'задач'}
                          </div>
                        </div>
                      ) : allTasks.length > 0 ? (
                        <div className="text-xs text-gray-400 text-center">
                          Все выполнены
                        </div>
                      ) : (
                        <div className="text-xs text-gray-400 text-center">
                          —
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

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

      {/* Month Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Всего задач
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tasks.filter(task => {
                const taskDate = new Date(task.dueDate)
                return taskDate.getMonth() === currentDate.getMonth() && 
                       taskDate.getFullYear() === currentDate.getFullYear()
              }).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Выполнено
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {tasks.filter(task => {
                const taskDate = new Date(task.dueDate)
                return taskDate.getMonth() === currentDate.getMonth() && 
                       taskDate.getFullYear() === currentDate.getFullYear() &&
                       task.isCompleted
              }).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Активных
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {tasks.filter(task => {
                const taskDate = new Date(task.dueDate)
                return taskDate.getMonth() === currentDate.getMonth() && 
                       taskDate.getFullYear() === currentDate.getFullYear() &&
                       !task.isCompleted
              }).length}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}