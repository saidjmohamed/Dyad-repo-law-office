import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { caseSchema, CaseFormData } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { judicialStructure } from "@/data/judicialStructure";

interface CaseFormProps {
  onSubmit: (data: CaseFormData) => void;
  isPending: boolean;
  defaultValues?: Partial<CaseFormData> & { id?: string };
  clients: { id: string; full_name: string }[];
}

export const CaseForm = ({ onSubmit, isPending, defaultValues, clients }: CaseFormProps) => {
  const form = useForm<CaseFormData>({
    resolver: zodResolver(caseSchema),
    defaultValues: {
      ...defaultValues,
      filing_date: defaultValues?.filing_date ? new Date(defaultValues.filing_date) : undefined,
    },
  });

  const selectedCourt = form.watch("court");

  useEffect(() => {
    if (selectedCourt) {
      form.setValue("division", "");
    }
  }, [selectedCourt, form.setValue]);

  const divisions =
    selectedCourt === judicialStructure.tribunal.title
      ? judicialStructure.tribunal.sections
      : selectedCourt === judicialStructure.court_of_appeal.title
      ? judicialStructure.court_of_appeal.chambers
      : [];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="client_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>الموكل</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الموكل..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {clients.map((client) => (
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
                  <SelectItem value="مدنية">مدنية</SelectItem>
                  <SelectItem value="جزائية">جزائية</SelectItem>
                  <SelectItem value="تجارية">تجارية</SelectItem>
                  <SelectItem value="إدارية">إدارية</SelectItem>
                  <SelectItem value="أحوال شخصية">أحوال شخصية</SelectItem>
                  <SelectItem value="عقارية">عقارية</SelectItem>
                  <SelectItem value="اجتماعية">اجتماعية</SelectItem>
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
              <FormLabel>جهة التقاضي</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر جهة التقاضي..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={judicialStructure.tribunal.title}>
                    {judicialStructure.tribunal.title}
                  </SelectItem>
                  <SelectItem value={judicialStructure.court_of_appeal.title}>
                    {judicialStructure.court_of_appeal.title}
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="division"
          render={({ field }) => (
            <FormItem>
              <FormLabel>القسم / الغرفة</FormLabel>
              <Select onValueChange={field.onChange} value={field.value} disabled={!selectedCourt}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر القسم أو الغرفة..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {divisions.map((division: string) => (
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

        <FormField
          control={form.control}
          name="case_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>رقم القضية</FormLabel>
              <FormControl>
                <Input placeholder="أدخل رقم القضية..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="filing_date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>تاريخ القيد</FormLabel>
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
                        format(field.value, "PPP")
                      ) : (
                        <span>اختر تاريخًا</span>
                      )}
                      <CalendarIcon className="mr-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value || undefined}
                    onSelect={field.onChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="role_in_favor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>صفة الموكل (لصالح)</FormLabel>
                <FormControl>
                  <Input placeholder="مدعي، مدعى عليه..." {...field} />
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
                <FormLabel>صفة الخصم (ضد)</FormLabel>
                <FormControl>
                  <Input placeholder="مدعي، مدعى عليه..." {...field} />
                </FormControl>
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
              <FormLabel>الأتعاب التقديرية</FormLabel>
              <FormControl>
                <Input type="number" placeholder="أدخل مبلغ الأتعاب..." {...field} />
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
                <Textarea placeholder="أضف ملاحظات حول القضية..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending}>
          {isPending ? "جاري الحفظ..." : "حفظ"}
        </Button>
      </form>
    </Form>
  );
};