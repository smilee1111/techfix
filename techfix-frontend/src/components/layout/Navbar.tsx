"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, ShoppingCart } from "lucide-react";
import { getValidAccessToken } from "@/lib/session";
import { getUserData } from "@/lib/cookie";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useCart } from "@/features/cart/CartProvider";

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
// Only routes that actually exist. "Track" and "Help" are still absent —
// they arrive with the support pages.
const NAV_LINKS: NavLink[] = [
  { label: "Repairs", href: "/repairs" },
  { label: "Buy Products", href: "/products" },
  { label: "Estimate", href: "/estimate" },
];

const LOGGED_IN_LINKS: NavLink[] = [{ label: "My Repairs", href: "/my-repairs" }];

/** Extra destinations a role unlocks. */
const ROLE_LINKS: Record<string, NavLink> = {
  seller: { label: "Seller Dashboard", href: "/seller/dashboard" },
  admin: { label: "Admin", href: "/admin" },
};

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
  const { totals, isReady } = useCart();
  const itemCount = totals.itemCount;
  const [detectedVariant, setDetectedVariant] = useState<"loggedOut" | "loggedIn">("loggedOut");
  const [role, setRole] = useState<string | null>(null);

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

  // The role drives which extra links appear. It is read from the
  // user_data cookie, which is a display concern only — every privileged
  // route is independently enforced by the backend.
  useEffect(() => {
    let cancelled = false;
    getUserData().then((data) => {
      if (!cancelled) setRole(typeof data?.role === "string" ? data.role : null);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const variant = forcedVariant ?? detectedVariant;

  const roleLink = role ? ROLE_LINKS[role] : undefined;
  const links: NavLink[] = [
    ...NAV_LINKS,
    ...(variant === "loggedIn" ? LOGGED_IN_LINKS : []),
    ...(variant === "loggedIn" && roleLink ? [roleLink] : []),
  ];

  return (
    <header className="navbar">
      <div className="navbar__inner">
        {/* ── Left: Logo + Navigation ── */}
        <div className="navbar__left">
          <Link href="/" className="navbar__logo">
            TechFix
          </Link>

          <nav className="navbar__nav" aria-label="Main navigation">
            {links.map((link) => (
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

          {/* Badge count comes from real cart state. It renders only once
              the stored cart has been read, so the number never flashes a
              wrong value during hydration. */}
          <Link
            href="/cart"
            className="navbar__cart"
            aria-label={
              itemCount > 0 ? `Shopping cart with ${itemCount} items` : "Shopping cart"
            }
          >
            <ShoppingCart size={16} />
            {isReady && itemCount > 0 && (
              <span className="navbar__cart-badge">{itemCount}</span>
            )}
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
