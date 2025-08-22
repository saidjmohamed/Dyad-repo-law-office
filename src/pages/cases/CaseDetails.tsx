import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getCaseById } from "./actions";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const CaseDetails = () => {
  const { id } = useParams<{ id: string }>();

  const { data: caseDetails, isLoading, isError } = useQuery({
    queryKey: ["case", id],
    queryFn: () => getCaseById(id!),
    enabled: !!id,
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
      </div>
    );
  }

  if (isError || !caseDetails) {
    return <div className="text-red-500 text-center py-10">حدث خطأ أثناء جلب تفاصيل القضية.</div>;
  }

  return (
    <div>
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
            <p><strong>الموكل:</strong> {caseDetails.client?.full_name || "غير محدد"}</p>
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
          <CardHeader><CardTitle>الأتعاب</CardTitle></CardHeader>
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
    </div>
  );
};

export default CaseDetails;