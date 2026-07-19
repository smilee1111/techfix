"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, ShoppingCart } from "lucide-react";
import { getValidAccessToken } from "@/lib/session";
import { useAuth } from "@/features/auth/hooks/useAuth";

/* ─── Types ──────────────────────────────────────────────────────── */
interface NavLink {
  label: string;
  href: string;
}

interface NavbarProps {
  /**
   * Forces a variant instead of checking the real session — only use this
   * for pages an authenticated user can never legitimately reach (e.g. the
   * login form itself). Omit it everywhere else so the navbar reflects the
   * actual session.
   */
  variant?: "loggedOut" | "loggedIn";
}

/* ─── Data ───────────────────────────────────────────────────────── */
const NAV_LINKS: NavLink[] = [
  { label: "Repairs", href: "/repairs" },
  { label: "Buy Products", href: "/products" },
  { label: "Track", href: "/track" },
  { label: "Help", href: "/help" },
];

/* ─── Component ──────────────────────────────────────────────────── */
/**
 * Shared sticky navbar — zero business logic.
 * Highlights the active route automatically. When `variant` isn't forced,
 * derives logged-in/out state from the real auth cookie rather than
 * trusting the page to know the visitor's session.
 */
export default function Navbar({ variant: forcedVariant }: NavbarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [detectedVariant, setDetectedVariant] = useState<"loggedOut" | "loggedIn">("loggedOut");

  useEffect(() => {
    if (forcedVariant) return;

    let cancelled = false;
    getValidAccessToken().then((token) => {
      if (!cancelled) setDetectedVariant(token ? "loggedIn" : "loggedOut");
    });
    return () => {
      cancelled = true;
    };
  }, [forcedVariant]);

  const variant = forcedVariant ?? detectedVariant;

  return (
    <header className="navbar">
      <div className="navbar__inner">
        {/* ── Left: Logo + Navigation ── */}
        <div className="navbar__left">
          <Link href="/" className="navbar__logo">
            TechFix
          </Link>

          <nav className="navbar__nav" aria-label="Main navigation">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`navbar__link ${
                  pathname.startsWith(link.href) ? "navbar__link--active" : ""
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* ── Right: Search + Actions ── */}
        <div className="navbar__right">
          {/* Search bar */}
          <div className="navbar__search">
            <Search size={14} className="navbar__search-icon" aria-hidden />
            <span className="navbar__search-placeholder">
              Search devices, services...
            </span>
          </div>

          {/* Cart icon */}
          <Link href="/cart" className="navbar__cart" aria-label="Shopping cart with 2 items">
            <ShoppingCart size={16} />
            <span className="navbar__cart-badge">2</span>
          </Link>

          {variant === "loggedOut" ? (
            <>
              <Link href="/login" className="navbar__login-link">
                Log In
              </Link>
              <Link href="/login" className="navbar__cta">
                Get Started
              </Link>
            </>
          ) : (
            <>
              <Link href="/account" className="navbar__login-link">
                Account
              </Link>
              <button
                type="button"
                onClick={logout}
                className="navbar__login-link navbar__logout-btn"
              >
                Log Out
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
