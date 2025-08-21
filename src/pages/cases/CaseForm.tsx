import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { caseSchema, CaseFormData } from "./actions";
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
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface CaseFormProps {
  onSubmit: (data: CaseFormData) => void;
  isPending: boolean;
  clients: { id: string; full_name: string }[];
  defaultValues?: Partial<CaseFormData>;
}

export const CaseForm = ({ onSubmit, isPending, clients, defaultValues }: CaseFormProps) => {
  const form = useForm<CaseFormData>({
    resolver: zodResolver(caseSchema),
    defaultValues: defaultValues || {
      case_type: "",
      court: "",
      case_number: "",
      status: "جديدة",
      notes: "",
    },
  });

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
                    <SelectValue placeholder="اختر موكلاً..." />
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
              <FormControl>
                <Input placeholder="جنائية، مدنية، تجارية..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="court"
          render={({ field }) => (
            <FormItem>
              <FormLabel>المحكمة</FormLabel>
              <FormControl>
                <Input placeholder="المحكمة العامة بـ..." {...field} />
              </FormControl>
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
                <Input placeholder="123/45/ق" {...field} />
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
              <FormLabel>تاريخ رفع الدعوى</FormLabel>
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
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ملاحظات</FormLabel>
              <FormControl>
                <Textarea placeholder="أي ملاحظات إضافية..." {...field} />
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