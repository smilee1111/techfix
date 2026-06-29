"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, ShoppingCart } from "lucide-react";

/* ─── Types ──────────────────────────────────────────────────────── */
interface NavLink {
  label: string;
  href: string;
}

interface NavbarProps {
  /** Controls which right-side actions render */
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
 * Highlights the active route automatically.
 */
export default function Navbar({ variant = "loggedOut" }: NavbarProps) {
  const pathname = usePathname();

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
          <Link href="/cart" className="navbar__cart" aria-label="Shopping cart">
            <ShoppingCart size={16} />
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
            /* Future: account menu for logged-in users */
            <Link href="/account" className="navbar__login-link">
              Account
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
