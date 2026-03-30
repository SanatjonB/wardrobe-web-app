import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Suspense } from "react";
import "../../../page.css";
import "../wardrobe.css";
import "../add/add.css";
import "./outfit.css";
import { OutfitClient } from "./outfit-client";

export default async function OutfitPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: items } = await supabase
    .from("wardrobe_items")
    .select("*")
    .eq("user_id", user?.id)
    .order("created_at", { ascending: false });

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

        <div className="outfit-page-header">
          <Link href="/wardrobe" className="back-btn">
            ← My Wardrobe
          </Link>
          <h1 className="wardrobe-title">Outfit Generator</h1>
        </div>

        <OutfitClient items={items ?? []} />

        <footer className="footer">
          © 2026 ClosetIQ. All rights reserved.
        </footer>
      </div>
    </main>
  );
}
