import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CaseFormData, caseSchema, createCase, updateCase } from "./actions";
import { getClients } from "../clients/actions";
import { judicialStructure, Court, Council } from "@/data/judicialStructure"; // استيراد الأنواع الجديدة
import { useEffect } from "react";
import { ar } from 'date-fns/locale';

interface CaseFormProps {
  initialData?: CaseFormData | null; // السماح بـ null
  onSuccess: () => void;
}

export const CaseForm = ({ initialData, onSuccess }: CaseFormProps) => {
  const queryClient = useQueryClient();
  const form = useForm<CaseFormData>({
    resolver: zodResolver(caseSchema),
    defaultValues: {
      client_id: initialData?.client_id || "",
      case_type: initialData?.case_type || "",
      case_category: initialData?.case_category || "",
      court: initialData?.court || "",
      court_division_or_chamber: initialData?.court_division_or_chamber || "",
      case_number: initialData?.case_number || "",
      filing_date: initialData?.filing_date ? new Date(initialData.filing_date) : undefined,
      role_in_favor: initialData?.role_in_favor || "",
      role_against: initialData?.role_against || "",
      appeal_type: initialData?.appeal_type || "",
      complaint_number: initialData?.complaint_number || "",
      complaint_registration_date: initialData?.complaint_registration_date ? new Date(initialData.complaint_registration_date) : undefined,
      complaint_status: initialData?.complaint_status || "",
      complaint_followed_by: initialData?.complaint_followed_by || "",
      fees_estimated: initialData?.fees_estimated || 0,
      notes: initialData?.notes || "",
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        ...initialData,
        filing_date: initialData.filing_date ? new Date(initialData.filing_date) : undefined,
        complaint_registration_date: initialData.complaint_registration_date ? new Date(initialData.complaint_registration_date) : undefined,
      });
    } else {
      form.reset({
        client_id: "",
        case_type: "",
        case_category: "",
        court: "",
        court_division_or_chamber: "",
        case_number: "",
        filing_date: undefined,
        role_in_favor: "",
        role_against: "",
        appeal_type: "",
        complaint_number: "",
        complaint_registration_date: undefined,
        complaint_status: "",
        complaint_followed_by: "",
        fees_estimated: 0,
        notes: "",
      });
    }
  }, [initialData, form]);

  const { data: clients, isLoading: isLoadingClients } = useQuery({
    queryKey: ["clients"],
    queryFn: getClients,
  });

  const createCaseMutation = useMutation({
    mutationFn: createCase,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cases"] });
      toast.success("تم إنشاء القضية بنجاح.");
      onSuccess();
    },
    onError: (error) => {
      toast.error(`فشل إنشاء القضية: ${error.message}`);
    },
  });

  const updateCaseMutation = useMutation({
    mutationFn: updateCase,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cases"] });
      queryClient.invalidateQueries({ queryKey: ["case", initialData?.id] });
      toast.success("تم تحديث القضية بنجاح.");
      onSuccess();
    },
    onError: (error) => {
      toast.error(`فشل تحديث القضية: ${error.message}`);
    },
  });

  const onSubmit = (data: CaseFormData) => {
    if (initialData?.id) {
      updateCaseMutation.mutate({ id: initialData.id, ...data });
    } else {
      createCaseMutation.mutate(data);
    }
  };

  const selectedCourt = form.watch("court");
  const availableDivisionsOrChambers = selectedCourt
    ? (judicialStructure.courts.find((c: Court) => c.name === selectedCourt)?.divisions ||
      judicialStructure.councils.find((c: Council) => c.name === selectedCourt)?.chambers || [])
    : [];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-4">
        <FormField
          control={form.control}
          name="client_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>الموكل</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر موكلاً" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {isLoadingClients ? (
                    <SelectItem value="loading" disabled>جاري التحميل...</SelectItem>
                  ) : (
                    clients?.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.full_name}
                      </SelectItem>
                    ))
                  )}
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
              <FormLabel>رقم القضية</FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ""} /> {/* Ensure value is string */}
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="case_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>نوع القضية</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر نوع القضية" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {judicialStructure.case_types.map((type: string) => (
                    <SelectItem key={type} value={type}>
                      {type}
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
          name="case_category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>مدني أو جزائي</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ""}> {/* Ensure value is string */}
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر فئة القضية" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {judicialStructure.case_categories.map((category: string) => (
                    <SelectItem key={category} value={category}>
                      {category}
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
          name="court"
          render={({ field }) => (
            <FormItem>
              <FormLabel>المحكمة / المجلس</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ""}> {/* Ensure value is string */}
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر المحكمة أو المجلس" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {judicialStructure.courts.map((court: Court) => (
                    <SelectItem key={court.name} value={court.name}>
                      {court.name}
                    </SelectItem>
                  ))}
                  {judicialStructure.councils.map((council: Council) => (
                    <SelectItem key={council.name} value={council.name}>
                      {council.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        {selectedCourt && (
          <FormField
            control={form.control}
            name="court_division_or_chamber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>القسم / الغرفة</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ""}> {/* Ensure value is string */}
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر القسم أو الغرفة" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {availableDivisionsOrChambers.map((item: string) => (
                      <SelectItem key={item} value={item}>
                        {item}
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
          name="filing_date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>تاريخ التسجيل</FormLabel>
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
                    selected={field.value || undefined} // Ensure selected is Date | undefined
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
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
          name="role_in_favor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>الطرف المؤيد</FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ""} /> {/* Ensure value is string */}
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
              <FormLabel>الطرف المعارض</FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ""} /> {/* Ensure value is string */}
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="appeal_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>نوع الطعن</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ""}> {/* Ensure value is string */}
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر نوع الطعن" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {judicialStructure.appeal_types.map((type: string) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Complaint Details Section */}
        <div className="border-t pt-4 mt-4">
          <h3 className="text-lg font-semibold mb-2">تفاصيل الشكوى (اختياري)</h3>
          <FormField
            control={form.control}
            name="complaint_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>رقم الشكوى</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ""} /> {/* Ensure value is string */}
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="complaint_registration_date"
            render={({ field }) => (
              <FormItem className="flex flex-col mt-4">
                <FormLabel>تاريخ تسجيل الشكوى</FormLabel>
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
                      selected={field.value || undefined} // Ensure selected is Date | undefined
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
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
            name="complaint_status"
            render={({ field }) => (
              <FormItem className="mt-4">
                <FormLabel>حالة الشكوى</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ""} /> {/* Ensure value is string */}
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="complaint_followed_by"
            render={({ field }) => (
              <FormItem className="mt-4">
                <FormLabel>متابعة من قبل</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ""}> {/* Ensure value is string */}
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر جهة المتابعة" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {judicialStructure.complaint_followed_by_options.map((option: string) => (
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

        <FormField
          control={form.control}
          name="fees_estimated"
          render={({ field }) => (
            <FormItem>
              <FormLabel>الرسوم المقدرة</FormLabel>
              <FormControl>
                <Input type="number" {...field} value={field.value || 0} onChange={e => field.onChange(parseFloat(e.target.value))} /> {/* Ensure value is number */}
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
                <Textarea {...field} value={field.value || ""} /> {/* Ensure value is string */}
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={createCaseMutation.isPending || updateCaseMutation.isPending}>
          {initialData ? "تحديث القضية" : "إنشاء القضية"}
        </Button>
      </form>
    </Form>
  );
};