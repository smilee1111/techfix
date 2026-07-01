import Link from "next/link";

/* ─── Data ───────────────────────────────────────────────────────── */
interface FooterColumn {
  title: string;
  links: { label: string; href: string }[];
}

const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: "SERVICES",
    links: [
      { label: "Device Repair", href: "/repairs" },
      { label: "Price Calculator", href: "/estimate" },
      { label: "Track Order", href: "/track" },
    ],
  },
  {
    title: "PRODUCTS",
    links: [
      { label: "Certified Devices", href: "/products" },
      { label: "Spare Parts", href: "/products?category=parts" },
      { label: "Bulk Orders", href: "/products?category=bulk" },
    ],
  },
  {
    title: "SUPPORT",
    links: [
      { label: "Terms of Service", href: "/help/terms" },
      { label: "Privacy Policy", href: "/help/privacy" },
      { label: "Contact Support", href: "/help" },
      { label: "Store Locator", href: "/help/stores" },
    ],
  },
];

/* ─── Component ──────────────────────────────────────────────────── */
/**
 * Shared footer — zero business logic.
 * Matches Figma: 4-column layout with brand info + link columns.
 */
export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        {/* ── Brand column ── */}
        <div className="footer__brand">
          <span className="footer__logo">TechFix</span>
          <p className="footer__tagline">
            Professional hardware logistics and repair ecosystems.
          </p>
          <p className="footer__copyright">
            © {new Date().getFullYear()} TechFix Logistics. All rights reserved.
          </p>
        </div>

        {/* ── Link columns ── */}
        {FOOTER_COLUMNS.map((col) => (
          <div key={col.title} className="footer__column">
            <h3 className="footer__column-title">{col.title}</h3>
            <ul className="footer__link-list">
              {col.links.map((link) => (
                <li key={link.href + link.label}>
                  <Link href={link.href} className="footer__link">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </footer>
  );
}
