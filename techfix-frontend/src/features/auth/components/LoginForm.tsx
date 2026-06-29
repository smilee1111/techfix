"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { initiateOAuthLogin } from "@/features/auth/api/authApi";

/* ─── Component ──────────────────────────────────────────────────── */
/**
 * Login form — feature-specific UI living in features/auth/components.
 * Uses the useAuth hook for submission. Never calls APIs directly.
 */
export default function LoginForm() {
  const { isLoading, error, login, clearError } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  /* ── Client-side validation ── */
  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  function validate(): boolean {
    const errors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Enter a valid email address";
    }

    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    clearError();

    if (!validate()) return;

    await login({ email: email.trim(), password });
  }

  return (
    <section className="login" aria-labelledby="login-heading">
      {/* Brand mark above card */}
      <span className="login__brand">TechFix</span>

      {/* ── Card ── */}
      <div className="login__card">
        {/* Header */}
        <div className="login__header">
          <h1 id="login-heading" className="login__title">
            Welcome Back
          </h1>
          <p className="login__subtitle">
            Access your tech dashboard and repair status.
          </p>
        </div>

        {/* Server / API error */}
        {error && (
          <div className="login__error" role="alert">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="login__form">
          {/* ── Email field ── */}
          <div className="login__field">
            <label htmlFor="login-email" className="login__label">
              EMAIL ADDRESS
            </label>
            <div
              className={`login__input-wrapper ${
                validationErrors.email ? "login__input-wrapper--error" : ""
              }`}
            >
              <Mail size={16} className="login__input-icon" aria-hidden />
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (validationErrors.email) {
                    setValidationErrors((prev) => ({ ...prev, email: undefined }));
                  }
                }}
                className="login__input"
                aria-invalid={!!validationErrors.email}
                aria-describedby={
                  validationErrors.email ? "login-email-error" : undefined
                }
              />
            </div>
            {validationErrors.email && (
              <span id="login-email-error" className="login__field-error">
                {validationErrors.email}
              </span>
            )}
          </div>

          {/* ── Password field ── */}
          <div className="login__field">
            <div className="login__label-row">
              <label htmlFor="login-password" className="login__label">
                PASSWORD
              </label>
              <Link href="/forgot-password" className="login__forgot" tabIndex={-1}>
                Forgot Password?
              </Link>
            </div>
            <div
              className={`login__input-wrapper ${
                validationErrors.password ? "login__input-wrapper--error" : ""
              }`}
            >
              <Lock size={16} className="login__input-icon" aria-hidden />
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (validationErrors.password) {
                    setValidationErrors((prev) => ({
                      ...prev,
                      password: undefined,
                    }));
                  }
                }}
                className="login__input"
                aria-invalid={!!validationErrors.password}
                aria-describedby={
                  validationErrors.password ? "login-password-error" : undefined
                }
              />
              <button
                type="button"
                className="login__eye-toggle"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff size={16} aria-hidden />
                ) : (
                  <Eye size={16} aria-hidden />
                )}
              </button>
            </div>
            {validationErrors.password && (
              <span id="login-password-error" className="login__field-error">
                {validationErrors.password}
              </span>
            )}
          </div>

          {/* ── Submit ── */}
          <button
            type="submit"
            className="login__submit"
            disabled={isLoading}
            id="login-submit-btn"
          >
            {isLoading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        {/* ── Divider ── */}
        <div className="login__divider">
          <span className="login__divider-line" />
          <span className="login__divider-text">OR CONTINUE WITH</span>
          <span className="login__divider-line" />
        </div>

        {/* ── Social buttons ── */}
        <div className="login__social">
          <button
            type="button"
            className="login__social-btn"
            onClick={() => initiateOAuthLogin("google")}
            aria-label="Continue with Google"
          >
            {/* Google "G" SVG */}
            <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden>
              <path
                d="M19.6 10.23c0-.68-.06-1.36-.17-2.02H10v3.84h5.38a4.6 4.6 0 0 1-2 3.02v2.5h3.24c1.89-1.74 2.98-4.3 2.98-7.34z"
                fill="#4285F4"
              />
              <path
                d="M10 20c2.7 0 4.96-.9 6.62-2.43l-3.24-2.5c-.9.6-2.04.95-3.38.95-2.6 0-4.8-1.76-5.58-4.12H1.07v2.58A9.99 9.99 0 0 0 10 20z"
                fill="#34A853"
              />
              <path
                d="M4.42 11.9a6 6 0 0 1 0-3.8V5.52H1.07a9.99 9.99 0 0 0 0 8.96l3.35-2.58z"
                fill="#FBBC05"
              />
              <path
                d="M10 3.98a5.42 5.42 0 0 1 3.83 1.5l2.87-2.87A9.64 9.64 0 0 0 10 0 9.99 9.99 0 0 0 1.07 5.52l3.35 2.58C5.2 5.74 7.4 3.98 10 3.98z"
                fill="#EA4335"
              />
            </svg>
          </button>

          <button
            type="button"
            className="login__social-btn"
            onClick={() => initiateOAuthLogin("facebook")}
            aria-label="Continue with Facebook"
          >
            {/* Facebook "f" SVG */}
            <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden>
              <circle cx="10" cy="10" r="10" fill="#1877F2" />
              <path
                d="M13.54 12.78l.47-3.08h-2.95V7.77c0-.84.41-1.67 1.74-1.67h1.35V3.38s-1.22-.21-2.39-.21c-2.44 0-4.04 1.48-4.04 4.16V9.7H5.08v3.08h2.64v7.44a10.5 10.5 0 0 0 3.26 0v-7.44h2.56z"
                fill="#fff"
              />
            </svg>
          </button>
        </div>

        {/* ── Sign-up link ── */}
        <p className="login__signup-prompt">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="login__signup-link">
            Create an account
          </Link>
        </p>
      </div>
    </section>
  );
}
