import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getCaseById } from "./actions";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ArrowRight, CheckSquare, Mail, Phone, User } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { CaseDocuments } from "./CaseDocuments";
import { CaseFinancials } from "./CaseFinancials";

const CaseDetails = () => {
  const { caseId } = useParams<{ caseId: string }>();

  const { data: caseDetails, isLoading, isError, error } = useQuery({
    queryKey: ["case", caseId],
    queryFn: () => getCaseById(caseId!),
    enabled: !!caseId,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-1/3" />
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isError || !caseDetails) {
    return (
      <div className="text-red-500 text-center p-4">
        <p>حدث خطأ أثناء تحميل تفاصيل القضية.</p>
        {error && <p className="text-sm mt-2">الخطأ: {error.message}</p>}
      </div>
    );
  }

  const { clients: client, hearings, tasks, case_files, financial_transactions } = caseDetails;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">تفاصيل القضية: {caseDetails.case_number}</h1>
        <Link to="/cases" className="text-sm text-primary hover:underline flex items-center">
          <ArrowRight className="w-4 h-4 ml-1" />
          العودة إلى قائمة القضايا
        </Link>
      </div>
      
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>معلومات القضية</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-sm">
            <div><strong>رقم القضية:</strong> {caseDetails.case_number}</div>
            <div><strong>الحالة:</strong> <Badge>{caseDetails.status}</Badge></div>
            <div><strong>نوع القضية:</strong> {caseDetails.case_type}</div>
            <div><strong>المحكمة:</strong> {caseDetails.court}</div>
            <div><strong>تاريخ رفع الدعوى:</strong> {caseDetails.filing_date ? format(new Date(caseDetails.filing_date), "PPP") : "-"}</div>
            {caseDetails.notes && <div className="col-span-2"><strong>ملاحظات:</strong> {caseDetails.notes}</div>}
          </CardContent>
        </Card>
        
        {client && (
          <Card>
            <CardHeader>
              <CardTitle>معلومات الموكل</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center"><User className="w-4 h-4 ml-2 text-muted-foreground" /> {client.full_name}</div>
              <div className="flex items-center"><Phone className="w-4 h-4 ml-2 text-muted-foreground" /> {client.phone || "-"}</div>
              <div className="flex items-center"><Mail className="w-4 h-4 ml-2 text-muted-foreground" /> {client.email || "-"}</div>
            </CardContent>
          </Card>
        )}
      </div>

      <CaseFinancials caseId={caseDetails.id} transactions={financial_transactions || []} />

      <CaseDocuments caseId={caseDetails.id} files={case_files || []} />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>الجلسات</CardTitle>
            <CardDescription>كل الجلسات المتعلقة بهذه القضية.</CardDescription>
          </CardHeader>
          <CardContent>
            {hearings && hearings.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>النتيجة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {hearings.map(hearing => (
                    <TableRow key={hearing.id}>
                      <TableCell>{format(new Date(hearing.hearing_date), "PPP")}</TableCell>
                      <TableCell>{hearing.result || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center text-muted-foreground">لا توجد جلسات مرتبطة.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>المهام</CardTitle>
            <CardDescription>كل المهام المتعلقة بهذه القضية.</CardDescription>
          </CardHeader>
          <CardContent>
            {tasks && tasks.length > 0 ? (
              <div className="space-y-2">
                {tasks.map(task => (
                  <div key={task.id} className={cn("flex items-center text-sm", task.done && "text-muted-foreground line-through")}>
                    <CheckSquare className="w-4 h-4 ml-2" />
                    <span>{task.title}</span>
                    {task.due_date && <span className="mr-auto text-xs">{format(new Date(task.due_date), "PPP")}</span>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground">لا توجد مهام مرتبطة.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CaseDetails;