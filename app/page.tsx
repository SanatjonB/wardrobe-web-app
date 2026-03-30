import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { SmartBrand } from "@/components/smart-brand";
import { Suspense } from "react";
import Link from "next/link";
import "./page.css";

export default function Home() {
  return (
    <main className="page">
      <div className="container">
        <nav className="nav">
          <SmartBrand />

          <div className="nav-right">
            <Link href="/contact" className="nav-link">
              Contact
            </Link>
            <Suspense fallback={null}>
              <AuthButton />
            </Suspense>
            <ThemeSwitcher />
          </div>
        </nav>

        <section className="hero">
          <p className="kicker">Your closet, organized.</p>
          <h1 className="headline">
            Stop losing time looking for outfits.
            <br />
            Keep your wardrobe searchable and clean.
          </h1>
          <p className="subhead">
            ClosetIQ helps you track what you own, plan fits faster, and keep
            your space under control.
          </p>

          <div className="hero-actions">
            <Suspense fallback={null}>
              <AuthButton />
            </Suspense>
          </div>

          <div className="stats">
            <div className="stat">
              <div className="stat-num">1 min</div>
              <div className="stat-label">find an outfit</div>
            </div>
            <div className="stat">
              <div className="stat-num">0</div>
              <div className="stat-label">duplicate buys</div>
            </div>
            <div className="stat">
              <div className="stat-num">100%</div>
              <div className="stat-label">closet clarity</div>
            </div>
          </div>
        </section>

        <footer className="footer">
          © 2026 ClosetIQ. All rights reserved.
        </footer>
      </div>
    </main>
  );
}
