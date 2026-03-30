import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import "../../wardrobe.css";
import "../../add/add.css";
import { EditForm } from "./edit-form";

export default async function EditItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: item } = await supabase
    .from("wardrobe_items")
    .select("*")
    .eq("id", id)
    .eq("user_id", user?.id)
    .single();

  if (!item) notFound();

  return <EditForm item={item} />;
}
