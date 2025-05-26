"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import HeaderWithIcons from "../../components/header-with-icons"
import styles from "./register-users.module.css"
import { ArrowLeft } from "lucide-react"

// Update the interface to match the simplified form
interface UserFormData {
  nomeCompleto: string
  usuario: string
  senha: string
  administrador: boolean
}

export default function RegisterUsersPage() {
  const router = useRouter()

  useEffect(() => {
    // Check if user is admin
    try {
      const userData = localStorage.getItem("user")
      if (userData) {
        const user = JSON.parse(userData)
        if (!user.isAdmin) {
          // Redirect non-admin users to home page
          router.push("/home")
        }
      } else {
        // No user data found, redirect to login
        router.push("/")
      }
    } catch (error) {
      console.error("Error checking admin status:", error)
      router.push("/home")
    }
  }, [router])

  // Update the useState initialization
  const [formData, setFormData] = useState<UserFormData>({
    nomeCompleto: "",
    usuario: "",
    senha: "",
    administrador: false,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleBack = () => {
    router.push("/home")
  }

  // Update the handleChange function to handle checkbox
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  // Update the handleSubmit function to clarify database interaction
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Falha ao cadastrar usuário")
      }

      // Reset form after successful submission
      setFormData({
        nomeCompleto: "",
        usuario: "",
        senha: "",
        administrador: false,
      })

      setSuccess(data.message || "Usuário cadastrado com sucesso!")
    } catch (err) {
      console.error("Failed to register user:", err)
      setError((err as Error).message || "Falha ao cadastrar usuário. Por favor, tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <HeaderWithIcons />
      <main className={styles.content}>
        <div className={styles.titleContainer}>
          <button className={styles.backButton} onClick={handleBack} aria-label="Voltar para a página inicial">
            <ArrowLeft />
          </button>
          <h1 className={styles.title}>Cadastre um novo Usuário!</h1>
        </div>

        <div className={styles.formContainer}>
          <form onSubmit={handleSubmit} className={styles.form}>
            {error && <div className={styles.errorMessage}>{error}</div>}
            {success && <div className={styles.successMessage}>{success}</div>}

            <div className={styles.formGroup}>
              <label htmlFor="nomeCompleto" className={styles.label}>
                Nome Completo
              </label>
              <input
                type="text"
                id="nomeCompleto"
                name="nomeCompleto"
                value={formData.nomeCompleto}
                onChange={handleChange}
                required
                className={styles.input}
                placeholder="Digite o nome completo"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="usuario" className={styles.label}>
                Usuário
              </label>
              <input
                type="text"
                id="usuario"
                name="usuario"
                value={formData.usuario}
                onChange={handleChange}
                required
                className={styles.input}
                placeholder="Digite o nome de usuário"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="senha" className={styles.label}>
                Senha
              </label>
              <input
                type="password"
                id="senha"
                name="senha"
                value={formData.senha}
                onChange={handleChange}
                required
                className={styles.input}
                placeholder="Digite a senha"
                minLength={6}
              />
            </div>

            <div className={styles.checkboxContainer}>
              <div className={styles.checkboxWrapper}>
                <input
                  type="checkbox"
                  id="administrador"
                  name="administrador"
                  checked={formData.administrador}
                  onChange={handleChange}
                  className={styles.checkbox}
                />
                <label htmlFor="administrador" className={styles.checkboxLabel}>
                  Administrador
                </label>
              </div>
            </div>

            <div className={styles.formActions}>
              <button type="submit" className={styles.submitButton} disabled={isLoading}>
                {isLoading ? "Cadastrando..." : "Cadastrar Usuário"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}