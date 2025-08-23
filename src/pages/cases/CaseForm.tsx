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
import { Case } from "./actions";
import { useEffect } from "react";
import { ar } from 'date-fns/locale';
import { caseFormSchema, CaseFormValues } from "./caseSchema"; // استيراد المخطط والنوع
import { caseTypeOptions, courtOptions, divisionOptions, criminalSubtypeOptions, statusOptions } from "@/data/caseOptions"; // استيراد الخيارات

interface CaseFormProps {
  initialData?: Case;
  onSubmit: (data: CaseFormValues) => void;
  isLoading: boolean;
  clients: { id: string; full_name: string }[];
}

export const CaseForm = ({ initialData, onSubmit, isLoading, clients }: CaseFormProps) => {
  const form = useForm<CaseFormValues>({
    resolver: zodResolver(caseFormSchema), // استخدام المخطط المستورد
    defaultValues: {
      case_type: initialData?.case_type || "",
      court: initialData?.court || null,
      division: initialData?.division || null,
      criminal_subtype: initialData?.criminal_subtype || null,
      case_number: initialData?.case_number || "",
      filing_date: initialData?.filing_date ? new Date(initialData.filing_date) : undefined,
      role_in_favor: initialData?.role_in_favor || null,
      role_against: initialData?.role_against || null,
      last_adjournment_date: initialData?.last_adjournment_date ? new Date(initialData.last_adjournment_date) : undefined,
      last_adjournment_reason: initialData?.last_adjournment_reason || null,
      next_hearing_date: initialData?.next_hearing_date ? new Date(initialData.next_hearing_date) : undefined,
      judgment_summary: initialData?.judgment_summary || null,
      status: initialData?.status || "جديدة",
      client_id: initialData?.client_id || null,
      fees_estimated: initialData?.fees_estimated ?? null,
      notes: initialData?.notes || null,
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
                  <Input placeholder="أدخل رقم القضية" {...field} value={field.value ?? ""} />
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
                    {/* isLoadingClients تم إزالته هنا لأن clients يتم تمريرها كـ prop */}
                      <>
                        <SelectItem value="">لا يوجد موكل</SelectItem>
                        {clients?.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.full_name}
                          </SelectItem>
                        ))}
                      </>
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
                  <Input placeholder="أدخل اسم الطرف المدعي/المشتكي" {...field} value={field.value ?? ""} />
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
                  <Input placeholder="أدخل اسم الطرف المدعى عليه/المشتكى منه" {...field} value={field.value ?? ""} />
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
                  <Input placeholder="أدخل سبب آخر تأجيل" {...field} value={field.value ?? ""} />
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
                <Textarea placeholder="أدخل ملخص الحكم" {...field} value={field.value ?? ""} />
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
                <Textarea placeholder="أدخل أي ملاحظات إضافية" {...field} value={field.value ?? ""} />
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