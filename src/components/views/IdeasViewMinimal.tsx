'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Lightbulb, Plus } from 'lucide-react'

export function IdeasViewMinimal() {
  const [ideas, setIdeas] = useState<Array<{id: string, title: string, createdAt: string}>>([])
  const [newIdea, setNewIdea] = useState('')

  const addIdea = () => {
    if (!newIdea.trim()) return
    
    const idea = {
      id: Date.now().toString(),
      title: newIdea.trim(),
      createdAt: new Date().toISOString()
    }
    
    setIdeas(prev => [idea, ...prev])
    setNewIdea('')
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
        
        <Button onClick={addIdea} disabled={!newIdea.trim()}>
          <Plus className="w-4 h-4 mr-2" />
          Добавить идею
        </Button>
      </div>

      {/* Add Input */}
      <Card>
        <CardContent className="pt-6">
          <input
            type="text"
            placeholder="Введите идею..."
            value={newIdea}
            onChange={(e) => setNewIdea(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                addIdea()
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </CardContent>
      </Card>

      {/* Ideas List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ideas.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="pt-6 text-center">
              <Lightbulb className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                У вас пока нет идей
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Начните добавлять идеи, чтобы не потерять важные мысли
              </p>
            </CardContent>
          </Card>
        ) : (
          ideas.map(idea => (
            <Card key={idea.id}>
              <CardHeader>
                <CardTitle className="text-lg">{idea.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {new Date(idea.createdAt).toLocaleDateString('ru-RU')}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}