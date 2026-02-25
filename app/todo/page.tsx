import { createClient } from "@/lib/supabase/server";

export default async function Page() {
  const supabase = await createClient();
  const { data: Todo } = await supabase.from("Todo").select();

  return <pre>{JSON.stringify(Todo, null, 2)}</pre>;
}
