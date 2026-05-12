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
        {/* ── Nav ── */}
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

        {/* ── Hero ── */}
        <section className="hero">
          <p className="kicker">Your closet, organized.</p>
          <h1 className="headline">
            Stop losing time
            <br />
            looking for outfits.
          </h1>
          <p className="subhead">
            ClosetIQ helps you track what you own, plan fits faster, and keep
            your space under control — all for free.
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

        {/* ── What you can do ── */}
        <section className="lp-section">
          <p className="section-label">What you can do</p>
          <h2 className="section-title">Everything your wardrobe needs</h2>
          <div className="features-grid">
            <div className="feature-card">
              <span className="feature-icon">📦</span>
              <h3 className="feature-title">Track every item</h3>
              <p className="feature-desc">
                Add clothes with photos, category, color, and tags. Your whole
                closet in one searchable place.
              </p>
            </div>

            <div className="feature-card">
              <span className="feature-icon">✨</span>
              <h3 className="feature-title">Generate outfits</h3>
              <p className="feature-desc">
                Pick an occasion — Casual, Formal, Athletic, Date Night — and
                get a color-matched outfit built from what you already own.
              </p>
            </div>

            <div className="feature-card">
              <span className="feature-icon">📸</span>
              <h3 className="feature-title">Photo auto-fill</h3>
              <p className="feature-desc">
                Upload a photo and the app automatically detects the clothing
                category and dominant color — no manual typing needed.
              </p>
            </div>

            <div className="feature-card">
              <span className="feature-icon">🔢</span>
              <h3 className="feature-title">Track your wears</h3>
              <p className="feature-desc">
                Log every time you wear something with one tap. See which pieces
                you actually reach for and which ones just sit there.
              </p>
            </div>
          </div>
        </section>

        {/* ── How it works ── */}
        <section className="lp-section">
          <p className="section-label">How it works</p>
          <h2 className="section-title">Up and running in minutes</h2>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-num">01</div>
              <h3 className="step-title">Create your account</h3>
              <p className="step-desc">
                Sign up for free — no credit card, no subscription.
              </p>
            </div>

            <div className="step-card">
              <div className="step-num">02</div>
              <h3 className="step-title">Add your clothes</h3>
              <p className="step-desc">
                Upload photos or fill in the details. The app auto-detects
                category and color from photos.
              </p>
            </div>

            <div className="step-card">
              <div className="step-num">03</div>
              <h3 className="step-title">Generate outfits</h3>
              <p className="step-desc">
                Pick an occasion and get a ready-to-wear outfit suggestion
                pulled from your actual wardrobe.
              </p>
            </div>
          </div>
        </section>

        {/* ── Coming soon ── */}
        <section className="lp-section">
          <p className="section-label">Coming soon</p>
          <h2 className="section-title">AI is on the way</h2>
          <p className="subhead" style={{ marginBottom: "28px" }}>
            The free version already uses on-device AI for photo detection.
            Here&apos;s what&apos;s coming next.
          </p>
          <div className="coming-grid">
            <div className="coming-card">
              <div className="coming-card-top">
                <span className="feature-icon">🤖</span>
                <span className="soon-badge">Soon</span>
              </div>
              <h3 className="feature-title">AI photo analysis</h3>
              <p className="feature-desc">
                Point your camera at any item and AI instantly fills in the
                name, category, color, material, and style tags — far more
                accurate than on-device detection.
              </p>
            </div>

            <div className="coming-card">
              <div className="coming-card-top">
                <span className="feature-icon">🎨</span>
                <span className="soon-badge">Soon</span>
              </div>
              <h3 className="feature-title">AI outfit styling</h3>
              <p className="feature-desc">
                Describe a vibe — &quot;business meeting in summer&quot; or
                &quot;casual rooftop date&quot; — and AI builds a complete
                outfit from your wardrobe.
              </p>
            </div>

            <div className="coming-card">
              <div className="coming-card-top">
                <span className="feature-icon">📊</span>
                <span className="soon-badge">Soon</span>
              </div>
              <h3 className="feature-title">Style insights</h3>
              <p className="feature-desc">
                See patterns in what you actually wear, which items never leave
                the rack, and get suggestions on what to add or remove.
              </p>
            </div>
          </div>
        </section>

        {/* ── Bottom CTA ── */}
        <section className="lp-cta">
          <h2 className="cta-title">Ready to know your wardrobe?</h2>
          <p className="cta-sub">Free forever. No card required.</p>
          <Suspense fallback={null}>
            <AuthButton />
          </Suspense>
        </section>

        <footer className="footer">
          © 2026 ClosetIQ. All rights reserved. ·{" "}
          <Link href="/contact" className="nav-link">
            Contact
          </Link>
        </footer>
      </div>
    </main>
  );
}
