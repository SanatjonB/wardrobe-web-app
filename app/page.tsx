import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Suspense } from "react";
import "./page.css";
export default function Home() {
  return (
    <main className="page">
      <div className="container">
        <nav className="nav">
          <div className="brand">
            <div className="logo-dot" />
            <span>ClosetIQ</span>
          </div>

          <div className="nav-right">
            <Suspense>
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
            <Suspense>
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
