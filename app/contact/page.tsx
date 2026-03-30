"use client";

import { useState } from "react";
import Link from "next/link";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { SmartBrand } from "@/components/smart-brand";
import "../page.css";
import "./contact.css";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError("Name, email, and message are required.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setSuccess(true);
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page">
      <div className="container">
        <nav className="nav">
          <SmartBrand />
          <div className="nav-right">
            <Link href="/contact" className="nav-link">
              Contact
            </Link>
            <ThemeSwitcher />
          </div>
        </nav>

        <section className="contact-hero">
          <p className="kicker">Get in touch</p>
          <h1 className="contact-title">Contact Us</h1>
          <p className="subhead">
            Have a question, feedback, or just want to say hi? We&apos;d love
            to hear from you.
          </p>
        </section>

        <div className="contact-layout">
          {/* Left — info */}
          <div className="contact-info">
            <div className="info-block">
              <p className="info-label">Email</p>
              <p className="info-value">sburhanov1977@gmail.com</p>
            </div>
            <div className="info-block">
              <p className="info-label">Response time</p>
              <p className="info-value">Within 24 hours</p>
            </div>
            <div className="info-block">
              <p className="info-label">Built for</p>
              <p className="info-value">College students who want a smarter closet</p>
            </div>
          </div>

          {/* Right — form */}
          <div className="contact-form-wrap">
            {success ? (
              <div className="contact-success">
                <div className="success-icon">✓</div>
                <h2 className="success-title">Message sent!</h2>
                <p className="success-sub">
                  Thanks for reaching out. We&apos;ll get back to you within 24
                  hours.
                </p>
                <button
                  className="send-another"
                  onClick={() => setSuccess(false)}
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-field">
                    <label className="form-label">Name *</label>
                    <input
                      className="form-input"
                      placeholder="Your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Email *</label>
                    <input
                      className="form-input"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-field">
                  <label className="form-label">Subject</label>
                  <input
                    className="form-input"
                    placeholder="What's this about?"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>

                <div className="form-field">
                  <label className="form-label">Message *</label>
                  <textarea
                    className="form-input form-textarea"
                    placeholder="Tell us what's on your mind…"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>

                {error && <p className="form-error">{error}</p>}

                <button
                  type="submit"
                  className="form-submit"
                  disabled={loading}
                >
                  {loading ? "Sending…" : "Send Message"}
                </button>
              </form>
            )}
          </div>
        </div>

        <footer className="footer">
          © 2026 ClosetIQ. All rights reserved.
        </footer>
      </div>
    </main>
  );
}
