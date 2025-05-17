import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "@/components/ui/label";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import styles from "./login-page.module.css";

interface LoginFormData {
  username: string;
  password: string;
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<LoginFormData>({
    username: "",
    password: "",
  });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Login attempt with:", formData);
  };

  const togglePasswordVisibility = () => {
    setShowPassword((v) => !v);
  };

  return (
    <div className={styles.container}>
      {/* Form */}
      <div
        className={`${styles.formSection} ${
          isMobile ? styles.mobile : ""
        }`}
      >
        <Card className={styles.card}>
          <CardHeader className={styles.cardHeader}>
            <CardTitle className={styles.cardTitle}>Login</CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className={styles.cardContent}>
              <div className={styles.formGroup}>
                <Label htmlFor="username" className={styles.label}>
                  Username
                </Label>
                <Input
                  id="username"
                  name="username"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  className={styles.input}
                />
              </div>
              <div className={styles.formGroup}>
                <Label htmlFor="password" className={styles.label}>
                  Password
                </Label>
                <div className={styles.passwordContainer}>
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
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
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOffIcon className="h-4 w-4" />
                    ) : (
                      <EyeIcon className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className={styles.cardFooter}>
              <Button type="submit" className={styles.loginButton}>
                Login
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>

      {/* Desktop image */}
      <div className={styles.imageSection}>
        <div className={styles.imageContainer}>
          <img
            src="/placeholder.svg?height=400&width=400"
            alt="Welcome illustration"
            className={styles.image}
          />
        </div>
      </div>

      {/* Mobile image */}
      {isMobile && (
        <div className={styles.mobileImageSection}>
          <img
            src="/placeholder.svg?height=200&width=200"
            alt="Welcome illustration"
            className={styles.mobileImage}
          />
        </div>
      )}
    </div>
);
}