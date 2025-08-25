import { useQuery } from "@tanstack/react-query";
import { getClients } from "./clients/actions";
import { getCases } from "./cases/actions";
import { getHearings } from "./hearings/actions";
import { getTasks } from "./tasks/actions";
import { DashboardStatCard } from "@/components/DashboardStatCard";
import { Briefcase, CalendarClock, Users, ListTodo } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format, parseISO } from "date-fns";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { CaseTypePieChart } from "@/components/charts/CaseTypePieChart";
import { MonthlyCaseBarChart } from "@/components/charts/MonthlyCaseBarChart";
import { ar } from 'date-fns/locale';
import { useMemo } from 'react';
import { Case as CaseType } from "./cases/actions";

// Define types for data fetched from queries
type Client = { id: string; full_name: string; };
type Case = CaseType;
type Hearing = { id: string; hearing_date: string; case_number: string | null | undefined; client_name: string | null | undefined; case_id: string; };
type Task = { id: string; done: boolean; priority: string | null | undefined; title: string; due_date: string | null | undefined; case_id?: string | null; };

const Index = () => {
  const { data: clients, isLoading: isLoadingClients } = useQuery<Client[]>({
    queryKey: ["clients"],
    queryFn: getClients,
  });
  const { data: cases, isLoading: isLoadingCases } = useQuery<Case[]>({
    queryKey: ["cases"],
    queryFn: () => getCases({}),
  });
  const { data: hearings, isLoading: isLoadingHearings } = useQuery<Hearing[]>({
    queryKey: ["hearings"],
    queryFn: () => getHearings({}),
  });
  const { data: tasks, isLoading: isLoadingTasks } = useQuery<Task[]>({
    queryKey: ["tasks"],
    queryFn: getTasks,
  });

  const isLoading = isLoadingClients || isLoadingCases || isLoadingHearings || isLoadingTasks;

  const stats = {
    totalClients: clients?.length ?? 0,
    activeCases: cases?.filter((c: Case) => c.status !== "مكتملة").length ?? 0,
    upcomingHearings: hearings?.filter((h: Hearing) => new Date(h.hearing_date) >= new Date()).length ?? 0,
    pendingTasks: tasks?.filter(t => !t.done).length ?? 0,
  };

  const upcomingHearingsList = hearings
    ?.filter((h: Hearing) => new Date(h.hearing_date) >= new Date())
    .sort((a: Hearing, b: Hearing) => new Date(a.hearing_date).getTime() - new Date(b.hearing_date).getTime())
    .slice(0, 5);

  const pendingTasksList = tasks
    ?.filter(t => !t.done)
    .sort((a, b) => {
        const priorityOrder: { [key: string]: number } = { 'عالية': 1, 'متوسط': 2, 'منخفضة': 3 };
        return (priorityOrder[a.priority || 'متوسط'] || 2) - (priorityOrder[b.priority || 'متوسط'] || 2);
    })
    .slice(0, 5);

  const getPriorityBadgeVariant = (priority: string | null | undefined) => {
    switch (priority) {
      case 'عالية': return 'destructive';
      case 'متوسط': return 'secondary';
      case 'منخفضة': return 'outline';
      default: return 'default';
    }
  };

  // Prepare data for CaseTypePieChart
  const caseTypeData = useMemo(() => {
    if (!cases) return [];
    const typeCounts: { [key: string]: number } = {};
    cases.forEach((c: Case) => {
      typeCounts[c.case_category] = (typeCounts[c.case_category] || 0) + 1;
    });
    return Object.entries(typeCounts).map(([name, value]) => ({ name, value }));
  }, [cases]);

  // Prepare data for MonthlyCaseBarChart
  const monthlyCaseData = useMemo(() => {
    if (!cases) return [];
    const monthCounts: { [key: string]: number } = {};
    cases.forEach((c: Case) => {
      if (c.registered_at) { // Changed from filing_date to registered_at
        const date = parseISO(c.registered_at);
        const monthYear = format(date, "MMM yyyy", { locale: ar });
        monthCounts[monthYear] = (monthCounts[monthYear] || 0) + 1;
      }
    });
    // Sort by date to ensure correct order
    const sortedMonths = Object.keys(monthCounts).sort((a, b) => {
      // This parsing logic needs to be robust for Arabic month names if they are not standard ISO
      // For simplicity, assuming 'MMM yyyy' can be parsed or a custom sort is needed.
      // A more robust solution might involve mapping Arabic month names to numbers.
      const dateA = new Date(a.replace(/(\S+) (\d{4})/, '01 $1 $2')); // Simplified parsing, might need adjustment for actual Arabic month names
      const dateB = new Date(b.replace(/(\S+) (\d{4})/, '01 $1 $2'));
      return dateA.getTime() - dateB.getTime();
    });

    return sortedMonths.map(monthYear => ({
      name: monthYear,
      cases: monthCounts[monthYear],
    }));
  }, [cases]);


  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">مكتب الأستاذ سايج محمد</h1>
        <p className="text-gray-600 dark:text-gray-400">لوحة التحكم الرئيسية</p>
      </div>
      
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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
        <div className="lg:col-span-1">
          <CaseTypePieChart data={caseTypeData} isLoading={isLoadingCases} />
        </div>
        <div className="lg:col-span-2">
          <MonthlyCaseBarChart data={monthlyCaseData} isLoading={isLoadingCases} />
        </div>
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
                  upcomingHearingsList.map((hearing: Hearing) => (
                    <TableRow key={hearing.id}>
                      <TableCell>{format(new Date(hearing.hearing_date), "yyyy/MM/dd", { locale: ar })}</TableCell>
                      <TableCell>
                        <Link to={`/cases/${hearing.case_id}`} className="hover:underline text-primary">
                          {hearing.case_number}
                        </Link>
                      </TableCell>
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
                            {task.case_id ? (
                                <Link to={`/cases/${task.case_id}`} className="hover:underline text-primary">
                                    <span>{task.title}</span>
                                </Link>
                            ) : (
                                <span>{task.title}</span>
                            )}
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