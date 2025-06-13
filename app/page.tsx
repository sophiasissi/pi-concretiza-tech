"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { EyeIcon, EyeOffIcon } from "lucide-react"
import styles from "./login/login-page.module.css"

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  })
  const [isMobile, setIsMobile] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    handleResize()

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Falha na autenticação")
      }

      localStorage.setItem("user", JSON.stringify(data.user))
      router.push("/home")
    } catch (error) {
      console.error("Login error:", error)
      setError((error as Error).message || "Falha na autenticação. Verifique suas credenciais.")
    } finally {
      setIsLoading(false)
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <div className={styles.container}>
      <div className={`${styles.formSection} ${isMobile ? styles.mobile : ""}`}>
        <Card className={styles.card}>
          <CardHeader className={styles.cardHeader}>
            <CardTitle className={styles.cardTitle}>Entrar</CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className={styles.cardContent}>
              {error && <div className={styles.errorMessage}>{error}</div>}
              <div className={styles.formGroup}>
                <Label htmlFor="username" className={styles.label}>
                  Usuário
                </Label>
                <Input
                  id="username"
                  name="username"
                  placeholder="Insira o usuário"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  className={styles.input}
                />
              </div>
              <div className={styles.formGroup}>
                <Label htmlFor="password" className={styles.label}>
                  Senha
                </Label>
                <div className={styles.passwordContainer}>
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Insira sua senha"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className={styles.input}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={styles.toggleButton}
                    onClick={togglePasswordVisibility}
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  >
                    {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className={styles.cardFooter}>
              <Button type="submit" className={styles.loginButton} disabled={isLoading}>
                {isLoading ? "Entrando..." : "Entrar"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
      <div className={styles.imageSection}>
        <div className={styles.imageContainer}>
          <img src="/logo-concretiza.jpg" alt="Welcome illustration" className={styles.image} />
        </div>
      </div>

      {isMobile && (
        <div className={styles.mobileImageSection}>
          <img src="/placeholder.svg?height=200&width=200" alt="Welcome illustration" className={styles.mobileImage} />
        </div>
      )}
    </div>
  )
}