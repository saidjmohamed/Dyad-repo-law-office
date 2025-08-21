import { useQuery } from "@tanstack/react-query";
import { getClients } from "./clients/actions";
import { getCases } from "./cases/actions";
import { getHearings } from "./hearings/actions";
import { getTasks } from "./tasks/actions";
import { DashboardStatCard } from "@/components/DashboardStatCard";
import { Briefcase, CalendarClock, Users, ListTodo } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

// Define types for data fetched from queries
type Client = { id: string; full_name: string; };
type Case = { id: string; status: string; case_number: string; client_name: string; };
type Hearing = { id: string; hearing_date: string; case_number: string; client_name: string; };
type Task = { id: string; done: boolean; priority: string; title: string; due_date: string; };

const Index = () => {
  const { data: clients, isLoading: isLoadingClients } = useQuery<Client[]>({
    queryKey: ["clients"],
    queryFn: getClients,
  });
  const { data: cases, isLoading: isLoadingCases } = useQuery<Case[]>({
    queryKey: ["cases"],
    queryFn: () => getCases(), // Corrected: Call getCases without filters for dashboard
  });
  const { data: hearings, isLoading: isLoadingHearings } = useQuery<Hearing[]>({
    queryKey: ["hearings"],
    queryFn: getHearings,
  });
  const { data: tasks, isLoading: isLoadingTasks } = useQuery<Task[]>({
    queryKey: ["tasks"],
    queryFn: getTasks,
  });

  const isLoading = isLoadingClients || isLoadingCases || isLoadingHearings || isLoadingTasks;

  const stats = {
    totalClients: clients?.length ?? 0,
    activeCases: cases?.filter(c => c.status !== "مكتملة").length ?? 0,
    upcomingHearings: hearings?.filter(h => new Date(h.hearing_date) >= new Date()).length ?? 0,
    pendingTasks: tasks?.filter(t => !t.done).length ?? 0,
  };

  const upcomingHearingsList = hearings
    ?.filter(h => new Date(h.hearing_date) >= new Date())
    .slice(0, 5);

  const pendingTasksList = tasks
    ?.filter(t => !t.done)
    .sort((a, b) => {
        const priorityOrder: { [key: string]: number } = { 'عالية': 1, 'متوسط': 2, 'منخفضة': 3 };
        return (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2);
    })
    .slice(0, 5);

  const getPriorityBadgeVariant = (priority: string | null) => {
    switch (priority) {
      case 'عالية': return 'destructive';
      case 'متوسط': return 'secondary';
      case 'منخفضة': return 'outline';
      default: return 'default';
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">لوحة التحكم</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <DashboardStatCard
          title="إجمالي الموكلين"
          value={stats.totalClients}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          isLoading={isLoading}
        />
        <DashboardStatCard
          title="القضايا النشطة"
          value={stats.activeCases}
          icon={<Briefcase className="h-4 w-4 text-muted-foreground" />}
          isLoading={isLoading}
        />
        <DashboardStatCard
          title="الجلسات القادمة"
          value={stats.upcomingHearings}
          icon={<CalendarClock className="h-4 w-4 text-muted-foreground" />}
          isLoading={isLoading}
        />
        <DashboardStatCard
          title="المهام المعلقة"
          value={stats.pendingTasks}
          icon={<ListTodo className="h-4 w-4 text-muted-foreground" />}
          isLoading={isLoading}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>الجلسات القادمة</CardTitle>
            <CardDescription>نظرة سريعة على الجلسات الخمس القادمة.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>التاريخ</TableHead>
                  <TableHead>القضية</TableHead>
                  <TableHead>الموكل</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                    <TableRow><TableCell colSpan={3} className="text-center">جاري التحميل...</TableCell></TableRow>
                ) : upcomingHearingsList && upcomingHearingsList.length > 0 ? (
                  upcomingHearingsList.map(hearing => (
                    <TableRow key={hearing.id}>
                      <TableCell>{format(new Date(hearing.hearing_date), "yyyy/MM/dd")}</TableCell>
                      <TableCell>{hearing.case_number}</TableCell>
                      <TableCell>{hearing.client_name}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow><TableCell colSpan={3} className="text-center">لا توجد جلسات قادمة.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
            <div className="mt-4 text-center">
                <Link to="/hearings" className="text-sm font-medium text-primary hover:underline">
                    عرض كل الجلسات
                </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>المهام المعلقة</CardTitle>
            <CardDescription>أهم 5 مهام معلقة حسب الأولوية.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
                <div className="text-center">جاري التحميل...</div>
            ) : pendingTasksList && pendingTasksList.length > 0 ? (
                <div className="space-y-2">
                    {pendingTasksList.map(task => (
                        <div key={task.id} className="flex justify-between items-center text-sm">
                            <span>{task.title}</span>
                            <Badge variant={getPriorityBadgeVariant(task.priority)}>{task.priority || 'متوسط'}</Badge>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center">لا توجد مهام معلقة.</div>
            )}
            <div className="mt-4 text-center">
                <Link to="/tasks" className="text-sm font-medium text-primary hover:underline">
                    عرض كل المهام
                </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;