"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { useResetPassword } from "@/features/auth/hooks/useResetPassword";

/**
 * Reset password completion form — reached via the emailed reset link
 * (?token=...). Uses the useResetPassword hook for submission.
 */
export default function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const { isLoading, error, successMessage, submit } = useResetPassword();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState<string | undefined>();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (newPassword.length < 8) {
      setValidationError("Password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setValidationError("Passwords do not match");
      return;
    }
    setValidationError(undefined);

    await submit(token, newPassword);
  }

  if (!token) {
    return (
      <section className="fp" aria-labelledby="rp-heading">
        <div className="fp__stack">
          <div className="fp__icon" aria-hidden>
            ⚠️
          </div>
          <div className="fp__head">
            <h1 id="rp-heading" className="fp__title">
              Invalid Reset Link
            </h1>
            <p className="fp__subtitle">
              This reset link is missing or invalid. Please request a new one.
            </p>
          </div>
          <div className="fp__card">
            <Link href="/forgot-password" className="fp__submit" style={{ textAlign: "center", textDecoration: "none", display: "block" }}>
              Request New Link
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="fp" aria-labelledby="rp-heading">
      <div className="fp__stack">
        <div className="fp__icon" aria-hidden>
          🔒
        </div>

        <div className="fp__head">
          <h1 id="rp-heading" className="fp__title">
            Set New Password
          </h1>
          <p className="fp__subtitle">Choose a new password for your account.</p>
        </div>

        <div className="fp__card">
          {successMessage && (
            <div className="fp__success" role="status">
              {successMessage} Redirecting to sign in…
            </div>
          )}
          {error && (
            <div className="fp__error" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label htmlFor="rp-new-password" className="fp__label">
                NEW PASSWORD
              </label>
              <div className="fp__input-wrapper" style={{ marginTop: 8 }}>
                <input
                  id="rp-new-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="fp__input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)", display: "flex" }}
                >
                  {showPassword ? <EyeOff size={16} aria-hidden /> : <Eye size={16} aria-hidden />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="rp-confirm-password" className="fp__label">
                CONFIRM PASSWORD
              </label>
              <div className="fp__input-wrapper" style={{ marginTop: 8 }}>
                <input
                  id="rp-confirm-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="fp__input"
                />
              </div>
              {validationError && <span className="fp__field-error">{validationError}</span>}
            </div>

            <button type="submit" className="fp__submit" disabled={isLoading} id="rp-submit-btn">
              {isLoading ? "Resetting…" : "Reset Password"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
