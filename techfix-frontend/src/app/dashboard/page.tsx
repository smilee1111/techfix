import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Dashboard — TechFix",
  description:
    " Nepal's trusted platform for device repairs, certified tech products, and repair tracking. Welcome back to your TechFix dashboard.",
};

/**
 * Server-side Rendered (SSR) User Dashboard page.
 * Rendered when the user is logged in. Composes layouts and service options
 * with the logged-in navbar variant.
 * Contains zero business logic per the separation of concerns guidelines.
 */
export default function DashboardPage() {
  return (
    <>
      {/* Sticky top navbar — reflects the real session */}
      <Navbar />

      {/* Main content wrapper */}
      <main className="flex-1 flex flex-col justify-start items-center">
        <section className="home" aria-labelledby="dashboard-title">
          {/* Hero Section */}
          <div className="home__hero">
            <div className="home__hero-header">
              <h1 id="dashboard-title" className="home__hero-title">
                Tech repair, done right.
              </h1>
              <p className="home__hero-subtitle">
                Find certified repair services, get instant price estimates, or shop verified devices.
              </p>
            </div>

            {/* Search database */}
            <div className="home__search-wrapper">
              <span className="home__search-label">SEARCH DATABASE</span>
              <div className="home__search-bar">
                <span className="home__search-dot" aria-hidden="true" />
                <input
                  type="search"
                  id="dashboard-search-input"
                  placeholder="Search device or problem..."
                  className="home__search-input"
                  aria-label="Search devices or problems"
                />
              </div>
            </div>
          </div>

          {/* Services grid (Side-by-side) */}
          <div className="home__services-grid">
            {/* Service 01: Repair Device */}
            <article className="home__service-card" aria-labelledby="service-01-title">
              <div className="home__service-header">
                <span className="home__service-tag">SERVICE_01</span>
                <h2 id="service-01-title" className="home__service-title">
                  Repair Device
                </h2>
                <p className="home__service-desc">
                  Book a certified technician for screen, battery, or hardware repairs with transparent pricing.
                </p>
              </div>
              <div className="home__service-footer">
                {/* 56x56 square icon box */}
                <div className="home__service-icon-box home__service-icon-box--blue" aria-hidden="true">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                  </svg>
                </div>
                <Link href="/repairs" className="home__service-btn" id="btn-book-repair">
                  Book Repair &rarr;
                </Link>
              </div>
            </article>

            {/* Service 02: Get Price Estimate */}
            <article className="home__service-card" aria-labelledby="service-02-title">
              <div className="home__service-header">
                <span className="home__service-tag">SERVICE_02</span>
                <h2 id="service-02-title" className="home__service-title">
                  Get Price Estimate
                </h2>
                <p className="home__service-desc">
                  Answer a few quick questions and get an instant, no-obligation repair cost estimate.
                </p>
              </div>
              <div className="home__service-footer">
                {/* 56x56 square icon box */}
                <div className="home__service-icon-box home__service-icon-box--cyan" aria-hidden="true">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="1" x2="12" y2="23" />
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                </div>
                <Link href="/estimate" className="home__service-btn" id="btn-get-estimate">
                  Get Estimate &rarr;
                </Link>
              </div>
            </article>
          </div>

          {/* Store Section (Full width card) */}
          <article className="home__store-card" aria-labelledby="store-title">
            <div className="home__store-content">
              <span className="home__store-tag">STORE_01</span>
              <h2 id="store-title" className="home__store-title">
                Buy Products
              </h2>
              <p className="home__store-desc">
                Explore our curated selection of certified pre-owned devices and high-quality replacement parts.
              </p>
              <div className="home__store-actions">
                <Link href="/products" className="home__store-btn-primary" id="btn-browse-devices">
                  Browse Devices
                </Link>
                <Link href="/products?category=parts" className="home__store-btn-secondary" id="btn-shop-parts">
                  Shop Spare Parts
                </Link>
              </div>
            </div>
            {/* Right Side: Product Imagery */}
            <div className="home__store-image-box">
              <Image
                src="/product-imagery.png"
                alt="Curated certified tech devices including smartphone, laptop, smartwatch and wireless earbuds"
                width={420}
                height={320}
                className="home__store-image"
                priority
              />
            </div>
          </article>

          {/* Horizontal separator */}
          <div className="home__divider" aria-hidden="true" />
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </>
  );
}
