"use client"

import styles from "../header.module.css"
import { useRouter } from "next/navigation"

export default function Header() {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      // Call the logout API endpoint
      await fetch("/api/auth", {
        method: "DELETE",
      })

      // Clear user data from localStorage
      localStorage.removeItem("user")

      // Redirect to login page
      router.push("/")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <div className={styles.logo}>ConcretizaTech</div>
        <button className={styles.logoutButton} onClick={handleLogout} aria-label="Sair da aplicação">
          Sair
        </button>
      </div>
    </header>
  )
}
