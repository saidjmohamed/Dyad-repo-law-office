import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Case } from "./actions";
import { useEffect } from "react";
import { ar } from 'date-fns/locale';
import { caseFormSchema, CaseFormValues, partySchema } from "./caseSchema"; // استيراد المخطط والنوع
import {
  caseCategoryOptions,
  procedureTypeOptions,
  jurisdictionSectionOptions,
  supremeCourtChamberOptions,
  criminalOffenseTypeOptions,
  feesStatusOptions,
  accessControlOptions,
} from "@/data/caseOptions"; // استيراد الخيارات الجديدة
import { CasePartyFields } from "./CasePartyFields";
import { CaseAttachmentFields } from "./CaseAttachmentFields";
import { Checkbox } from "@/components/ui/checkbox";

interface CaseFormProps {
  initialData?: Case;
  onSubmit: (data: CaseFormValues) => void;
  isLoading: boolean;
  clients: { id: string; full_name: string }[];
}

export const CaseForm = ({ initialData, onSubmit, isLoading, clients }: CaseFormProps) => {
  const form = useForm<CaseFormValues>({
    resolver: zodResolver(caseFormSchema),
    defaultValues: {
      case_category: initialData?.case_category || "",
      procedure_type: initialData?.procedure_type || "",
      case_number: initialData?.case_number || null,
      registered_at: initialData?.registered_at ? new Date(initialData.registered_at) : new Date(),
      court_name: initialData?.court_name || null,
      province: initialData?.province || null,
      jurisdiction_section: initialData?.jurisdiction_section || null,
      appeal_to_court: initialData?.appeal_to_court || null,
      supreme_court_chamber: initialData?.supreme_court_chamber || null,

      plaintiffs: initialData?.case_parties?.filter(p => p.party_type === 'plaintiff') || [{ name: '', party_type: 'plaintiff', role: null, role_detail: null, address: null, id_number: null, contact: null, representative: null }],
      defendants: initialData?.case_parties?.filter(p => p.party_type === 'defendant') || [{ name: '', party_type: 'defendant', role: null, role_detail: null, address: null, id_number: null, contact: null, representative: null }],
      other_parties: initialData?.case_parties?.filter(p => p.party_type === 'other') || [],

      criminal_offense_type: initialData?.criminal_offense_type || null,
      complaint_filed_with: initialData?.complaint_filed_with || null,
      investigation_number: initialData?.investigation_number || null,

      original_case_number: initialData?.original_case_number || null,
      original_judgment_date: initialData?.original_judgment_date ? new Date(initialData.original_judgment_date) : undefined,
      appellant_or_opponent: initialData?.appellant_or_opponent || null,
      grounds_of_appeal: initialData?.grounds_of_appeal || null,

      first_hearing_date: initialData?.first_hearing_date ? new Date(initialData.first_hearing_date) : undefined,
      last_postponement_date: initialData?.last_postponement_date ? new Date(initialData.last_postponement_date) : undefined,
      postponement_reason: initialData?.postponement_reason || null,
      next_hearing_date: initialData?.next_hearing_date ? new Date(initialData.next_hearing_date) : undefined,
      judgment_text: initialData?.judgment_text || null,
      statute_of_limitations: initialData?.statute_of_limitations || null,

      fees_amount: initialData?.fees_amount ?? null,
      fees_status: initialData?.fees_status || null,
      fees_notes: initialData?.fees_notes || null,

      internal_notes: initialData?.internal_notes || null,
      public_summary: initialData?.public_summary || null,

      created_by: initialData?.created_by || null,
      created_at: initialData?.created_at ? new Date(initialData.created_at) : new Date(),
      last_modified_by: initialData?.last_modified_by || null,
      last_modified_at: initialData?.last_modified_at ? new Date(initialData.last_modified_at) : undefined,
      access_control: initialData?.access_control || [],
    },
  });

  const selectedCaseCategory = form.watch("case_category");
  const selectedProcedureType = form.watch("procedure_type");

  const showCriminalDetails = selectedCaseCategory === "جزائي";
  const showAppealDetails = ["استئناف", "معارضة", "طعن بالنقض", "إلتماس إعادة النظر"].includes(selectedProcedureType);

  // Reset conditional fields when conditions change
  useEffect(() => {
    if (!showCriminalDetails) {
      form.setValue("criminal_offense_type", null);
      form.setValue("complaint_filed_with", null);
      form.setValue("investigation_number", null);
    }
    if (!showAppealDetails) {
      form.setValue("original_case_number", null);
      form.setValue("original_judgment_date", null);
      form.setValue("appellant_or_opponent", null);
      form.setValue("grounds_of_appeal", null);
    }
  }, [showCriminalDetails, showAppealDetails, form]);

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* معلومات عامة عن القضية */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold">معلومات عامة عن القضية</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="case_category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>نوع القضية</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر نوع القضية..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {caseCategoryOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="procedure_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>نوع الإجراء</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر نوع الإجراء..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {procedureTypeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="case_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>رقم القضية (إن وُجد)</FormLabel>
                  <FormControl>
                    <Input placeholder="مثال: 123/2025" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="registered_at"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>تاريخ تسجيل القضية</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: ar })
                          ) : (
                            <span>اختر تاريخًا</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value || undefined}
                        onSelect={field.onChange}
                        initialFocus
                        locale={ar}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="client_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الموكل</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(value === "none" ? null : value)}
                    value={field.value || "none"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر موكلاً (اختياري)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">لا يوجد موكل</SelectItem>
                      {clients?.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* المحكمة / المجلس */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold">المحكمة / المجلس</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="court_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>اسم المحكمة / المجلس</FormLabel>
                  <FormControl>
                    <Input placeholder="اكتب اسم المحكمة أو اتركها فارغة لتعبئتها لاحقاً" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="province"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الولاية (الحالة/الولاية القضائية)</FormLabel>
                  <FormControl>
                    <Input placeholder="مثال: الجزائر العاصمة" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="jurisdiction_section"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الاختصاص / القسم / الغرفة</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الاختصاص..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {jurisdictionSectionOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="appeal_to_court"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>محكمة الاستئناف / المجلس (إن وُجد)</FormLabel>
                  <FormControl>
                    <Input placeholder="اكتب اسم محكمة الاستئناف أو اتركها إن لم ينطبق" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="supreme_court_chamber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>غرفة المحكمة العليا (إن وُجد طعن بالنقض)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الغرفة..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {supremeCourtChamberOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* بيانات الأطراف */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold">بيانات الأطراف</h2>
          <CasePartyFields name="plaintiffs" label="المدعي/المدعون" partyType="plaintiff" />
          <CasePartyFields name="defendants" label="المدعى عليه/المدعى عليهم" partyType="defendant" />
          <CasePartyFields name="other_parties" label="أطراف أخرى" partyType="other" showRoleSelect={true} />
        </div>

        {/* بيانات جزائية (شرطية) */}
        {showCriminalDetails && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">تفاصيل القضية الجزائية</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="criminal_offense_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نوع الشكوى / الجرم</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر نوع الشكوى..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {criminalOffenseTypeOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="complaint_filed_with"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الجهة المودع لديها الشكوى</FormLabel>
                    <FormControl>
                      <Input placeholder="مثال: الشرطة القضائية، النيابة" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="investigation_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رقم/مرجع التحقيق (إن وُجد)</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        )}

        {/* تفاصيل الطعون والإجراءات الخاصة (شرطية) */}
        {showAppealDetails && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">تفاصيل الطعون والإجراءات الخاصة</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="original_case_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رقم القضية الأصلية</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="original_judgment_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>تاريخ الحكم/القرار الأصلي</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: ar })
                            ) : (
                              <span>اختر تاريخًا</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value || undefined}
                          onSelect={field.onChange}
                          initialFocus
                          locale={ar}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="appellant_or_opponent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>اسم المستأنف/المعارِض/الطاعن</FormLabel>
                    <FormControl>
                      <Input placeholder="إذا كان المستأنف طرفًا موجودًا أعلاه، اكتب 'موجود في الأطراف'" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="grounds_of_appeal"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>أسباب/أساس الطعن (نص حر)</FormLabel>
                    <FormControl>
                      <Textarea {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        )}

        {/* الإجراء والتواريخ والجلسات */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold">الإجراء والتواريخ والجلسات</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="first_hearing_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>تاريخ أول جلسة</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: ar })
                          ) : (
                            <span>اختر تاريخًا</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value || undefined}
                        onSelect={field.onChange}
                        initialFocus
                        locale={ar}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="last_postponement_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>تاريخ آخر تأجيل</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: ar })
                          ) : (
                            <span>اختر تاريخًا</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value || undefined}
                        onSelect={field.onChange}
                        initialFocus
                        locale={ar}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="postponement_reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>سبب التأجيل</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="next_hearing_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>تاريخ الجلسة القادمة</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: ar })
                          ) : (
                            <span>اختر تاريخًا</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value || undefined}
                        onSelect={field.onChange}
                        initialFocus
                        locale={ar}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="statute_of_limitations"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>المواعيد والآجال (المهلة القانونية)</FormLabel>
                  <FormControl>
                    <Input placeholder="مثال: أجل الاستئناف 30 يومًا من التبليغ" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="judgment_text"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>منطوق/نص الحكم أو القرار</FormLabel>
                  <FormControl>
                    <Textarea {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* الأتعاب والمبالغ */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold">الأتعاب والمبالغ</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="fees_amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>مبلغ الأتعاب المتفق عليه (دج)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fees_status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>حالة الدفع</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر حالة الدفع..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {feesStatusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fees_notes"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>ملاحظات حول الدفع</FormLabel>
                  <FormControl>
                    <Textarea {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* الملاحظات */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold">ملاحظات</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="internal_notes"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>ملاحظات داخلية (خاصة بالمكتب)</FormLabel>
                  <FormControl>
                    <Textarea {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="public_summary"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>ملخص موجز للقضية (للاستخدام العام)</FormLabel>
                  <FormControl>
                    <Textarea {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* صلاحيات الوصول */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold">صلاحيات الوصول للملف</h2>
          <FormField
            control={form.control}
            name="access_control"
            render={({ field }) => (
              <FormItem>
                <FormLabel>تعيين من يمكنه الوصول لهذا الملف</FormLabel>
                <div className="grid grid-cols-2 gap-2">
                  {accessControlOptions.map((option) => (
                    <FormField
                      key={option.value}
                      control={form.control}
                      name="access_control"
                      render={({ field: innerField }) => {
                        return (
                          <FormItem
                            key={option.value}
                            className="flex flex-row items-start space-x-3 space-x-reverse space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={innerField.value?.includes(option.value)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? innerField.onChange([...(innerField.value || []), option.value])
                                    : innerField.onChange(
                                        (innerField.value || []).filter(
                                          (value) => value !== option.value
                                        )
                                      );
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {option.label}
                            </FormLabel>
                          </FormItem>
                        );
                      }}
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* المرفقات - سيتم التعامل معها بشكل منفصل في CaseDetails */}
        {/* <CaseAttachmentFields name="attachments" label="المرفقات" /> */}

        <Button type="submit" disabled={isLoading}>
          {isLoading ? "جاري الحفظ..." : "حفظ القضية"}
        </Button>
      </form>
    </FormProvider>
  );
};