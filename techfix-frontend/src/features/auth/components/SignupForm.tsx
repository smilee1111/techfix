"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { User, Mail, Phone, Lock, Eye, EyeOff, ChevronDown } from "lucide-react";
import { useSignup } from "@/features/auth/hooks/useSignup";
import { initiateOAuthLogin } from "@/features/auth/api/authApi";

/* ─── Types ──────────────────────────────────────────────────────── */
type UserRole = "customer" | "seller";

interface ValidationErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  password?: string;
}

/* ─── Component ──────────────────────────────────────────────────── */
/**
 * Signup form — feature-specific UI living in features/auth/components.
 * Uses the useSignup hook for submission. Never calls APIs directly.
 */
export default function SignupForm() {
  const { isLoading, error, signup, clearError } = useSignup();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("customer");
  const [showPassword, setShowPassword] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  /* ── Validation ── */
  function validate(): boolean {
    const errors: ValidationErrors = {};

    if (!fullName.trim()) {
      errors.fullName = "Full name is required";
    } else if (fullName.trim().length < 2) {
      errors.fullName = "Name must be at least 2 characters";
    }

    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Enter a valid email address";
    }

    if (!phone.trim()) {
      errors.phone = "Phone number is required";
    } else if (!/^[+]?[\d\s()-]{7,20}$/.test(phone)) {
      errors.phone = "Enter a valid phone number";
    }

    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }

  /* ── Clear individual field error on change ── */
  function clearFieldError(field: keyof ValidationErrors) {
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }

  /* ── Submit ── */
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    clearError();

    if (!validate()) return;

    await signup({
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      password,
      role,
    });
  }

  return (
    <section className="signup" aria-labelledby="signup-heading">
      {/* Brand mark above card */}
      <span className="signup__brand">TechFix</span>

      {/* ── Card ── */}
      <div className="signup__card">
        {/* Header */}
        <div className="signup__header">
          <h1 id="signup-heading" className="signup__title">
            Create Account
          </h1>
          <p className="signup__subtitle">
            Join TechFix to book repairs and shop devices.
          </p>
        </div>

        {/* Server / API error */}
        {error && (
          <div className="signup__error" role="alert">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="signup__form">
          {/* ── Full Name ── */}
          <div className="signup__field">
            <label htmlFor="signup-fullname" className="signup__label">
              FULL NAME
            </label>
            <div
              className={`signup__input-wrapper ${
                validationErrors.fullName ? "signup__input-wrapper--error" : ""
              }`}
            >
              <User size={16} className="signup__input-icon" aria-hidden />
              <input
                id="signup-fullname"
                type="text"
                autoComplete="name"
                placeholder="Jane Smith"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  clearFieldError("fullName");
                }}
                className="signup__input"
                aria-invalid={!!validationErrors.fullName}
                aria-describedby={
                  validationErrors.fullName ? "signup-fullname-error" : undefined
                }
              />
            </div>
            {validationErrors.fullName && (
              <span id="signup-fullname-error" className="signup__field-error">
                {validationErrors.fullName}
              </span>
            )}
          </div>

          {/* ── Email ── */}
          <div className="signup__field">
            <label htmlFor="signup-email" className="signup__label">
              EMAIL ADDRESS
            </label>
            <div
              className={`signup__input-wrapper ${
                validationErrors.email ? "signup__input-wrapper--error" : ""
              }`}
            >
              <Mail size={16} className="signup__input-icon" aria-hidden />
              <input
                id="signup-email"
                type="email"
                autoComplete="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  clearFieldError("email");
                }}
                className="signup__input"
                aria-invalid={!!validationErrors.email}
                aria-describedby={
                  validationErrors.email ? "signup-email-error" : undefined
                }
              />
            </div>
            {validationErrors.email && (
              <span id="signup-email-error" className="signup__field-error">
                {validationErrors.email}
              </span>
            )}
          </div>

          {/* ── Phone Number ── */}
          <div className="signup__field">
            <label htmlFor="signup-phone" className="signup__label">
              PHONE NUMBER
            </label>
            <div
              className={`signup__input-wrapper ${
                validationErrors.phone ? "signup__input-wrapper--error" : ""
              }`}
            >
              <Phone size={16} className="signup__input-icon" aria-hidden />
              <input
                id="signup-phone"
                type="tel"
                autoComplete="tel"
                placeholder="+1 (555) 000-0000"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  clearFieldError("phone");
                }}
                className="signup__input"
                aria-invalid={!!validationErrors.phone}
                aria-describedby={
                  validationErrors.phone ? "signup-phone-error" : undefined
                }
              />
            </div>
            {validationErrors.phone && (
              <span id="signup-phone-error" className="signup__field-error">
                {validationErrors.phone}
              </span>
            )}
          </div>

          {/* ── Password ── */}
          <div className="signup__field">
            <label htmlFor="signup-password" className="signup__label">
              PASSWORD
            </label>
            <div
              className={`signup__input-wrapper ${
                validationErrors.password ? "signup__input-wrapper--error" : ""
              }`}
            >
              <Lock size={16} className="signup__input-icon" aria-hidden />
              <input
                id="signup-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  clearFieldError("password");
                }}
                className="signup__input"
                aria-invalid={!!validationErrors.password}
                aria-describedby={
                  validationErrors.password ? "signup-password-error" : undefined
                }
              />
              <button
                type="button"
                className="signup__eye-toggle"
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
              <span id="signup-password-error" className="signup__field-error">
                {validationErrors.password}
              </span>
            )}
          </div>

          {/* ── Role selector ── */}
          <div className="signup__field">
            <label className="signup__label">I AM SIGNING UP AS</label>

            {/* Dropdown trigger */}
            <button
              type="button"
              className="signup__role-dropdown"
              onClick={() => setShowRoleDropdown((v) => !v)}
              aria-expanded={showRoleDropdown}
              aria-haspopup="listbox"
            >
              <span className="signup__role-value">
                {role === "customer" ? "Customer" : "Seller"}
              </span>
              <ChevronDown
                size={16}
                className={`signup__role-chevron ${
                  showRoleDropdown ? "signup__role-chevron--open" : ""
                }`}
                aria-hidden
              />
            </button>

            {/* Toggle buttons */}
            <div className="signup__role-toggles" role="radiogroup" aria-label="Account type">
              <button
                type="button"
                role="radio"
                aria-checked={role === "customer"}
                className={`signup__role-btn ${
                  role === "customer" ? "signup__role-btn--active" : ""
                }`}
                onClick={() => {
                  setRole("customer");
                  setShowRoleDropdown(false);
                }}
              >
                Customer
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={role === "seller"}
                className={`signup__role-btn ${
                  role === "seller" ? "signup__role-btn--active" : ""
                }`}
                onClick={() => {
                  setRole("seller");
                  setShowRoleDropdown(false);
                }}
              >
                Seller
              </button>
            </div>
          </div>

          {/* ── Submit ── */}
          <button
            type="submit"
            className="signup__submit"
            disabled={isLoading}
            id="signup-submit-btn"
          >
            {isLoading ? "Creating account…" : "Create Account"}
          </button>
        </form>

        {/* ── Divider ── */}
        <div className="signup__divider">
          <span className="signup__divider-line" />
          <span className="signup__divider-text">OR CONTINUE WITH</span>
          <span className="signup__divider-line" />
        </div>

        {/* ── Social buttons ── */}
        <div className="signup__social">
          <button
            type="button"
            className="signup__social-btn"
            onClick={() => initiateOAuthLogin("google")}
            aria-label="Continue with Google"
          >
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
            className="signup__social-btn"
            onClick={() => initiateOAuthLogin("facebook")}
            aria-label="Continue with Facebook"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden>
              <circle cx="10" cy="10" r="10" fill="#1877F2" />
              <path
                d="M13.54 12.78l.47-3.08h-2.95V7.77c0-.84.41-1.67 1.74-1.67h1.35V3.38s-1.22-.21-2.39-.21c-2.44 0-4.04 1.48-4.04 4.16V9.7H5.08v3.08h2.64v7.44a10.5 10.5 0 0 0 3.26 0v-7.44h2.56z"
                fill="#fff"
              />
            </svg>
          </button>
        </div>

        {/* ── Sign-in link ── */}
        <p className="signup__signin-prompt">
          Already have an account?{" "}
          <Link href="/login" className="signup__signin-link">
            Sign in
          </Link>
        </p>
      </div>
    </section>
  );
}
