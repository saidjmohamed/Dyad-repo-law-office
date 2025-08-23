import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getCaseById } from "./actions";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { CaseHearings } from "./CaseHearings";
import { CaseTasks } from "./CaseTasks";
import { CaseDocuments } from "./CaseDocuments";
import { CaseFinancials } from "./CaseFinancials";

// Define types for the fetched data
type Client = {
  id: string;
  full_name: string;
  national_id?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  notes?: string | null;
};

type Hearing = {
  id: string;
  hearing_date: string;
  room?: string | null;
  judge?: string | null;
  result?: string | null;
  notes?: string | null;
};

type Task = {
  id: string;
  title: string;
  done: boolean;
  due_date: string | null;
  priority: string | null;
  case_id: string;
};

type CaseFile = {
  id: string;
  file_name: string;
  file_path: string;
  uploaded_at: string;
  size: number;
};

type FinancialTransaction = {
  id: string;
  transaction_type: 'أتعاب' | 'مصروف';
  description: string;
  amount: number;
  transaction_date: string;
};

type CaseDetailsData = {
  id: string;
  case_type: string;
  court: string;
  division?: string | null;
  case_number: string;
  filing_date?: string | null;
  role_in_favor?: string | null;
  role_against?: string | null;
  fees_estimated?: number | null;
  notes?: string | null;
  status?: string | null;
  clients: Client; // Changed from clients? to clients
  hearings: Hearing[];
  tasks: Task[];
  case_files: CaseFile[];
  financial_transactions: FinancialTransaction[];
};

const CaseDetails = () => {
  const { caseId } = useParams<{ caseId: string }>(); // Changed id to caseId for clarity

  const { data: caseDetails, isLoading, isError } = useQuery<CaseDetailsData>({
    queryKey: ["case", caseId],
    queryFn: () => getCaseById(caseId!),
    enabled: !!caseId,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-1/2" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isError || !caseDetails) {
    return <div className="text-red-500 text-center py-10">حدث خطأ أثناء جلب تفاصيل القضية.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold">تفاصيل القضية: {caseDetails.case_number}</h1>
          <p className="text-gray-600 dark:text-gray-400">
            عرض شامل لجميع المعلومات المتعلقة بالقضية.
          </p>
        </div>
        <Badge>{caseDetails.status || "جديدة"}</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader><CardTitle>معلومات أساسية</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <p><strong>الموكل:</strong> {caseDetails.clients?.full_name || "غير محدد"}</p>
            <p><strong>نوع القضية:</strong> {caseDetails.case_type}</p>
            <p><strong>جهة التقاضي:</strong> {caseDetails.court}</p>
            <p><strong>القسم/الغرفة:</strong> {caseDetails.division || "-"}</p>
            <p><strong>تاريخ القيد:</strong> {caseDetails.filing_date ? format(new Date(caseDetails.filing_date), "PPP") : "-"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>الأطراف</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <p><strong>صفة الموكل:</strong> {caseDetails.role_in_favor || "-"}</p>
            <p><strong>صفة الخصم:</strong> {caseDetails.role_against || "-"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>الأتعاب التقديرية</CardTitle></CardHeader>
          <CardContent>
            <p><strong>الأتعاب التقديرية:</strong> {caseDetails.fees_estimated ? `${caseDetails.fees_estimated} د.ج` : "-"}</p>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 lg:col-span-3">
          <CardHeader><CardTitle>ملاحظات</CardTitle></CardHeader>
          <CardContent>
            <p>{caseDetails.notes || "لا توجد ملاحظات."}</p>
          </CardContent>
        </Card>
      </div>

      {/* Related Entities Sections */}
      <CaseHearings caseId={caseDetails.id} hearings={caseDetails.hearings} />
      <CaseTasks caseId={caseDetails.id} tasks={caseDetails.tasks} />
      <CaseDocuments caseId={caseDetails.id} files={caseDetails.case_files} />
      <CaseFinancials caseId={caseDetails.id} transactions={caseDetails.financial_transactions} />
    </div>
  );
};

export default CaseDetails;