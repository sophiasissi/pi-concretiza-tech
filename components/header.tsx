"use client"

import styles from "../header.module.css"
import { useRouter } from "next/navigation"

export default function Header() {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await fetch("/api/auth", {
        method: "DELETE",
      })
      localStorage.removeItem("user")

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
