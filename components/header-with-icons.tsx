"use client"

import { useState, useEffect } from "react"
import { Building2, FileSpreadsheet, Users } from "lucide-react"
import styles from "../header.module.css"
import { useRouter } from "next/navigation"

export default function HeaderWithIcons() {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)

  // Check if user is admin on component mount
  useEffect(() => {
    const checkAdminStatus = () => {
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
    }

    checkAdminStatus()

    // Listen for storage events (in case user logs in/out in another tab)
    window.addEventListener("storage", checkAdminStatus)

    return () => {
      window.removeEventListener("storage", checkAdminStatus)
    }
  }, [])

  const handleNavigation = (path: string) => {
    router.push(path)
  }

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <div className={styles.logo}>ConcretizaTech</div>
        <div className={styles.iconsContainer}>
          <button
            className={styles.iconButton}
            onClick={() => handleNavigation("/visualize-data")}
            aria-label="Visualize Dados"
          >
            <Building2 size={24} />
          </button>
          <button
            className={styles.iconButton}
            onClick={() => handleNavigation("/build-budgets")}
            aria-label="Construa Orçamentos"
          >
            <FileSpreadsheet size={24} />
          </button>
          {isAdmin && (
            <button
              className={styles.iconButton}
              onClick={() => handleNavigation("/register-users")}
              aria-label="Cadastre novos usuários"
            >
              <Users size={24} />
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
