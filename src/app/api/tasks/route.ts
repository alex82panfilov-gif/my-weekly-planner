import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/tasks - получить все задачи пользователя
export async function GET(request: NextRequest) {
  try {
    // Временно используем заглушку для пользователя
    // В реальном приложении здесь будет аутентификация
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
    
    const tasks = await db.task.findMany({
      where: { userId },
      orderBy: { dueDate: 'asc' }
    })

    return NextResponse.json(tasks)
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    )
  }
}

// POST /api/tasks - создать новую задачу
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      content, 
      comment, 
      dueDate, 
      endDate, 
      category = "general", 
      priority = "medium", 
      color = "#3B82F6" 
    } = body

    if (!content || !dueDate) {
      return NextResponse.json(
        { error: 'Content and dueDate are required' },
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

    const task = await db.task.create({
      data: {
        content,
        comment,
        dueDate,
        endDate,
        category,
        priority,
        color,
        userId
      }
    })

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    console.error('Error creating task:', error)
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    )
  }
}