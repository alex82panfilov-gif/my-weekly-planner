import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/ideas - получить все идеи пользователя
export async function GET(request: NextRequest) {
  try {
    // Временно используем заглушку для пользователя
    const userId = "demo-user-id"
    
    // Создаем пользователя если он не существует
    await db.user.upsert({
      where: { id: userId },
      update: {},
      create: {
        id: userId,
        googleId: "demo-google-id",
        email: "demo@example.com",
        name: "Демо Пользователь",
        themePreference: "light"
      }
    })
    
    const ideas = await db.idea.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    })

    // Преобразуем теги из JSON строки в массив
    const ideasWithParsedTags = ideas.map(idea => ({
      ...idea,
      tags: idea.tags ? JSON.parse(idea.tags) : []
    }))

    return NextResponse.json(ideasWithParsedTags)
  } catch (error) {
    console.error('Error fetching ideas:', error)
    return NextResponse.json(
      { error: 'Failed to fetch ideas' },
      { status: 500 }
    )
  }
}

// POST /api/ideas - создать новую идею
export async function POST(request: NextRequest) {
  try {
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

    // Создаем пользователя если он не существует
    await db.user.upsert({
      where: { id: userId },
      update: {},
      create: {
        id: userId,
        googleId: "demo-google-id",
        email: "demo@example.com",
        name: "Демо Пользователь",
        themePreference: "light"
      }
    })

    const idea = await db.idea.create({
      data: {
        title,
        content,
        category: category || 'general',
        priority: priority || 'medium',
        color: color || '#F59E0B',
        tags: tags && tags.length > 0 ? JSON.stringify(tags) : '',
        userId
      }
    })

    // Преобразуем теги в массив для ответа
    const ideaWithParsedTags = {
      ...idea,
      tags: idea.tags ? JSON.parse(idea.tags) : []
    }

    return NextResponse.json(ideaWithParsedTags, { status: 201 })
  } catch (error) {
    console.error('Error creating idea:', error)
    return NextResponse.json(
      { error: 'Failed to create idea' },
      { status: 500 }
    )
  }
}