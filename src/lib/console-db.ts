// Operator Console — Supabase data service
// Full CRUD for KPI progress, sprints, decisions, EOD reports, shield mode
// Falls back to localStorage if Supabase is unavailable

import { supabase as _supabase } from "@/integrations/supabase/client";
const supabase = _supabase as any;

const today = () => new Date().toISOString().split("T")[0];

// ─── KPI Progress ───────────────────────────────────────────

export async function getKPIProgress(employeeId: string, playbookRole: string) {
  const { data, error } = await supabase
    .from("console_kpi_progress")
    .select("*")
    .eq("employee_id", employeeId)
    .eq("playbook_role", playbookRole)
    .eq("date", today());

  if (error) { console.error("[console-db] getKPIProgress:", error.message); return []; }
  return data ?? [];
}

export async function upsertKPIProgress(
  employeeId: string,
  playbookRole: string,
  kpiId: string,
  value: number,
  isDone: boolean
) {
  const { error } = await supabase
    .from("console_kpi_progress")
    .upsert({
      employee_id: employeeId,
      playbook_role: playbookRole,
      kpi_id: kpiId,
      date: today(),
      value,
      is_done: isDone,
      updated_at: new Date().toISOString(),
    }, { onConflict: "employee_id,playbook_role,kpi_id,date" });

  if (error) console.error("[console-db] upsertKPIProgress:", error.message);
}

// ─── Sprint Status ───────────────────────────────────────────

export async function getSprintStatus(employeeId: string, playbookRole: string) {
  const { data, error } = await supabase
    .from("console_sprint_status")
    .select("*")
    .eq("employee_id", employeeId)
    .eq("playbook_role", playbookRole)
    .eq("date", today());

  if (error) { console.error("[console-db] getSprintStatus:", error.message); return []; }
  return data ?? [];
}

export async function upsertSprintStatus(
  employeeId: string,
  playbookRole: string,
  sprintNumber: number,
  isDone: boolean
) {
  const { error } = await supabase
    .from("console_sprint_status")
    .upsert({
      employee_id: employeeId,
      playbook_role: playbookRole,
      sprint_number: sprintNumber,
      date: today(),
      is_done: isDone,
      completed_at: isDone ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    }, { onConflict: "employee_id,playbook_role,sprint_number,date" });

  if (error) console.error("[console-db] upsertSprintStatus:", error.message);
}

// ─── Decisions ───────────────────────────────────────────────

export async function getDecisions(employeeId: string, playbookRole: string) {
  const { data, error } = await supabase
    .from("console_decisions")
    .select("*")
    .eq("employee_id", employeeId)
    .eq("playbook_role", playbookRole)
    .eq("date", today())
    .order("created_at", { ascending: false });

  if (error) { console.error("[console-db] getDecisions:", error.message); return []; }
  return data ?? [];
}

export async function addDecision(
  employeeId: string,
  playbookRole: string,
  text: string
) {
  const { error } = await supabase
    .from("console_decisions")
    .insert({
      employee_id: employeeId,
      playbook_role: playbookRole,
      date: today(),
      text,
    });

  if (error) console.error("[console-db] addDecision:", error.message);
}

// ─── EOD Report ──────────────────────────────────────────────

export async function getEODReport(employeeId: string, playbookRole: string) {
  const { data, error } = await supabase
    .from("console_eod_reports")
    .select("*")
    .eq("employee_id", employeeId)
    .eq("playbook_role", playbookRole)
    .eq("date", today())
    .maybeSingle();

  if (error) { console.error("[console-db] getEODReport:", error.message); return null; }
  return data;
}

export async function upsertEODReport(
  employeeId: string,
  playbookRole: string,
  reportData: Record<string, string>
) {
  const { error } = await supabase
    .from("console_eod_reports")
    .upsert({
      employee_id: employeeId,
      playbook_role: playbookRole,
      date: today(),
      report_data: reportData,
      updated_at: new Date().toISOString(),
    }, { onConflict: "employee_id,playbook_role,date" });

  if (error) console.error("[console-db] upsertEODReport:", error.message);
}

export async function submitEODReport(
  employeeId: string,
  playbookRole: string,
  reportData: Record<string, string>
) {
  const { error } = await supabase
    .from("console_eod_reports")
    .upsert({
      employee_id: employeeId,
      playbook_role: playbookRole,
      date: today(),
      report_data: reportData,
      submitted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: "employee_id,playbook_role,date" });

  if (error) console.error("[console-db] submitEODReport:", error.message);
}

// ─── Shield Mode ─────────────────────────────────────────────

export async function getShieldMode(employeeId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("console_shield_mode")
    .select("is_enabled")
    .eq("employee_id", employeeId)
    .maybeSingle();

  if (error) { console.error("[console-db] getShieldMode:", error.message); return false; }
  return data?.is_enabled ?? false;
}

export async function setShieldMode(employeeId: string, isEnabled: boolean) {
  const { error } = await supabase
    .from("console_shield_mode")
    .upsert({
      employee_id: employeeId,
      is_enabled: isEnabled,
      enabled_at: isEnabled ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    }, { onConflict: "employee_id" });

  if (error) console.error("[console-db] setShieldMode:", error.message);
}

// ─── Realtime subscription ───────────────────────────────────

export function subscribeToConsole(
  employeeId: string,
  playbookRole: string,
  onUpdate: () => void
) {
  const channel = supabase
    .channel(`console_${employeeId}_${playbookRole}`)
    .on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "console_kpi_progress",
      filter: `employee_id=eq.${employeeId}`,
    }, onUpdate)
    .on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "console_sprint_status",
      filter: `employee_id=eq.${employeeId}`,
    }, onUpdate)
    .on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "console_shield_mode",
      filter: `employee_id=eq.${employeeId}`,
    }, onUpdate)
    .subscribe();

  return () => supabase.removeChannel(channel);
}
