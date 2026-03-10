import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { SmartBrand } from "@/components/smart-brand";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Suspense } from "react";
import "../../page.css";
import "./wardrobe.css";
import { WardrobeGrid } from "./wardrobe-grid";

export default async function WardrobePage() {
  const supabase = await createClient();

  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  const { data: items } = await supabase
    .from("wardrobe_items")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  const totalWears = (items ?? []).reduce((a, b) => a + (b.uses ?? 0), 0);

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

        <section className="wardrobe-header">
          <div>
            <h1 className="wardrobe-title">My Wardrobe</h1>
            <p className="subhead">
              {items?.length ?? 0} item{(items?.length ?? 0) !== 1 ? "s" : ""}
            </p>
          </div>
          <Link href="/wardrobe/add" className="add-btn">
            + Add Item
          </Link>
        </section>

        <div className="stats" style={{ maxWidth: "100%", marginTop: "0" }}>
          <div className="stat">
            <div className="stat-num">{items?.length ?? 0}</div>
            <div className="stat-label">Total Items</div>
          </div>
          <div className="stat">
            <div className="stat-num">
              {[...new Set((items ?? []).map((i) => i.category))].length}
            </div>
            <div className="stat-label">Categories</div>
          </div>
          <div className="stat">
            <div className="stat-num">{totalWears}</div>
            <div className="stat-label">Total Wears</div>
          </div>
        </div>

        <WardrobeGrid items={items ?? []} />

        <footer className="footer">
          © 2026 ClosetIQ. All rights reserved.
        </footer>
      </div>
    </main>
  );
}
