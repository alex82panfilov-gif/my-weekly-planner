import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// PUT /api/ideas/[id] - обновить идею
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const body = await request.json()
    const { title, content, category, priority, color, tags } = body

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      )
    }

    // Временно используем заглушку для пользователя
    const userId = "demo-user-id"

    // Проверяем, что идея принадлежит пользователю
    const existingIdea = await db.idea.findFirst({
      where: { id: resolvedParams.id, userId }
    })

    if (!existingIdea) {
      return NextResponse.json(
        { error: 'Idea not found' },
        { status: 404 }
      )
    }

    const updateData: any = {
      title,
      content,
      category: category || 'general',
      priority: priority || 'medium',
      color: color || '#F59E0B',
      tags: tags && tags.length > 0 ? JSON.stringify(tags) : ''
    }

    const idea = await db.idea.update({
      where: { id: resolvedParams.id },
      data: updateData
    })

    // Преобразуем теги в массив для ответа
    const ideaWithParsedTags = {
      ...idea,
      tags: idea.tags ? JSON.parse(idea.tags) : []
    }

    return NextResponse.json(ideaWithParsedTags)
  } catch (error) {
    console.error('Error updating idea:', error)
    return NextResponse.json(
      { error: 'Failed to update idea' },
      { status: 500 }
    )
  }
}

// DELETE /api/ideas/[id] - удалить идею
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    // Временно используем заглушку для пользователя
    const userId = "demo-user-id"

    // Проверяем, что идея принадлежит пользователю
    const existingIdea = await db.idea.findFirst({
      where: { id: resolvedParams.id, userId }
    })

    if (!existingIdea) {
      return NextResponse.json(
        { error: 'Idea not found' },
        { status: 404 }
      )
    }

    await db.idea.delete({
      where: { id: resolvedParams.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting idea:', error)
    return NextResponse.json(
      { error: 'Failed to delete idea' },
      { status: 500 }
    )
  }
}