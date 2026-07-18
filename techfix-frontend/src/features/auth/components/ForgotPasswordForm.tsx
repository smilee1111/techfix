"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useForgotPassword } from "@/features/auth/hooks/useForgotPassword";

/**
 * Forgot password request form — feature-specific UI living in
 * features/auth/components. Uses the useForgotPassword hook for submission.
 */
export default function ForgotPasswordForm() {
  const { isLoading, error, successMessage, submit } = useForgotPassword();
  const [email, setEmail] = useState("");
  const [validationError, setValidationError] = useState<string | undefined>();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!email.trim()) {
      setValidationError("Email is required");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setValidationError("Enter a valid email address");
      return;
    }
    setValidationError(undefined);

    await submit(email.trim());
  }

  return (
    <section className="fp" aria-labelledby="fp-heading">
      <div className="fp__stack">
        <div className="fp__icon" aria-hidden>
          🔒
        </div>

        <div className="fp__head">
          <h1 id="fp-heading" className="fp__title">
            Reset Password
          </h1>
          <p className="fp__subtitle">
            Enter your email and we&apos;ll send a reset link to your inbox.
          </p>
        </div>

        <div className="fp__card">
          {successMessage && (
            <div className="fp__success" role="status">
              {successMessage}
            </div>
          )}
          {error && (
            <div className="fp__error" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label htmlFor="fp-email" className="fp__label">
                EMAIL ADDRESS
              </label>
              <div
                className={`fp__input-wrapper ${validationError ? "fp__input-wrapper--error" : ""}`}
                style={{ marginTop: 8 }}
              >
                <input
                  id="fp-email"
                  type="email"
                  autoComplete="email"
                  placeholder="Enter your registered email..."
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (validationError) setValidationError(undefined);
                  }}
                  className="fp__input"
                  aria-invalid={!!validationError}
                  aria-describedby={validationError ? "fp-email-error" : undefined}
                />
              </div>
              {validationError && (
                <span id="fp-email-error" className="fp__field-error">
                  {validationError}
                </span>
              )}
            </div>

            <button type="submit" className="fp__submit" disabled={isLoading} id="fp-submit-btn">
              {isLoading ? "Sending…" : "Send Reset Link"}
            </button>
          </form>

          <div className="fp__divider" />

          <div className="fp__back-row">
            <span className="fp__back-text">← Back to</span>
            <Link href="/login" className="fp__back-link">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
