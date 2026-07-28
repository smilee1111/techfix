import Link from "next/link";

/* ─── Data ───────────────────────────────────────────────────────── */
interface FooterColumn {
  title: string;
  /** A link without an href is a planned destination, rendered as muted
   *  text rather than a link into a 404. */
  links: { label: string; href?: string }[];
}

const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: "SERVICES",
    links: [
      { label: "Device Repair", href: "/repairs" },
      { label: "Price Calculator", href: "/estimate" },
      { label: "My Repairs", href: "/my-repairs" },
    ],
  },
  {
    title: "PRODUCTS",
    links: [
      { label: "Browse Products", href: "/products" },
      { label: "Compare Sellers", href: "/products" },
      { label: "Cart", href: "/cart" },
    ],
  },
  {
    title: "SUPPORT",
    links: [
      { label: "Terms of Service" },
      { label: "Privacy Policy" },
      { label: "Contact Support" },
      { label: "Store Locator" },
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
                <li key={link.label}>
                  {link.href ? (
                    <Link href={link.href} className="footer__link">
                      {link.label}
                    </Link>
                  ) : (
                    <span className="footer__link footer__link--pending">{link.label}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </footer>
  );
}
