"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Header from "../../components/header"
import styles from "./home-page.module.css"
import { Building2, FileSpreadsheet, Users } from "lucide-react"

export default function HomePage() {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    try {
      const userData = localStorage.getItem("user")
      if (userData) {
        const user = JSON.parse(userData)
        setIsAdmin(user.isAdmin === true)
      }
    } catch (error) {
      console.error("Error checking admin status:", error)
      setIsAdmin(false)
    }
  }, [])

  const handleNavigate = (path: string) => {
    router.push(path)
  }

  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.content}>
        <h1 className={styles.title}>
          Transformando dados em decisões: acompanhe obras, clientes e orçamentos em um só lugar.
        </h1>

        <div className={styles.buttonsContainer}>
          <button className={styles.featureButton} onClick={() => handleNavigate("/visualize-data")}>
            <div className={styles.featureIcon}>
              <Building2 size={50} color="#323268" />
            </div>
            <h2 className={styles.featureTitle}>Visualize Dados</h2>
          </button>

          <button className={styles.featureButton} onClick={() => handleNavigate("/build-budgets")}>
            <div className={styles.featureIcon}>
              <FileSpreadsheet size={50} color="#323268" />
            </div>
            <h2 className={styles.featureTitle}>Construa Orçamentos</h2>
          </button>

          {isAdmin && (
            <button className={styles.featureButton} onClick={() => handleNavigate("/register-users")}>
              <div className={styles.featureIcon}>
                <Users size={50} color="#323268" />
              </div>
              <h2 className={styles.featureTitle}>Cadastre novos usuários</h2>
            </button>
          )}
        </div>
      </main>
    </div>
  )
}