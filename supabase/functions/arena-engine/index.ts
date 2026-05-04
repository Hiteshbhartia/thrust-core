// @ts-ignore: Deno modules are not recognized by the local TS compiler but work in Supabase
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// @ts-ignore: Deno modules are not recognized by the local TS compiler but work in Supabase
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      (globalThis as any).Deno.env.get('SUPABASE_URL') ?? '',
      (globalThis as any).Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { action, payload } = await req.json()

    console.log(`Arena Engine: Processing action ${action}`)

    switch (action) {
      case 'evaluate_recruiter':
        await evaluateRecruiter(supabaseClient, payload)
        break
      case 'evaluate_floor_lead_tour':
        await evaluateFloorLeadTour(supabaseClient, payload)
        break
      case 'evaluate_comm_shield':
        await evaluateCommShield(supabaseClient, payload)
        break
      case 'evaluate_hr':
        await evaluateHR(supabaseClient, payload)
        break
      case 'evaluate_coach':
        await evaluateCoach(supabaseClient, payload)
        break
      default:
        throw new Error(`Unknown action: ${action}`)
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) {
    console.error('Arena Engine Error:', error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})

async function evaluateRecruiter(supabase: any, { user_id }: any) {
  // Exact KPI Check from UI requirements
  const { data: kpis } = await supabase
    .from('arena_kpis')
    .select('*')
    .eq('user_id', user_id)
    .eq('role', 'recruiter')

  const interviews = kpis?.find((k: any) => k.kpi_name === 'interviews_completed')?.current_value ?? 0
  const threshold = 5 // UI requirement: interviews < threshold by 1 PM
  const currentHour = new Date().getHours()

  if (currentHour >= 13 && interviews < threshold) {
    await createAlert(supabase, {
      user_id,
      type: 'recruiter_kpi_breach',
      severity: 'high',
      triggered_by: `Interviews (${interviews}) < ${threshold} by 1 PM`
    })
  }
}

async function evaluateFloorLeadTour(supabase: any, { user_id }: any) {
  const { data: kpis } = await supabase
    .from('arena_kpis')
    .select('*')
    .eq('user_id', user_id)
    .eq('role', 'floor_lead_tour')

  const tours = kpis?.find((k: any) => k.kpi_name === 'tours_booked')?.current_value ?? 0
  const threshold = 10 // UI requirement: tours < 10 by 5 PM
  const currentHour = new Date().getHours()

  if (currentHour >= 17 && tours < threshold) {
    await createAlert(supabase, {
      user_id,
      type: 'floor_lead_tour_breach',
      severity: 'high',
      triggered_by: `Tours (${tours}) < ${threshold} by 5 PM`
    })
  }
}

async function evaluateCommShield(supabase: any, { user_id }: any) {
  // Detect leads inactive > X hrs (UI requirement)
  const inactivityThreshold = 4 // e.g. 4 hours
  const { data: inactiveLeads } = await supabase
    .from('leads')
    .select('id, name')
    .eq('assigned_to', user_id)
    .lt('last_activity_at', new Date(Date.now() - inactivityThreshold * 60 * 60 * 1000).toISOString())

  if (inactiveLeads && inactiveLeads.length > 0) {
    await createAlert(supabase, {
      user_id,
      type: 'lead_inactivity',
      severity: 'medium',
      triggered_by: `${inactiveLeads.length} leads inactive > ${inactivityThreshold}h`
    })
  }

  // Check for stuck chats > 24h (UI requirement)
  const { data: stuckChats } = await supabase
    .from('communications')
    .select('id')
    .eq('user_id', user_id)
    .eq('type', 'whatsapp')
    .lt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

  if (stuckChats && stuckChats.length > 0) {
    await createAlert(supabase, {
      user_id,
      type: 'stuck_chat',
      severity: 'high',
      triggered_by: `${stuckChats.length} chats stuck > 24h`
    })
  }
}

async function evaluateHR(supabase: any, { user_id }: any) {
  // UI requirement: unresolved payroll by 6 PM → alert
  const currentHour = new Date().getHours()
  if (currentHour >= 18) {
    const { count } = await supabase
      .from('arena_alerts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user_id)
      .eq('type', 'payroll_exception')
      .eq('resolved', false)

    if (count && count > 0) {
      await createAlert(supabase, {
        user_id,
        type: 'hr_payroll_pending',
        severity: 'high',
        triggered_by: `Unresolved payroll by 6 PM`
      })
    }
  }
}

async function evaluateCoach(supabase: any, { user_id }: any) {
  // Track trainee lifecycle (Placeholder for specific trainees)
}

async function createAlert(supabase: any, alert: any) {
  const { error } = await supabase
    .from('arena_alerts')
    .insert([alert])
  
  if (error) console.error('Error creating alert:', error)
}
