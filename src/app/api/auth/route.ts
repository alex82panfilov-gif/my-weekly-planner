import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST /api/auth - вход или регистрация пользователя
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { googleId, email, name } = body

    if (!googleId || !email || !name) {
      return NextResponse.json(
        { error: 'Google ID, email, and name are required' },
        { status: 400 }
      )
    }

    // Ищем пользователя по Google ID
    let user = await db.user.findUnique({
      where: { googleId }
    })

    if (!user) {
      // Если пользователя нет, создаем нового
      user = await db.user.create({
        data: {
          googleId,
          email,
          name,
          themePreference: 'light'
        }
      })
    }

    return NextResponse.json({
      user: {
        id: user.id,
        googleId: user.googleId,
        email: user.email,
        name: user.name,
        themePreference: user.themePreference
      }
    })
  } catch (error) {
    console.error('Error during authentication:', error)
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    )
  }
}