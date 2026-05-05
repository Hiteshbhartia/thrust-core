// Comm Windows — DB service
// Fetches window definitions and per-employee daily status

import { supabase } from "@/integrations/supabase/client";

const today = () => new Date().toISOString().split("T")[0];

export async function getCommWindows(role: string) {
  const { data, error } = await supabase
    .from("comm_windows")
    .select("*")
    .eq("role", role)
    .eq("is_active", true)
    .order("order_index");
  if (error) { console.error("[comm-db] getCommWindows:", error.message); return []; }
  return data ?? [];
}

export async function getCommWindowStatuses(employeeId: string) {
  const { data, error } = await supabase
    .from("comm_window_status")
    .select("*")
    .eq("employee_id", employeeId)
    .eq("date", today());
  if (error) { console.error("[comm-db] getCommWindowStatuses:", error.message); return []; }
  return data ?? [];
}

export async function setCommWindowStatus(
  employeeId: string,
  windowId: string,
  status: "sent" | "missed" | "pending"
) {
  const { error } = await supabase
    .from("comm_window_status")
    .upsert({
      employee_id: employeeId,
      window_id: windowId,
      date: today(),
      status,
      marked_at: new Date().toISOString(),
    }, { onConflict: "employee_id,window_id,date" });
  if (error) console.error("[comm-db] setCommWindowStatus:", error.message);
}

// Admin CRUD
export async function createCommWindow(window: {
  role: string; label: string; channel: string; scheduled_time: string; order_index?: number;
}) {
  const { error } = await supabase.from("comm_windows").insert([window]);
  return { error };
}

export async function updateCommWindow(id: string, updates: Partial<{
  label: string; channel: string; scheduled_time: string; order_index: number; is_active: boolean;
}>) {
  const { error } = await supabase.from("comm_windows").update(updates).eq("id", id);
  return { error };
}

export async function deleteCommWindow(id: string) {
  const { error } = await supabase.from("comm_windows").update({ is_active: false }).eq("id", id);
  return { error };
}
