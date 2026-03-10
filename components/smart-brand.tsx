"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export function SmartBrand() {
  const router = useRouter();

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    router.push(user ? "/wardrobe" : "/");
  }

  return (
    <Link href="/" className="brand" onClick={handleClick}>
      <div className="logo-dot" />
      <span>ClosetIQ</span>
    </Link>
  );
}
