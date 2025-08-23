import { z } from "zod";
import { useForm } from "react-hook-form";
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
import { useQuery } from "@tanstack/react-query";
import { getClients } from "../clients/actions";
import { Case } from "./actions";
import { useEffect } from "react";
import { ar } from 'date-fns/locale';

const formSchema = z.object({
  case_type: z.string().min(1, "نوع القضية مطلوب"),
  court: z.string().optional().nullable(),
  division: z.string().optional().nullable(),
  criminal_subtype: z.string().optional().nullable(), // حقل جديد
  case_number: z.string().min(1, "رقم القضية مطلوب"),
  filing_date: z.date().optional().nullable(),
  role_in_favor: z.string().optional().nullable(),
  role_against: z.string().optional().nullable(),
  last_adjournment_date: z.date().optional().nullable(),
  last_adjournment_reason: z.string().optional().nullable(),
  next_hearing_date: z.date().optional().nullable(),
  judgment_summary: z.string().optional().nullable(),
  status: z.string().min(1, "الحالة مطلوبة"),
  client_id: z.string().optional().nullable(),
  fees_estimated: z.preprocess(
    (val) => (val === "" ? null : Number(val)),
    z.number().optional().nullable().refine((val) => val === null || val >= 0, {
      message: "الرسوم المقدرة يجب أن تكون رقمًا موجبًا",
    })
  ),
  notes: z.string().optional().nullable(),
});

type CaseFormValues = z.infer<typeof formSchema>;

interface CaseFormProps {
  initialData?: Case;
  onSubmit: (data: CaseFormValues) => void;
  isLoading: boolean;
}

const caseTypeOptions = [
  { value: "قضية محكمة", label: "قضية محكمة" },
  { value: "قضية جزائية", label: "قضية جزائية" },
  { value: "قضية تجارية", label: "قضية تجارية" },
  { value: "مجلس قضاء", label: "مجلس قضاء" },
  { value: "مجلس دولة", label: "مجلس دولة" },
  { value: "محكمة عليا", label: "محكمة عليا" },
];

const courtOptions = {
  "قضية محكمة": ["محكمة سيدي امحمد", "محكمة بئر مراد رايس", "محكمة حسين داي", "محكمة باب الواد"],
  "قضية جزائية": ["محكمة سيدي امحمد", "محكمة بئر مراد رايس", "محكمة حسين داي"],
  "قضية تجارية": ["المحكمة التجارية بالجزائر", "المحكمة التجارية بوهران"],
  "مجلس قضاء": ["مجلس قضاء الجزائر", "مجلس قضاء وهران", "مجلس قضاء قسنطينة"],
  "مجلس دولة": ["مجلس الدولة"],
  "محكمة عليا": ["المحكمة العليا"],
};

const divisionOptions = [
  "عقاري",
  "مدني",
  "تجاري",
  "استعجالي",
  "اجتماعي",
  "بحري",
  "أحوال شخصية",
  "إداري",
];

const criminalSubtypeOptions = [
  "شكوى لوكيل جمهورية",
  "شكوى مصحوبة بادعاء مدني لقاضي تحقيق",
];

const statusOptions = [
  { value: "جديدة", label: "جديدة" },
  { value: "قيد التنفيذ", label: "قيد التنفيذ" },
  { value: "مؤجلة", label: "مؤجلة" },
  { value: "مكتملة", label: "مكتملة" },
  { value: "مغلقة", label: "مغلقة" },
];

export const CaseForm = ({ initialData, onSubmit, isLoading }: CaseFormProps) => {
  const { data: clients, isLoading: isLoadingClients } = useQuery({
    queryKey: ["clients"],
    queryFn: getClients,
  });

  const form = useForm<CaseFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      case_type: initialData?.case_type || "",
      court: initialData?.court || "",
      division: initialData?.division || "",
      criminal_subtype: initialData?.criminal_subtype || "",
      case_number: initialData?.case_number || "",
      filing_date: initialData?.filing_date ? new Date(initialData.filing_date) : undefined,
      role_in_favor: initialData?.role_in_favor || "",
      role_against: initialData?.role_against || "",
      last_adjournment_date: initialData?.last_adjournment_date ? new Date(initialData.last_adjournment_date) : undefined,
      last_adjournment_reason: initialData?.last_adjournment_reason || "",
      next_hearing_date: initialData?.next_hearing_date ? new Date(initialData.next_hearing_date) : undefined,
      judgment_summary: initialData?.judgment_summary || "",
      status: initialData?.status || "جديدة",
      client_id: initialData?.client_id || "",
      fees_estimated: initialData?.fees_estimated || 0,
      notes: initialData?.notes || "",
    },
  });

  const selectedCaseType = form.watch("case_type");

  // Reset conditional fields when case type changes
  useEffect(() => {
    if (selectedCaseType !== "قضية جزائية") {
      form.setValue("criminal_subtype", null);
    }
    if (selectedCaseType === "قضية تجارية" || selectedCaseType === "مجلس دولة" || selectedCaseType === "محكمة عليا") {
      form.setValue("division", null);
    }
    if (selectedCaseType === "مجلس دولة" || selectedCaseType === "محكمة عليا") {
      form.setValue("court", selectedCaseType === "مجلس دولة" ? "مجلس الدولة" : "المحكمة العليا");
    } else if (selectedCaseType !== "قضية محكمة" && selectedCaseType !== "قضية جزائية" && selectedCaseType !== "قضية تجارية" && selectedCaseType !== "مجلس قضاء") {
      form.setValue("court", null);
    }
  }, [selectedCaseType, form]);


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="case_type"
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
                    {caseTypeOptions.map((option) => (
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

          {(selectedCaseType === "قضية محكمة" || selectedCaseType === "قضية جزائية" || selectedCaseType === "قضية تجارية" || selectedCaseType === "مجلس قضاء") && (
            <FormField
              control={form.control}
              name="court"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>اسم المحكمة/المجلس</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر اسم المحكمة/المجلس..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {courtOptions[selectedCaseType as keyof typeof courtOptions]?.map((courtName) => (
                        <SelectItem key={courtName} value={courtName}>
                          {courtName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {(selectedCaseType === "قضية محكمة" || selectedCaseType === "مجلس قضاء") && (
            <FormField
              control={form.control}
              name="division"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>القسم</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر القسم..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {divisionOptions.map((division) => (
                        <SelectItem key={division} value={division}>
                          {division}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {selectedCaseType === "قضية جزائية" && (
            <FormField
              control={form.control}
              name="criminal_subtype"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>نوع القضية الجزائية</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر نوع القضية الجزائية..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {criminalSubtypeOptions.map((subtype) => (
                        <SelectItem key={subtype} value={subtype}>
                          {subtype}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="case_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>رقم القضية</FormLabel>
                <FormControl>
                  <Input placeholder="أدخل رقم القضية" {...field} />
                </FormControl>
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
                <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر موكلاً (اختياري)" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {isLoadingClients ? (
                      <SelectItem value="" disabled>جاري التحميل...</SelectItem>
                    ) : (
                      <>
                        <SelectItem value="">لا يوجد موكل</SelectItem>
                        {clients?.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.full_name}
                          </SelectItem>
                        ))}
                      </>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="filing_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>تاريخ التقديم</FormLabel>
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
            name="fees_estimated"
            render={({ field }) => (
              <FormItem>
                <FormLabel>الرسوم المقدرة</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="أدخل الرسوم المقدرة" {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="role_in_favor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>الطرف المدعي/المشتكي</FormLabel>
                <FormControl>
                  <Input placeholder="أدخل اسم الطرف المدعي/المشتكي" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="role_against"
            render={({ field }) => (
              <FormItem>
                <FormLabel>الطرف المدعى عليه/المشتكى منه</FormLabel>
                <FormControl>
                  <Input placeholder="أدخل اسم الطرف المدعى عليه/المشتكى منه" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>الحالة</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر حالة القضية..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {statusOptions.map((option) => (
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
            name="last_adjournment_date"
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
            name="last_adjournment_reason"
            render={({ field }) => (
              <FormItem>
                <FormLabel>سبب آخر تأجيل</FormLabel>
                <FormControl>
                  <Input placeholder="أدخل سبب آخر تأجيل" {...field} />
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
        </div>

        <FormField
          control={form.control}
          name="judgment_summary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ملخص الحكم</FormLabel>
              <FormControl>
                <Textarea placeholder="أدخل ملخص الحكم" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ملاحظات</FormLabel>
              <FormControl>
                <Textarea placeholder="أدخل أي ملاحظات إضافية" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading}>
          {isLoading ? "جاري الحفظ..." : "حفظ القضية"}
        </Button>
      </form>
    </Form>
  );
};