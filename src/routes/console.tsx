import { createFileRoute } from "@tanstack/react-router";
import { useAttendanceState } from "@/hooks/useAttendance";
import { type Employee } from "@/data/seed";
import { 
  Flame, ShieldOff, Zap, AlertCircle, ChevronRight, 
  Activity, Plus, Minus, ClipboardList, 
  Lock, CheckCircle2, MessageSquare, Clock,
  MessageCircle
} from "lucide-react";
import { useState, useMemo } from "react";
import { PLAYBOOK_CONFIGS, DEFAULT_CONFIG, type KPI, type Sprint } from "@/data/playbooks";
import { useConsoleState } from "@/lib/console-store";
import { ARENA_EOD_CONFIGS } from "@/lib/arena-eod-configs";
import { useArenaOS } from "@/hooks/useArenaOS";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/console")({
  component: OperatorConsole,
  head: () => ({ meta: [{ title: "Operator Console — Gharpayy Arena" }] }),
});

type Playbook = {
  id: string;
  name: string;
  playbookTitle: string;
  description: string;
  color: string;
  initials: string;
};

const PLAYBOOKS: Playbook[] = [
  { id: "e2", name: "Priya Sharma", playbookTitle: "POD COMMAND", description: "Floor Lead · Hub-Level Revenue Owner", color: "bg-[#00A3AF]", initials: "PS" },
  { id: "e3", name: "Rohan Iyer", playbookTitle: "OPERATOR DAY", description: "Teammate · Calls, Tours, Closures", color: "bg-[#0081C9]", initials: "RI" },
  { id: "e4", name: "Sneha Kulkarni", playbookTitle: "LEAD ROUTER", description: "Flow Ops · Air Traffic Control for Every Lead", color: "bg-[#FF8B13]", initials: "SK" },
  { id: "e5", name: "Vikram Joshi", playbookTitle: "OPERATOR DAY", description: "Teammate · Calls, Tours, Closures", color: "bg-[#FF8B13]", initials: "VJ" },
  { id: "e6", name: "Ananya Rao", playbookTitle: "TOUR CONDUCTOR", description: "TCM · The 6-Tour-to-2-Closing Standard", color: "bg-[#FF8B13]", initials: "AR" },
  { id: "e7", name: "Karan Singh", playbookTitle: "OPERATOR DAY", description: "Teammate · Calls, Tours, Closures", color: "bg-[#FF5D8F]", initials: "KS" },
  { id: "e8", name: "Megha Pillai", playbookTitle: "PEOPLE PULSE", description: "HR · Attendance, Pay, Wellbeing, Policy", color: "bg-[#4E9F3D]", initials: "MP" },
  { id: "e9", name: "Devansh Patel", playbookTitle: "OPERATOR DAY", description: "Teammate · Calls, Tours, Closures", color: "bg-[#00A3AF]", initials: "DP" },
  { id: "e11", name: "Tanya Bhatt", playbookTitle: "TALENT ENGINE", description: "Hiring System · Long-Term Operators Only", color: "bg-[#9B51E0]", initials: "TB" },
  { id: "ni", name: "Nithya Iyer", playbookTitle: "COMMUNICATION SHIELD", description: "In-Office Command · Precision Communication", color: "bg-[#FF8B13]", initials: "NI" },
  { id: "sr", name: "Sneha Reddy", playbookTitle: "PERFORMANCE ENFORCER", description: "Tours + Closings Command · The 10:16:60 Standard", color: "bg-[#9B51E0]", initials: "SR" },
  { id: "jk", name: "Jiya Khanna", playbookTitle: "TRAINING ARCHITECT", description: "From Raw Hire to Arena-Ready in 48 Hours", color: "bg-[#0081C9]", initials: "JK" },
  { id: "tk", name: "Thanvi Kapoor", playbookTitle: "TALENT ENGINE", description: "Hiring System · Long-Term Operators Only", color: "bg-[#FF8B13]", initials: "TK" },
];

function OperatorConsole() {
  const { actor } = useAttendanceState();
  const [selectedRole, setSelectedRole] = useState<Playbook | null>(null);

  const needsSelection = actor.role === "Admin";

  if (needsSelection && !selectedRole) {
    return (
      <div className="px-4 md:px-8 py-8 max-w-[1100px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
        <section className="mb-6 p-6 rounded-3xl bg-card border border-border shadow-sm space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
               <div className="h-10 w-10 rounded-xl bg-[#FF6B35]/10 flex items-center justify-center">
                  <Activity className="h-5 w-5 text-[#FF6B35]" />
               </div>
               <div>
                  <h1 className="text-2xl font-display font-bold tracking-tight">Operator Console</h1>
                  <p className="text-sm text-muted-foreground font-medium">Pick an operator role to see their day, sprint by sprint.</p>
               </div>
            </div>
            {needsSelection && (
              <Link 
                to="/arena-admin" 
                className="h-10 px-6 bg-secondary/50 hover:bg-secondary rounded-xl text-xs font-bold flex items-center gap-2 transition-all border border-border"
              >
                <ShieldOff className="h-4 w-4" /> MANAGE ARENA
              </Link>
            )}
          </div>
          <p className="text-sm text-muted-foreground/80 font-medium pt-2 border-t border-border/50">
            {actor.name} doesn't have an operator playbook yet. Switch into one of these roles to see the console:
          </p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {PLAYBOOKS.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedRole(p)}
              className="group flex items-center justify-between p-4 rounded-2xl bg-card border border-border/80 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all text-left"
            >
              <div className="flex items-center gap-4">
                <div className={`h-12 w-12 rounded-full ${p.color} flex items-center justify-center text-white font-bold text-sm shadow-inner shrink-0`}>
                  {p.initials}
                </div>
                <div className="space-y-0.5">
                  <div className="font-bold text-base text-foreground group-hover:text-primary transition-colors leading-tight">{p.name}</div>
                  <div className="text-[10px] font-mono uppercase tracking-[0.1em] text-[#FF4D00] font-black">{p.playbookTitle}</div>
                  <div className="text-xs text-muted-foreground font-medium leading-relaxed opacity-80">{p.description}</div>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary transition-transform group-hover:translate-x-1 shrink-0" />
            </button>
          ))}
        </div>
      </div>
    );
  }

  // If they are not admin/owner, they act as themselves
  const roleToDisplay = selectedRole || PLAYBOOKS.find(p => p.id === actor.id) || PLAYBOOKS[0];

  return <OperatorDashboard role={roleToDisplay} employee={actor} onBack={needsSelection ? () => setSelectedRole(null) : undefined} />;
}

function OperatorDashboard({ role, employee, onBack }: { role: Playbook; employee: Employee; onBack?: () => void }) {
  const config = PLAYBOOK_CONFIGS[role.playbookTitle] || DEFAULT_CONFIG;
  
  const { data: state, updateSprint, addDecision, updateReport, toggleShieldMode } = useConsoleState(
    employee.id,
    config.title,
    config.kpis.map(k => k.id),
    config.sprints.map(s => s.number)
  );

  const { definitions, kpiValues, updateKPI, submitEODReport } = useArenaOS(employee.id, role.playbookTitle.toLowerCase().replace(/ /g, '_'));

  const roleKey = role.playbookTitle.toLowerCase().replace(/ /g, '_');
  const eodFields = ARENA_EOD_CONFIGS[roleKey] || ARENA_EOD_CONFIGS.recruiter; // fallback

  const [decisionInput, setDecisionInput] = useState("");

  const dayScore = useMemo(() => {
    const total = config.kpis.length;
    if (total === 0) return 0;
    const done = Object.values(state.kpis).filter(k => k.isDone).length;
    return Math.round((done / total) * 100);
  }, [state.kpis, config.kpis]);

  const isDayOver = useMemo(() => {
    const now = new Date();
    const hours = now.getHours();
    return hours >= 19 || hours < 8; // After 7:30 PM or before 8:00 AM
  }, []);

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-[1400px] mx-auto animate-in fade-in duration-700">
      <div className="flex flex-col xl:flex-row gap-8">
        
        {/* Main Feed Column */}
        <div className="flex-1 space-y-8">
          {onBack && (
            <button onClick={onBack} className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors mb-4">
              ← Change Role
            </button>
          )}

          {/* Header Card */}
          <section className="relative rounded-3xl bg-card border border-border p-6 md:p-8 overflow-hidden group shadow-sm">
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-4 max-w-3xl">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-[#FF4D00]/10 flex items-center justify-center">
                    <Flame className="h-6 w-6 text-[#FF4D00]" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#FF4D00] font-bold">
                      {config.roleName.toUpperCase()} · HUB-LEVEL REVENUE OWNER
                    </div>
                    <h1 className="font-display text-4xl font-bold tracking-tight">{config.title}</h1>
                  </div>
                </div>
                <p className="text-muted-foreground text-base font-medium">{config.description}</p>
                <p className="text-sm text-muted-foreground/80 italic">— Owned today by {employee.name}</p>
              </div>

              <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-secondary/20 border border-border/50 min-w-[180px]">
                <div className="relative h-24 w-24 flex items-center justify-center">
                  <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
                    <circle className="text-muted/10" strokeWidth="6" stroke="currentColor" fill="transparent" r="44" cx="50" cy="50" />
                    <circle 
                      className="text-[#FF4D00] transition-all duration-1000 ease-in-out" 
                      strokeWidth="6" 
                      strokeDasharray={276} 
                      strokeDashoffset={276 - (276 * dayScore) / 100} 
                      strokeLinecap="round" 
                      stroke="currentColor" 
                      fill="transparent" 
                      r="44" 
                      cx="50" 
                      cy="50" 
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold font-display">{dayScore}%</span>
                  </div>
                </div>
                <div className="mt-2 text-center text-[10px] font-mono uppercase tracking-[0.1em]">
                  <div className="text-muted-foreground font-bold">Day Score</div>
                  <div className={dayScore === 0 ? "text-destructive font-black" : "text-success font-black"}>
                    {dayScore === 0 ? "NOT STARTED" : dayScore === 100 ? "COMPLETE" : "IN PROGRESS"}
                  </div>
                </div>
              </div>
            </div>
            <button 
              onClick={toggleShieldMode}
              className={`mt-6 flex items-center gap-3 px-6 py-2.5 rounded-xl border text-[10px] font-mono uppercase tracking-[0.2em] transition-all ${
                state.shieldMode 
                  ? "bg-[#FF4D00]/10 border-[#FF4D00]/30 text-[#FF4D00]" 
                  : "bg-secondary/30 border-border/50 text-muted-foreground hover:bg-secondary/50"
              }`}
            >
              {state.shieldMode ? <Lock className="h-3.5 w-3.5" /> : <ShieldOff className="h-3.5 w-3.5" />}
              <span>{state.shieldMode ? "Shield Mode On" : "Shield Mode Off"}</span>
              <span className={`h-1 w-1 rounded-full ${state.shieldMode ? "bg-[#FF4D00]/50" : "bg-muted-foreground/30"}`} />
              <span>{state.shieldMode ? "Distractions Reduced" : "Communications Open"}</span>
            </button>
          </section>

          {isDayOver && (
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#FF4D00]/5 border border-[#FF4D00]/20 text-sm font-medium">
               <Zap className="h-5 w-5 text-[#FF4D00] fill-[#FF4D00]" />
               <span className="text-muted-foreground">Day complete or off-hours. Use this time for EOD + tomorrow prep.</span>
            </div>
          )}

          {/* KPIs Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 rounded-full border-2 border-[#FF4D00]/30 flex items-center justify-center p-1">
                <div className="h-full w-full rounded-full bg-[#FF4D00]/20 flex items-center justify-center">
                   <div className="h-1 w-1 rounded-full bg-[#FF4D00]" />
                </div>
              </div>
              <div className="space-y-0.5">
                <h3 className="font-display text-lg font-bold">Today's KPIs</h3>
                <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">Tap to log progress. Numbers turn green when you hit target.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {config.kpis.map(kpi => (
                <KPICard 
                  key={kpi.id}
                  {...kpi} 
                  value={state.kpis[kpi.id]?.value || 0}
                  isDone={state.kpis[kpi.id]?.isDone || false}
                  onUpdate={(val, done) => updateKPI(kpi.id, val, done)}
                />
              ))}
            </div>
          </section>

          {/* Sprint Plan Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-[#FF4D00] fill-[#FF4D00]" />
              <div className="space-y-0.5">
                <h3 className="font-display text-lg font-bold">Sprint plan</h3>
                <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">Hour-by-hour. Tap to mark a sprint complete.</p>
              </div>
            </div>
            
            <div className="space-y-4">
              {config.sprints.map(sprint => (
                <SprintCard 
                  key={sprint.number}
                  {...sprint}
                  isDone={state.sprints[sprint.number]?.isDone || false}
                  onToggle={() => updateSprint(sprint.number, !state.sprints[sprint.number]?.isDone)}
                />
              ))}
            </div>
          </section>

          {/* Communication Windows Section */}
          <section className={`space-y-6 transition-all duration-500 ${state.shieldMode ? "opacity-30 pointer-events-none grayscale" : ""}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-[#FF4D00]" />
                <div className="space-y-0.5">
                  <h3 className="font-display text-lg font-bold">Communication windows</h3>
                  <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">Send these on time. Outside these, Shield Mode applies.</p>
                </div>
              </div>
              {state.shieldMode && (
                <div className="flex items-center gap-2 px-2 py-1 rounded bg-[#FF4D00]/10 border border-[#FF4D00]/20 text-[10px] font-mono uppercase tracking-[0.2em] text-[#FF4D00]">
                  <Lock className="h-3 w-3" /> Blocked by Shield
                </div>
              )}
            </div>
            <div className="space-y-2">
              {config.commWindows.map((win, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-card border border-border shadow-sm group hover:border-[#FF4D00]/30 transition-all">
                  <div className="flex items-center gap-4">
                    <MessageCircle className="h-5 w-5 text-muted-foreground/40 group-hover:text-[#FF4D00]" />
                    <div>
                      <div className="text-sm font-bold">{win.label}</div>
                      <div className="text-[10px] font-mono text-muted-foreground">{win.channel} · scheduled {win.time}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-destructive">
                    <AlertCircle className="h-3 w-3" />
                    OVERDUE
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar Actions Column */}
        <div className="w-full xl:w-[400px] space-y-8">
          
          {/* Rules Card */}
          <div className="p-6 rounded-3xl bg-[#FF4D00]/5 border border-[#FF4D00]/20 space-y-4">
            <div className="flex items-center gap-2 text-[#FF4D00]">
              <AlertCircle className="h-5 w-5" />
              <div className="text-[11px] font-mono font-black uppercase tracking-widest">Process Collapse Rule</div>
            </div>
            <div className="space-y-3">
              <p className="text-sm font-bold leading-relaxed">{config.rules.main}</p>
              <p className="text-[11px] text-muted-foreground/80 italic leading-relaxed">{config.rules.note}</p>
            </div>
          </div>

          {/* Hard Decisions Card */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-[#FF4D00]" />
              <h3 className="font-display text-base font-bold">Hard decisions today</h3>
            </div>
            <div className="p-6 rounded-3xl bg-card border border-border shadow-sm space-y-4">
              <textarea 
                placeholder="e.g., Issued formal warning to X for second late entry."
                value={decisionInput}
                onChange={(e) => setDecisionInput(e.target.value)}
                className="w-full h-24 bg-secondary/20 border-border/50 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF4D00]/10 transition-all resize-none"
              />
              <button 
                onClick={() => {
                  addDecision(decisionInput);
                  setDecisionInput("");
                }}
                className="w-full h-11 bg-[#FF4D00] text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#FF4D00]/90 transition-all shadow-lg shadow-[#FF4D00]/20"
              >
                <Plus className="h-4 w-4" /> Log decision
              </button>
              <div className="space-y-3">
                {state.decisions && state.decisions.length > 0 ? (
                  state.decisions.map((d, i) => (
                    <div key={i} className="text-xs p-3 rounded-lg bg-secondary/10 border border-border/50 text-muted-foreground">
                      {d.text}
                    </div>
                  ))
                ) : (
                  <p className="text-[10px] text-muted-foreground font-medium italic text-center">
                    No hard decisions logged yet today. Easy decisions protect individuals; hard decisions protect Gharpayy.
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* EOD Report Form */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-[#FF4D00]" />
              <h3 className="font-display text-base font-bold">EOD Report</h3>
            </div>
            <div className="p-6 rounded-3xl bg-card border border-border shadow-sm space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {eodFields.map((field) => (
                    <div key={field.key} className="space-y-2">
                      <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground">{field.label}</label>
                      {field.type === 'number' ? (
                        <input 
                          type="number" 
                          value={state.reportData[field.key] || ""}
                          onChange={(e) => updateReport(field.key, e.target.value)}
                          className="w-full bg-secondary/20 border-border/50 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF4D00]/10 transition-all"
                        />
                      ) : field.type === 'textarea' ? (
                        <textarea 
                          value={state.reportData[field.key] || ""}
                          onChange={(e) => updateReport(field.key, e.target.value)}
                          className="w-full h-20 bg-secondary/20 border-border/50 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF4D00]/10 transition-all resize-none"
                        />
                      ) : (
                        <input 
                          type="text" 
                          value={state.reportData[field.key] || ""}
                          onChange={(e) => updateReport(field.key, e.target.value)}
                          className="w-full bg-secondary/20 border-border/50 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF4D00]/10 transition-all"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                <button className="flex-1 h-10 border border-border rounded-xl text-sm font-bold hover:bg-secondary/50 transition-all">
                  Preview
                </button>
                <button 
                  onClick={() => {
                    const txt = `EOD Report (${role.playbookTitle}):\n` + 
                      eodFields.map(f => `${f.label}: ${state.reportData[f.key] || 0}`).join('\n');
                    navigator.clipboard.writeText(txt);
                    // Also submit to database
                    submitEODReport(state.reportData);
                  }}
                  className="flex-1 h-10 bg-[#FF4D00] text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#FF4D00]/90 transition-all"
                >
                  Submit & Copy
                </button>
              </div>
              <div className="text-center">
                 <button className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#FF4D00] hover:underline">View inbox to send the digest.</button>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}

function KPICard({ id, title, subtitle, value, target, type = "numeric", isDone, onUpdate }: KPI & { value: number; isDone: boolean; onUpdate: (val: number, done: boolean) => void }) {
  const isTargetHit = type === "boolean" ? value === 1 : value >= target;

  return (
    <div className={`rounded-xl border p-4 space-y-4 transition-all ${isDone ? "bg-success/[0.03] border-success/30 shadow-sm" : "bg-card border-border shadow-sm"}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h4 className="text-[13px] font-bold leading-tight">{title}</h4>
          <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">{subtitle}</p>
        </div>
        <div className="text-right">
          <div className={`font-display text-2xl font-black tabular-nums ${isTargetHit ? "text-success" : "text-foreground"}`}>
            {type === "percent" ? `${value}%` : type === "boolean" ? (value === 1 ? "1" : "0") : value}
            <span className="text-[11px] text-muted-foreground font-normal ml-0.5">/{type === "percent" ? "100%" : type === "boolean" ? "1" : target}</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <div className="flex-1 flex items-center gap-1.5 p-1 bg-secondary/30 rounded-lg border border-border/50">
          <button 
            onClick={() => onUpdate(Math.max(0, value - 1), false)}
            className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-card hover:shadow-sm transition-all text-muted-foreground"
          >
            <Minus className="h-3 w-3" />
          </button>
          <div className="flex-1 text-center font-mono text-xs font-bold">{value}</div>
          <button 
            onClick={() => onUpdate(value + 1, false)}
            className="h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-card hover:shadow-sm transition-all text-muted-foreground"
          >
            <Plus className="h-3 w-3" />
          </button>
          <div className="w-px h-4 bg-border/50 mx-1" />
          <button 
            onClick={() => onUpdate(value + 5, false)}
            className="px-2 h-8 inline-flex items-center justify-center rounded-md hover:bg-card hover:shadow-sm transition-all text-[10px] font-bold text-muted-foreground"
          >
            +5
          </button>
        </div>
        <button 
          onClick={() => onUpdate(target, !isDone)}
          className={`px-4 h-10 rounded-lg text-[10px] font-black tracking-widest uppercase transition-all ${
            isDone 
              ? "bg-success text-white shadow-lg shadow-success/20" 
              : "bg-[#FF4D00]/10 text-[#FF4D00] border border-[#FF4D00]/30 hover:bg-[#FF4D00]/20"
          }`}
        >
          HIT
        </button>
      </div>
    </div>
  );
}

function SprintCard({ number, time, title, subtitle, items, metric, shield, isDone, onToggle }: Sprint & { isDone: boolean; onToggle: () => void }) {
  return (
    <div className={`p-6 rounded-2xl border transition-all ${isDone ? "bg-success/[0.02] border-success/20" : "bg-card border-border shadow-sm"}`}>
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#FF4D00]">SPRINT {number}</div>
            <div className="text-[10px] font-mono font-bold text-muted-foreground">{time}</div>
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-destructive/10 text-destructive text-[9px] font-black uppercase tracking-tighter">
              <Clock className="h-2.5 w-2.5" /> MISSED?
            </div>
            {shield && (
              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#FF4D00]/10 text-[#FF4D00] text-[9px] font-black uppercase tracking-tighter border border-[#FF4D00]/20">
                <Lock className="h-2.5 w-2.5" /> SHIELD
              </div>
            )}
          </div>
          <h4 className="text-xl font-bold tracking-tight">{title}</h4>
          <p className="text-sm text-muted-foreground font-medium">{subtitle}</p>
        </div>
        <button 
          onClick={onToggle}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            isDone 
              ? "bg-success text-white" 
              : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
          }`}
        >
          <CheckCircle2 className="h-4 w-4" />
          {isDone ? "Done" : "Mark done"}
        </button>
      </div>

      <div className="space-y-3 mb-6">
        {items.map((item, i) => (
          <div key={i} className="flex items-start justify-between text-xs group">
            <div className="flex gap-4">
              <span className="text-[#FF4D00] font-mono font-bold opacity-60 w-16">{item.time}</span>
              <span className="text-muted-foreground font-medium group-hover:text-foreground transition-colors">{item.label}</span>
            </div>
            <span className="text-muted-foreground font-mono opacity-40 group-hover:opacity-100 transition-opacity">→ {item.result}</span>
          </div>
        ))}
      </div>
      <div className="pt-4 border-t border-border/50">
        <div className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest mb-1">METRIC</div>
        <div className="text-[11px] font-bold text-muted-foreground italic">{metric}</div>
      </div>
    </div>
  );
}
