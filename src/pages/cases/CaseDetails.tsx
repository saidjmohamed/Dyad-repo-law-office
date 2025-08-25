import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getCase, Case as CaseType, CaseParty, CaseAttachment } from "./actions"; // Use CaseType from actions
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { CaseHearings } from "./CaseHearings";
import { CaseTasks } from "./CaseTasks";
import { CaseDocuments } from "./CaseDocuments";
import { CaseFinancials } from "./CaseFinancials";
import { CaseAdjournments } from "./CaseAdjournments";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Briefcase, CalendarClock, ListTodo, FileText, DollarSign, ChevronsRight, Users } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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

type FinancialTransaction = {
  id: string;
  transaction_type: 'أتعاب' | 'مصروف';
  description: string;
  amount: number;
  transaction_date: string;
};

type Adjournment = {
  id: string;
  adjournment_date: string;
  reason?: string | null;
};

type CaseDetailsData = CaseType & { // Use CaseType here
  clients: Client;
  case_parties: CaseParty[];
  case_attachments: CaseAttachment[];
  hearings: Hearing[];
  tasks: Task[];
  financial_transactions: FinancialTransaction[];
  adjournments: Adjournment[];
};

const CaseDetails = () => {
  const { caseId } = useParams<{ caseId: string }>();

  const { data: caseDetails, isLoading, isError } = useQuery<CaseDetailsData>({
    queryKey: ["case", caseId],
    queryFn: () => getCase(caseId!) as Promise<CaseDetailsData>,
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

  const plaintiffs = caseDetails.case_parties?.filter(p => p.party_type === 'plaintiff') || [];
  const defendants = caseDetails.case_parties?.filter(p => p.party_type === 'defendant') || [];
  const otherParties = caseDetails.case_parties?.filter(p => p.party_type === 'other') || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold">تفاصيل القضية: {caseDetails.case_number || "غير محدد"}</h1>
          <p className="text-gray-600 dark:text-gray-400">
            عرض شامل لجميع المعلومات المتعلقة بالقضية.
          </p>
        </div>
        <Badge>{caseDetails.status || "جديدة"}</Badge>
      </div>

      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-6">
          <TabsTrigger value="details"><Briefcase className="w-4 h-4 ml-2" />التفاصيل</TabsTrigger>
          <TabsTrigger value="parties"><Users className="w-4 h-4 ml-2" />الأطراف</TabsTrigger>
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
                <p><strong>الموكل:</strong> {caseDetails.client_name || "غير محدد"}</p>
                <p><strong>نوع القضية:</strong> {caseDetails.case_category}</p>
                <p><strong>نوع الإجراء:</strong> {caseDetails.procedure_type}</p>
                <p><strong>تاريخ التسجيل:</strong> {caseDetails.registered_at ? format(new Date(caseDetails.registered_at), "PPP") : "-"}</p>
                <p><strong>اسم المحكمة/المجلس:</strong> {caseDetails.court_name || "-"}</p>
                <p><strong>الولاية:</strong> {caseDetails.province || "-"}</p>
                <p><strong>الاختصاص/القسم/الغرفة:</strong> {caseDetails.jurisdiction_section || "-"}</p>
                {caseDetails.appeal_to_court && <p><strong>محكمة الاستئناف:</strong> {caseDetails.appeal_to_court}</p>}
                {caseDetails.supreme_court_chamber && <p><strong>غرفة المحكمة العليا:</strong> {caseDetails.supreme_court_chamber}</p>}
              </CardContent>
            </Card>

            {caseDetails.criminal_offense_type && (
              <Card>
                <CardHeader><CardTitle>تفاصيل جزائية</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  <p><strong>نوع الشكوى/الجرم:</strong> {caseDetails.criminal_offense_type}</p>
                  <p><strong>الجهة المودع لديها الشكوى:</strong> {caseDetails.complaint_filed_with || "-"}</p>
                  <p><strong>رقم/مرجع التحقيق:</strong> {caseDetails.investigation_number || "-"}</p>
                </CardContent>
              </Card>
            )}

            {(caseDetails.original_case_number || caseDetails.grounds_of_appeal) && (
              <Card>
                <CardHeader><CardTitle>تفاصيل الطعون</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  <p><strong>رقم القضية الأصلية:</strong> {caseDetails.original_case_number || "-"}</p>
                  <p><strong>تاريخ الحكم الأصلي:</strong> {caseDetails.original_judgment_date ? format(new Date(caseDetails.original_judgment_date), "PPP") : "-"}</p>
                  <p><strong>المستأنف/الطاعن:</strong> {caseDetails.appellant_or_opponent || "-"}</p>
                  <p><strong>أسباب الطعن:</strong> {caseDetails.grounds_of_appeal || "-"}</p>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader><CardTitle>تواريخ وإجراءات</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <p><strong>تاريخ أول جلسة:</strong> {caseDetails.first_hearing_date ? format(new Date(caseDetails.first_hearing_date), "PPP") : "-"}</p>
                <p><strong>تاريخ آخر تأجيل:</strong> {caseDetails.last_postponement_date ? format(new Date(caseDetails.last_postponement_date), "PPP") : "-"}</p>
                <p><strong>سبب التأجيل:</strong> {caseDetails.postponement_reason || "-"}</p>
                <p><strong>تاريخ الجلسة القادمة:</strong> {caseDetails.next_hearing_date ? format(new Date(caseDetails.next_hearing_date), "PPP") : "-"}</p>
                <p><strong>المواعيد والآجال:</strong> {caseDetails.statute_of_limitations || "-"}</p>
                <p><strong>منطوق الحكم:</strong> {caseDetails.judgment_text || "-"}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>الأتعاب والملاحظات المالية</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <p><strong>مبلغ الأتعاب المتفق عليه:</strong> {caseDetails.fees_amount ? `${caseDetails.fees_amount} د.ج` : "-"}</p>
                <p><strong>حالة الدفع:</strong> {caseDetails.fees_status || "-"}</p>
                <p><strong>ملاحظات حول الدفع:</strong> {caseDetails.fees_notes || "-"}</p>
              </CardContent>
            </Card>

            <Card className="md:col-span-2 lg:col-span-3">
              <CardHeader><CardTitle>ملاحظات داخلية وملخص عام</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <p><strong>ملاحظات داخلية:</strong> {caseDetails.internal_notes || "لا توجد ملاحظات داخلية."}</p>
                <p><strong>ملخص عام:</strong> {caseDetails.public_summary || "لا يوجد ملخص عام."}</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="parties" className="mt-6">
          <Card className="mb-6">
            <CardHeader><CardTitle>المدعون</CardTitle></CardHeader>
            <CardContent>
              {plaintiffs.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>الاسم</TableHead>
                      <TableHead>الصفة</TableHead>
                      <TableHead>العنوان</TableHead>
                      <TableHead>الاتصال</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {plaintiffs.map(party => (
                      <TableRow key={party.id}>
                        <TableCell>{party.name}</TableCell>
                        <TableCell>{party.role_detail || "-"}</TableCell>
                        <TableCell>{party.address || "-"}</TableCell>
                        <TableCell>{party.contact || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-4">لا يوجد مدعون مسجلون.</p>
              )}
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader><CardTitle>المدعى عليهم</CardTitle></CardHeader>
            <CardContent>
              {defendants.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>الاسم</TableHead>
                      <TableHead>الصفة</TableHead>
                      <TableHead>العنوان</TableHead>
                      <TableHead>الاتصال</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {defendants.map(party => (
                      <TableRow key={party.id}>
                        <TableCell>{party.name}</TableCell>
                        <TableCell>{party.role_detail || "-"}</TableCell>
                        <TableCell>{party.address || "-"}</TableCell>
                        <TableCell>{party.contact || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-4">لا يوجد مدعى عليهم مسجلون.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>أطراف أخرى</CardTitle></CardHeader>
            <CardContent>
              {otherParties.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>الاسم</TableHead>
                      <TableHead>الدور</TableHead>
                      <TableHead>العنوان</TableHead>
                      <TableHead>الاتصال</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {otherParties.map(party => (
                      <TableRow key={party.id}>
                        <TableCell>{party.name}</TableCell>
                        <TableCell>{party.role || "-"}</TableCell>
                        <TableCell>{party.address || "-"}</TableCell>
                        <TableCell>{party.contact || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-4">لا توجد أطراف أخرى مسجلة.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hearings" className="mt-6">
          <CaseHearings caseId={caseDetails.id} hearings={caseDetails.hearings || []} />
        </TabsContent>

        <TabsContent value="adjournments" className="mt-6">
          <CaseAdjournments caseId={caseDetails.id} adjournments={caseDetails.adjournments || []} />
        </TabsContent>

        <TabsContent value="tasks" className="mt-6">
          <CaseTasks caseId={caseDetails.id} tasks={caseDetails.tasks || []} />
        </TabsContent>

        <TabsContent value="documents" className="mt-6">
          <CaseDocuments caseId={caseDetails.id} files={caseDetails.case_attachments || []} />
        </TabsContent>

        <TabsContent value="financials" className="mt-6">
          <CaseFinancials caseId={caseDetails.id} transactions={caseDetails.financial_transactions || []} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CaseDetails;