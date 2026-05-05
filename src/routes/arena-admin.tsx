import { useState, useEffect } from 'react';
import { createFileRoute } from "@tanstack/react-router";
import { useArenaAdmin, ArenaKPIDefinition } from '@/hooks/useArenaOS';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAttendanceState } from '@/hooks/useAttendance';
import { Navigate } from '@tanstack/react-router';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

export const Route = createFileRoute("/arena-admin")({
  beforeLoad: ({ context }: any) => {
    // Access control
  },
  component: ArenaAdmin,
});

function ArenaAdmin() {
  const { actor } = useAttendanceState();
  const isAdmin = actor.role === 'Admin';

  if (!isAdmin) {
    return <Navigate to="/console" />;
  }

  const { manageKPIDefinition, manageSprint, allUsersPerformance, fetchAdminData } = useArenaAdmin();
  const [definitions, setDefinitions] = useState<ArenaKPIDefinition[]>([]);
  const [sprints, setSprints] = useState<any[]>([]);
  const [isSprintModalOpen, setIsSprintModalOpen] = useState(false);
  const [selectedRoleForSprint, setSelectedRoleForSprint] = useState('');
  const [newSprint, setNewSprint] = useState({
    sprint_name: '',
    start_time: '10:00',
    end_time: '11:00',
    role: ''
  });
  const [newKpi, setNewKpi] = useState<Partial<ArenaKPIDefinition>>({
    role: 'recruiter',
    type: 'number',
    is_active: true,
    default_target: 0,
    order_index: 0
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const roles = ['recruiter', 'coach', 'floor_lead_tour', 'comm_shield', 'hr', 'floor_lead_office', 'owner'];

  const fetchDefs = async () => {
    const { data, error } = await (supabase as any)
      .from('arena_kpi_definitions')
      .select('*')
      .eq('is_active', true)
      .order('role')
      .order('order_index');
    if (data) setDefinitions(data);
    if (error) console.error("Error fetching definitions:", error);
  };

  const fetchSprints = async () => {
    const { data } = await (supabase as any).from('arena_sprints').select('*').order('role');
    if (data) setSprints(data);
  };

  useEffect(() => {
    fetchDefs();
    fetchAdminData();
    fetchSprints();
  }, []);

  const handleSave = async (kpi: Partial<ArenaKPIDefinition>) => {
    if (!kpi.kpi_name || !kpi.label) {
      alert("Please fill in both the internal name and UI label.");
      return;
    }
    const { error } = await manageKPIDefinition(kpi);
    if (error) {
      alert("Database Error: " + error.message);
    } else {
      setEditingId(null);
      fetchDefs();
    }
  };

  const handleSaveSprint = async () => {
    if (!newSprint.sprint_name) return;
    await manageSprint({ ...newSprint, role: selectedRoleForSprint });
    setIsSprintModalOpen(false);
    fetchSprints();
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black tracking-tight">ARENA OPERATOR OS</h1>
          <p className="text-muted-foreground font-mono text-xs uppercase tracking-widest">Admin Control Center</p>
        </div>
        <Badge variant="outline" className="px-3 py-1 border-[#FF4D00] text-[#FF4D00] font-mono">ADMIN ACCESS</Badge>
      </div>

      <Tabs defaultValue="kpis" className="w-full">
        <TabsList className="bg-secondary/20 p-1 rounded-xl">
          <TabsTrigger value="kpis" className="rounded-lg px-6">KPI DEFINITIONS</TabsTrigger>
          <TabsTrigger value="performance" className="rounded-lg px-6">TEAM PERFORMANCE</TabsTrigger>
          <TabsTrigger value="sprints" className="rounded-lg px-6">SPRINT PLANS</TabsTrigger>
        </TabsList>

        <TabsContent value="kpis" className="mt-6 space-y-6">
          <Card className="border-border/50 shadow-xl overflow-hidden">
            <CardHeader className="bg-secondary/10 border-b border-border/50">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Plus className="h-4 w-4 text-[#FF4D00]" /> Add New KPI Definition
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono font-bold uppercase text-muted-foreground">Role</label>
                  <Select onValueChange={(v) => setNewKpi({...newKpi, role: v})} value={newKpi.role}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {roles.map((r: string) => <SelectItem key={r} value={r}>{r.toUpperCase()}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono font-bold uppercase text-muted-foreground">Internal Name (key)</label>
                  <Input placeholder="e.g. interviews_done" onChange={e => setNewKpi({...newKpi, kpi_name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono font-bold uppercase text-muted-foreground">UI Label</label>
                  <Input placeholder="e.g. Interviews Done" value={newKpi.label || ""} onChange={e => setNewKpi({...newKpi, label: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono font-bold uppercase text-muted-foreground">Target</label>
                  <Input type="number" placeholder="10" value={newKpi.default_target || 0} onChange={e => setNewKpi({...newKpi, default_target: parseInt(e.target.value)})} />
                </div>
                <Button 
                  className="bg-[#FF4D00] hover:bg-[#FF4D00]/90 font-bold" 
                  onClick={() => handleSave(newKpi)}
                >
                  {editingId ? "Update KPI" : "Create KPI"}
                </Button>
                {editingId && (
                  <Button 
                    variant="ghost" 
                    className="font-bold"
                    onClick={() => {
                      setEditingId(null);
                      setNewKpi({
                        role: 'recruiter',
                        type: 'number',
                        is_active: true,
                        default_target: 0,
                        order_index: 0
                      });
                    }}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[150px] font-mono text-[10px] uppercase">Role</TableHead>
                  <TableHead className="font-mono text-[10px] uppercase">Label</TableHead>
                  <TableHead className="font-mono text-[10px] uppercase">Target</TableHead>
                  <TableHead className="font-mono text-[10px] uppercase text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {definitions.map((def) => (
                  <TableRow key={def.id}>
                    <TableCell><Badge variant="secondary" className="font-mono text-[10px]">{def.role}</Badge></TableCell>
                    <TableCell className="font-bold">{def.label}</TableCell>
                    <TableCell>{def.default_target}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 hover:text-[#FF4D00]"
                        onClick={() => {
                          setEditingId(def.id);
                          setNewKpi(def);
                        }}
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 hover:text-destructive" 
                        onClick={async () => {
                          if (confirm("Delete this KPI?")) {
                            await manageKPIDefinition({...def, is_active: false});
                            fetchDefs();
                          }
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="mt-6">
          <Card className="border-border/50 shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-secondary/10">
                <TableRow>
                  <TableHead className="font-mono text-[10px] uppercase">Operator</TableHead>
                  <TableHead className="font-mono text-[10px] uppercase">Role</TableHead>
                  <TableHead className="font-mono text-[10px] uppercase">KPI Status</TableHead>
                  <TableHead className="font-mono text-[10px] uppercase">Alerts</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allUsersPerformance.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-bold">{user.full_name}</TableCell>
                    <TableCell><Badge variant="outline" className="text-[10px] uppercase">{user.role}</Badge></TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {user.arena_kpis?.map((k: any) => (
                          <Badge key={k.kpi_name} variant={k.is_hit ? "default" : "secondary"} className="text-[9px] px-1.5 h-5">
                            {k.kpi_name}: {k.current_value}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {user.arena_alerts?.filter((a: any) => !a.resolved).map((a: any) => (
                          <div key={a.id} className={`h-2 w-2 rounded-full ${a.severity === 'high' ? 'bg-destructive' : 'bg-warning'}`} />
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {allUsersPerformance.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="h-32 text-center text-muted-foreground font-medium italic">
                      No performance data tracked for today yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="sprints" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roles.map((r: string) => (
              <Card key={r} className="border-border/50 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-black uppercase tracking-tight">{r.replace(/_/g, ' ')}</CardTitle>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => {
                    setSelectedRoleForSprint(r);
                    setIsSprintModalOpen(true);
                  }}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  {sprints.filter(s => s.role === r).map(s => (
                    <div key={s.id} className="group flex justify-between items-center p-2 rounded bg-secondary/10 border border-border/50">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold">{s.sprint_name}</span>
                        <span className="text-[10px] font-mono opacity-60">{s.start_time} - {s.end_time}</span>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-5 w-5 h-5 w-5" onClick={() => {
                          setNewSprint(s);
                          setSelectedRoleForSprint(r);
                          setIsSprintModalOpen(true);
                        }}>
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-5 w-5 hover:text-destructive" onClick={async () => {
                          if (confirm("Delete this sprint?")) {
                            await (supabase as any).from('arena_sprints').delete().eq('id', s.id);
                            fetchSprints();
                          }
                        }}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {sprints.filter(s => s.role === r).length === 0 && (
                    <p className="text-[10px] text-muted-foreground italic">No sprints defined for this role.</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isSprintModalOpen} onOpenChange={setIsSprintModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="font-black uppercase tracking-tight">New Sprint for {selectedRoleForSprint.replace(/_/g, ' ')}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-[10px] font-mono font-bold uppercase text-muted-foreground">Sprint Name</label>
              <Input placeholder="e.g. Morning Brief" onChange={e => setNewSprint({...newSprint, sprint_name: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-mono font-bold uppercase text-muted-foreground">Start Time</label>
                <Input type="time" defaultValue="10:00" onChange={e => setNewSprint({...newSprint, start_time: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-mono font-bold uppercase text-muted-foreground">End Time</label>
                <Input type="time" defaultValue="11:00" onChange={e => setNewSprint({...newSprint, end_time: e.target.value})} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button className="bg-[#FF4D00] hover:bg-[#FF4D00]/90 font-bold w-full" onClick={handleSaveSprint}>SAVE SPRINT</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
