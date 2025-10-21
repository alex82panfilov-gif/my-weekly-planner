'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Download, 
  Upload, 
  FileJson, 
  Trash2, 
  Database, 
  CheckCircle, 
  AlertCircle,
  Info,
  Calendar,
  Lightbulb
} from 'lucide-react'
import { 
  exportAllData, 
  exportTasks, 
  exportIdeas, 
  importAllData, 
  importTasks, 
  importIdeas, 
  clearAllData,
  getDataStats,
  type ExportData 
} from '@/lib/data-manager'
import { useTasks } from '@/hooks/useTasks'
import { useIdeas } from '@/hooks/useIdeas'

export function DataManager() {
  const { refetch: refetchTasks } = useTasks()
  const { refetch: refetchIdeas } = useIdeas()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [importResult, setImportResult] = useState<{
    success: boolean
    message: string
    details?: string
  } | null>(null)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  
  const stats = getDataStats()

  // Функция для скачивания файла
  const downloadFile = (data: any, filename: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { 
      type: 'application/json' 
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Экспорт всех данных
  const handleExportAll = async () => {
    setIsExporting(true)
    try {
      const data = exportAllData()
      const timestamp = new Date().toISOString().split('T')[0]
      downloadFile(data, `weekly-planner-backup-${timestamp}.json`)
    } catch (error) {
      console.error('Export error:', error)
    } finally {
      setIsExporting(false)
    }
  }

  // Экспорт только задач
  const handleExportTasks = async () => {
    setIsExporting(true)
    try {
      const tasks = exportTasks()
      const timestamp = new Date().toISOString().split('T')[0]
      downloadFile(tasks, `weekly-planner-tasks-${timestamp}.json`)
    } catch (error) {
      console.error('Export tasks error:', error)
    } finally {
      setIsExporting(false)
    }
  }

  // Экспорт только идей
  const handleExportIdeas = async () => {
    setIsExporting(true)
    try {
      const ideas = exportIdeas()
      const timestamp = new Date().toISOString().split('T')[0]
      downloadFile(ideas, `weekly-planner-ideas-${timestamp}.json`)
    } catch (error) {
      console.error('Export ideas error:', error)
    } finally {
      setIsExporting(false)
    }
  }

  // Импорт данных
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsImporting(true)
    setImportResult(null)

    try {
      const text = await file.text()
      const data = JSON.parse(text)
      
      // Определяем тип данных
      let result
      if (data.version && data.tasks && data.ideas) {
        // Полный бэкап
        result = importAllData(data, { mergeWithExisting: true })
      } else if (Array.isArray(data)) {
        // Определяем тип массива по первому элементу
        if (data.length > 0 && data[0].dueDate) {
          // Задачи
          result = importTasks(data, { mergeWithExisting: true })
        } else {
          // Идеи
          result = importIdeas(data, { mergeWithExisting: true })
        }
      } else {
        throw new Error('Неверный формат файла')
      }

      if (result.success) {
        setImportResult({
          success: true,
          message: 'Данные успешно импортированы!',
          details: `Импортировано: ${result.imported.tasks || result.imported} элементов`
        })
        // Обновляем данные в приложении
        refetchTasks()
        refetchIdeas()
      } else {
        setImportResult({
          success: false,
          message: 'Ошибка при импорте данных',
          details: result.errors.join(', ')
        })
      }
    } catch (error) {
      setImportResult({
        success: false,
        message: 'Ошибка при чтении файла',
        details: error instanceof Error ? error.message : 'Неизвестная ошибка'
      })
    } finally {
      setIsImporting(false)
      // Сбрасываем input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // Очистка всех данных
  const handleClearAll = async () => {
    const result = clearAllData()
    if (result.success) {
      refetchTasks()
      refetchIdeas()
      setShowClearConfirm(false)
      setImportResult({
        success: true,
        message: 'Все данные успешно удалены!'
      })
    } else {
      setImportResult({
        success: false,
        message: 'Ошибка при удалении данных',
        details: result.errors.join(', ')
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Статистика данных */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Статистика данных
          </CardTitle>
          <CardDescription>
            Текущее состояние вашего хранилища
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Calendar className="w-8 h-8 mx-auto mb-2 text-blue-600 dark:text-blue-400" />
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {stats.tasks.total}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Всего задач
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                {stats.tasks.completed} выполнено
              </div>
            </div>
            
            <div className="text-center p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
              <Lightbulb className="w-8 h-8 mx-auto mb-2 text-amber-600 dark:text-amber-400" />
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {stats.ideas.total}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Всего идей
              </div>
            </div>
            
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-600 dark:text-green-400" />
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {stats.categories}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Категорий
              </div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <FileJson className="w-8 h-8 mx-auto mb-2 text-purple-600 dark:text-purple-400" />
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {stats.formattedSize}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Объем данных
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Экспорт данных */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Экспорт данных
          </CardTitle>
          <CardDescription>
            Скачайте ваши данные для резервного копирования или переноса
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={handleExportAll}
              disabled={isExporting}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              {isExporting ? 'Экспорт...' : 'Экспорт всех данных'}
            </Button>
            
            <Button 
              onClick={handleExportTasks}
              disabled={isExporting}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              {isExporting ? 'Экспорт...' : 'Только задачи'}
            </Button>
            
            <Button 
              onClick={handleExportIdeas}
              disabled={isExporting}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Lightbulb className="w-4 h-4" />
              {isExporting ? 'Экспорт...' : 'Только идеи'}
            </Button>
          </div>
          
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Экспортированные файлы сохраняются в формате JSON и могут быть импортированы в любом браузере
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Импорт данных */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Импорт данных
          </CardTitle>
          <CardDescription>
            Загрузите данные из резервной копии или другого браузера
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
              id="import-file"
            />
            <Button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
              className="flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              {isImporting ? 'Импорт...' : 'Выбрать файл'}
            </Button>
            <Badge variant="secondary">JSON</Badge>
          </div>
          
          {importResult && (
            <Alert className={importResult.success ? 'border-green-200 bg-green-50 dark:bg-green-900/20' : 'border-red-200 bg-red-50 dark:bg-red-900/20'}>
              {importResult.success ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription>
                <div className="font-medium">{importResult.message}</div>
                {importResult.details && (
                  <div className="text-sm mt-1">{importResult.details}</div>
                )}
              </AlertDescription>
            </Alert>
          )}
          
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Импортированные данные будут объединены с существующими. Дубликаты по ID будут пропущены.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Опасные операции */}
      <Card className="border-red-200 dark:border-red-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <Trash2 className="w-5 h-5" />
            Опасные операции
          </CardTitle>
          <CardDescription>
            Действия, которые нельзя отменить
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!showClearConfirm ? (
            <Button 
              onClick={() => setShowClearConfirm(true)}
              variant="destructive"
              className="flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Удалить все данные
            </Button>
          ) : (
            <div className="space-y-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription>
                  <strong>Внимание!</strong> Это действие удалит все ваши задачи и идеи без возможности восстановления.
                </AlertDescription>
              </Alert>
              <div className="flex gap-2">
                <Button 
                  onClick={handleClearAll}
                  variant="destructive"
                  className="flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Да, удалить все данные
                </Button>
                <Button 
                  onClick={() => setShowClearConfirm(false)}
                  variant="outline"
                >
                  Отмена
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}