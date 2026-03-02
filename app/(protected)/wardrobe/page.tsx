import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Suspense } from "react";
import "../../page.css";
import "./wardrobe.css";
import { WardrobeGrid } from "./wardrobe-grid";

export default async function WardrobePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: items } = await supabase
    .from("wardrobe_items")
    .select("*")
    .eq("user_id", user?.id)
    .order("created_at", { ascending: false });

  const totalWears = (items ?? []).reduce((a, b) => a + (b.uses ?? 0), 0);

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

        {/* Stats row */}
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

        {/* Client component handles filtering + pagination */}
        <WardrobeGrid items={items ?? []} />

        <footer className="footer">
          © 2026 ClosetIQ. All rights reserved.
        </footer>
      </div>
    </main>
  );
}
