import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getCaseById, Case as CaseType, Client, Hearing, Task, CaseFile, FinancialTransaction, Adjournment, Party } from "./actions"; // استيراد CaseType وجميع الأنواع الفرعية
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { CaseHearings } from "./CaseHearings";
import { CaseTasks } from "./CaseTasks";
import { CaseDocuments } from "./CaseDocuments";
import { CaseFinancials } from "./CaseFinancials";
import { CaseAdjournments } from "./CaseAdjournments";
import { CaseParties } from "./CaseParties"; // استيراد مكون الأطراف الجديد
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Briefcase, CalendarClock, ListTodo, FileText, DollarSign, ChevronsRight, Users } from "lucide-react"; // استيراد أيقونة Users للأطراف

// استخدام CaseType مباشرة من actions.ts لضمان الاتساق
type CaseDetailsData = CaseType;

const CaseDetails = () => {
  const { caseId } = useParams<{ caseId: string }>();

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
        </div>
        <Skeleton className="h-12 w-full" />
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

      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-7"> {/* زيادة عدد الأعمدة لعلامات التبويب */}
          <TabsTrigger value="details"><Briefcase className="w-4 h-4 ml-2" />التفاصيل</TabsTrigger>
          <TabsTrigger value="parties"><Users className="w-4 h-4 ml-2" />الأطراف</TabsTrigger> {/* علامة تبويب جديدة للأطراف */}
          <TabsTrigger value="hearings"><CalendarClock className="w-4 h-4 ml-2" />الجلسات</TabsTrigger>
          <TabsTrigger value="adjournments"><ChevronsRight className="w-4 h-4 ml-2" />التأجيلات</TabsTrigger>
          <TabsTrigger value="tasks"><ListTodo className="w-4 h-4 ml-2" />المهام</TabsTrigger>
          <TabsTrigger value="documents"><FileText className="w-4 h-4 ml-2" />المستندات</TabsTrigger>
          <TabsTrigger value="financials"><DollarSign className="w-4 h-4 ml-2" />الأمور المالية</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader><CardTitle>معلومات أساسية</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <p><strong>الموكل:</strong> {caseDetails.clients?.full_name || "غير محدد"}</p>
                <p><strong>نوع القضية:</strong> {caseDetails.case_type}</p>
                <p><strong>فئة القضية:</strong> {caseDetails.case_category}</p> {/* حقل جديد */}
                <p><strong>جهة التقاضي:</strong> {caseDetails.court}</p>
                <p><strong>القسم/الغرفة:</strong> {caseDetails.court_division_or_chamber || "-"}</p> {/* اسم الحقل المحدث */}
                <p><strong>تاريخ القيد:</strong> {caseDetails.filing_date ? format(new Date(caseDetails.filing_date), "PPP") : "-"}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>الأطراف الرئيسية</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <p><strong>صفة الموكل:</strong> {caseDetails.role_in_favor || "-"}</p>
                <p><strong>صفة الخصم:</strong> {caseDetails.role_against || "-"}</p>
                <p><strong>نوع الطعن:</strong> {caseDetails.appeal_type || "-"}</p> {/* حقل جديد */}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>الأتعاب التقديرية</CardTitle></CardHeader>
              <CardContent>
                <p><strong>الأتعاب التقديرية:</strong> {caseDetails.fees_estimated ? `${caseDetails.fees_estimated} د.ج` : "-"}</p>
              </CardContent>
            </Card>

            {/* Complaint Details Card */}
            {(caseDetails.complaint_number || caseDetails.complaint_registration_date || caseDetails.complaint_status || caseDetails.complaint_followed_by) && (
              <Card className="md:col-span-2 lg:col-span-3">
                <CardHeader><CardTitle>تفاصيل الشكوى</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  <p><strong>رقم الشكوى:</strong> {caseDetails.complaint_number || "-"}</p>
                  <p><strong>تاريخ التسجيل:</strong> {caseDetails.complaint_registration_date ? format(new Date(caseDetails.complaint_registration_date), "PPP") : "-"}</p>
                  <p><strong>حالة الشكوى:</strong> {caseDetails.complaint_status || "-"}</p>
                  <p><strong>متابعة من قبل:</strong> {caseDetails.complaint_followed_by || "-"}</p>
                </CardContent>
              </Card>
            )}

            <Card className="md:col-span-2 lg:col-span-3">
              <CardHeader><CardTitle>ملاحظات</CardTitle></CardHeader>
              <CardContent>
                <p>{caseDetails.notes || "لا توجد ملاحظات."}</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="parties" className="mt-6">
          <CaseParties caseId={caseDetails.id} parties={caseDetails.parties} />
        </TabsContent>

        <TabsContent value="hearings" className="mt-6">
          <CaseHearings caseId={caseDetails.id} hearings={caseDetails.hearings} />
        </TabsContent>

        <TabsContent value="adjournments" className="mt-6">
          <CaseAdjournments caseId={caseDetails.id} adjournments={caseDetails.adjournments} />
        </TabsContent>

        <TabsContent value="tasks" className="mt-6">
          <CaseTasks caseId={caseDetails.id} tasks={caseDetails.tasks} />
        </TabsContent>

        <TabsContent value="documents" className="mt-6">
          <CaseDocuments caseId={caseDetails.id} files={caseDetails.case_files} />
        </TabsContent>

        <TabsContent value="financials" className="mt-6">
          <CaseFinancials caseId={caseDetails.id} transactions={caseDetails.financial_transactions} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CaseDetails;