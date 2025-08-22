import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { hearingSchema, HearingFormData } from "./actions";
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

interface HearingFormProps {
  onSubmit: (data: HearingFormData) => void;
  isPending: boolean;
  cases: { id: string; case_number: string; client_name: string }[];
  defaultValues?: Partial<HearingFormData>;
}

export const HearingForm = ({ onSubmit, isPending, cases, defaultValues }: HearingFormProps) => {
  const form = useForm<HearingFormData>({
    resolver: zodResolver(hearingSchema),
    defaultValues: {
      ...defaultValues,
      case_id: defaultValues?.case_id || "", // Ensure case_id is a string for Select component
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="case_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>القضية</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(value === "" ? null : value)} // Convert empty string back to null
                value={field.value || ""}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر قضية..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value=""><em>بدون قضية</em></SelectItem> {/* Option for no case */}
                  {cases.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.case_number} ({c.client_name})
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
          name="hearing_date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>تاريخ الجلسة</FormLabel>
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
                    selected={field.value}
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
          name="room"
          render={({ field }) => (
            <FormItem>
              <FormLabel>القاعة</FormLabel>
              <FormControl>
                <Input placeholder="رقم القاعة أو الدائرة..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="judge"
          render={({ field }) => (
            <FormItem>
              <FormLabel>القاضي</FormLabel>
              <FormControl>
                <Input placeholder="اسم القاضي..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="result"
          render={({ field }) => (
            <FormItem>
              <FormLabel>نتيجة الجلسة</FormLabel>
              <FormControl>
                <Textarea placeholder="ماذا تم في الجلسة..." {...field} />
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