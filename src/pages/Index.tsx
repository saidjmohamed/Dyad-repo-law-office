import { useQuery } from "@tanstack/react-query";
import { getClients } from "./clients/actions";
import { getCases, Case as CaseType } from "./cases/actions"; // Import Case type from actions
import { getTasks, Task as TaskType } from "./tasks/actions"; // Import Task type from actions
import { getHearings, Hearing as HearingType } from "./hearings/actions"; // Import Hearing type from actions
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, FolderOpen, Users, CalendarCheck } from "lucide-react";
import { Client } from "./clients/ClientList"; // Import Client type
import { Link } from "react-router-dom";

const Index = () => {
  const { data: clients, isLoading: isLoadingClients } = useQuery<Client[]>({
    queryKey: ["clients"],
    queryFn: () => getClients({}), // Corrected queryFn call
  });

  const { data: cases, isLoading: isLoadingCases } = useQuery<CaseType[]>({ // Use CaseType
    queryKey: ["cases"],
    queryFn: () => getCases({}), // Pass empty filters object
  });

  const { data: tasks, isLoading: isLoadingTasks } = useQuery<TaskType[]>({ // Use TaskType
    queryKey: ["tasks"],
    queryFn: getTasks,
  });

  const { data: hearings, isLoading: isLoadingHearings } = useQuery<HearingType[]>({ // Use HearingType
    queryKey: ["hearings"],
    queryFn: () => getHearings({}),
  });

  const stats = {
    totalClients: clients?.length ?? 0,
    activeCases: cases?.filter((c: CaseType) => c.status !== "مكتملة").length ?? 0, // Use CaseType
    pendingTasks: tasks?.filter((t: TaskType) => !t.done).length ?? 0, // Use TaskType
    upcomingHearings: hearings?.length ?? 0,
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">لوحة التحكم</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الموكلين</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoadingClients ? "..." : stats.totalClients}</div>
            <p className="text-xs text-muted-foreground">
              <Link to="/clients" className="text-blue-500 hover:underline">
                عرض الموكلين
              </Link>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">القضايا النشطة</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoadingCases ? "..." : stats.activeCases}</div>
            <p className="text-xs text-muted-foreground">
              <Link to="/cases" className="text-blue-500 hover:underline">
                عرض القضايا
              </Link>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المهام المعلقة</CardTitle>
            <CalendarCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoadingTasks ? "..." : stats.pendingTasks}</div>
            <p className="text-xs text-muted-foreground">
              <Link to="/tasks" className="text-blue-500 hover:underline">
                عرض المهام
              </Link>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الجلسات القادمة</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoadingHearings ? "..." : stats.upcomingHearings}</div>
            <p className="text-xs text-muted-foreground">
              <Link to="/calendar" className="text-blue-500 hover:underline">
                عرض التقويم
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;