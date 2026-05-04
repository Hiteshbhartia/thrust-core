export type EODField = {
  key: string;
  label: string;
  type: 'number' | 'text' | 'boolean' | 'textarea';
};

export const ARENA_EOD_CONFIGS: Record<string, EODField[]> = {
  recruiter: [
    { key: 'interviews_completed', label: 'Interviews Completed', type: 'number' },
    { key: 'no_shows', label: 'No Shows', type: 'number' },
    { key: 'rescheduled', label: 'Rescheduled', type: 'number' },
    { key: 'referrals_contacted', label: 'Referrals Contacted', type: 'number' },
    { key: 'profiles_sourced', label: 'Profiles Sourced', type: 'number' },
    { key: 'pipeline_ready_for_tomorrow', label: 'Pipeline Ready for Tomorrow?', type: 'boolean' },
  ],
  coach: [
    { key: 'trainees_trained', label: 'Trainees Trained', type: 'number' },
    { key: 'trainees_cleared', label: 'Trainees Cleared', type: 'number' },
    { key: 'simulations_done', label: 'Simulations Done', type: 'number' },
    { key: 'avg_intent_score', label: 'Average Intent Score', type: 'number' },
    { key: 'common_mistakes', label: 'Common Mistakes', type: 'textarea' },
    { key: 'go_no_go_summary', label: 'Go/No-Go Summary', type: 'textarea' },
  ],
  floor_lead_tour: [
    { key: 'tours_booked', label: 'Tours Booked', type: 'number' },
    { key: 'tours_completed', label: 'Tours Completed', type: 'number' },
    { key: 'showup_percent', label: 'Show-up %', type: 'number' },
    { key: 'closings', label: 'Closings', type: 'number' },
    { key: 'no_show_reasons', label: 'No-show Reasons', type: 'textarea' },
    { key: 'pitch_issues', label: 'Pitch Issues', type: 'textarea' },
    { key: 'interventions', label: 'Interventions Done', type: 'number' },
  ],
  comm_shield: [
    { key: 'total_connections', label: 'Total Connections', type: 'number' },
    { key: 'ghost_leads_cleared', label: 'Ghost Leads Cleared', type: 'number' },
    { key: 'stuck_chats_resolved', label: 'Stuck Chats Resolved', type: 'number' },
    { key: 'lead_flow_issues', label: 'Lead Flow Issues', type: 'textarea' },
    { key: 'communication_delays', label: 'Communication Delays', type: 'textarea' },
    { key: 'c_players_flagged', label: 'C-Players Flagged', type: 'number' },
  ],
  hr: [
    { key: 'attendance_lock_time', label: 'Attendance Lock Time', type: 'text' },
    { key: 'absentees', label: 'Number of Absentees', type: 'number' },
    { key: 'late_calls', label: 'Late Calls Handled', type: 'number' },
    { key: 'leaves_pending', label: 'Leaves Pending', type: 'number' },
    { key: 'payroll_exceptions', label: 'Payroll Exceptions', type: 'number' },
    { key: 'compliance_status', label: 'Compliance Status', type: 'text' },
    { key: 'wellness_flags', label: 'Wellness Flags', type: 'textarea' },
  ],
  floor_lead_office: [
    { key: 'avg_connections', label: 'Avg Connections', type: 'number' },
    { key: 'crm_cleanliness', label: 'CRM Cleanliness Score', type: 'number' },
    { key: 'a_players', label: 'A-Players Count', type: 'number' },
    { key: 'b_players', label: 'B-Players Count', type: 'number' },
    { key: 'c_players', label: 'C-Players Count', type: 'number' },
    { key: 'interventions', label: 'Interventions', type: 'number' },
    { key: 'blockers', label: 'Blockers', type: 'textarea' },
  ],
  owner: [
    { key: 'total_calls', label: 'Total Calls', type: 'number' },
    { key: 'total_connections', label: 'Total Connections', type: 'number' },
    { key: 'total_tours', label: 'Total Tours', type: 'number' },
    { key: 'total_closures', label: 'Total Closures', type: 'number' },
    { key: 'revenue_estimate', label: 'Revenue Estimate', type: 'number' },
    { key: 'system_bottlenecks', label: 'System Bottlenecks', type: 'textarea' },
    { key: 'risk_flags', label: 'Risk Flags', type: 'textarea' },
  ],
};
