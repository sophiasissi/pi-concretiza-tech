import { NextResponse } from "next/server"
import { cookies } from "next/headers"

// This is a placeholder API route for authentication
// In a real application, you would connect to a database and use proper authentication

interface LoginRequest {
  username: string
  password: string
}

export async function POST(request: Request) {
  try {
    const data: LoginRequest = await request.json()

    // In a real application, you would:
    // 1. Validate the credentials against your database
    // 2. Check if the password matches (using bcrypt or similar)
    // 3. Generate a JWT token or session

    // For demonstration purposes, we're using mock data
    // In production, NEVER hardcode credentials like this
    const mockUsers = [
      { username: "admin", password: "admin123", isAdmin: true },
      { username: "user", password: "user123", isAdmin: false },
    ]

    const user = mockUsers.find((u) => u.username === data.username)

    if (!user || user.password !== data.password) {
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 })
    }

    // Create a session token (in a real app, use JWT or similar)
    const sessionToken = Buffer.from(
      JSON.stringify({
        username: user.username,
        isAdmin: user.isAdmin,
        exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      }),
    ).toString("base64")

    // Set a cookie with the session token
    cookies().set({
      name: "session",
      value: sessionToken,
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24, // 1 day
      sameSite: "strict",
    })

    return NextResponse.json({
      success: true,
      user: {
        username: user.username,
        isAdmin: user.isAdmin,
      },
    })
  } catch (error) {
    console.error("Authentication error:", error)
    return NextResponse.json({ error: "Falha na autenticação" }, { status: 500 })
  }
}

// Logout endpoint
export async function DELETE() {
  cookies().delete("session")
  return NextResponse.json({ success: true })
}
