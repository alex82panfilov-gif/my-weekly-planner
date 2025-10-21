import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// PUT /api/tasks/[id] - обновить задачу
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json()
    const { content, isCompleted, category, priority, color, comment, endDate, dueDate } = body

    // Временно используем заглушку для пользователя
    const userId = "demo-user-id"
    
    // Await params as required by Next.js 15
    const { id } = await params

    // Проверяем, что задача принадлежит пользователю
    const existingTask = await db.task.findFirst({
      where: { id, userId }
    })

    if (!existingTask) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    const updateData: any = {}
    if (content !== undefined) updateData.content = content
    if (isCompleted !== undefined) updateData.isCompleted = isCompleted
    if (category !== undefined) updateData.category = category
    if (priority !== undefined) updateData.priority = priority
    if (color !== undefined) updateData.color = color
    if (comment !== undefined) updateData.comment = comment
    if (endDate !== undefined) updateData.endDate = endDate
    if (dueDate !== undefined) updateData.dueDate = dueDate

    const task = await db.task.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json(task)
  } catch (error) {
    console.error('Error updating task:', error)
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    )
  }
}

// DELETE /api/tasks/[id] - удалить задачу
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Временно используем заглушку для пользователя
    const userId = "demo-user-id"
    
    // Await params as required by Next.js 15
    const { id } = await params

    // Проверяем, что задача принадлежит пользователю
    const existingTask = await db.task.findFirst({
      where: { id, userId }
    })

    if (!existingTask) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }

    await db.task.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting task:', error)
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    )
  }
}