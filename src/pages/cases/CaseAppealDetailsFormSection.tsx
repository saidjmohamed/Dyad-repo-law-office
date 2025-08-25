import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { ar } from 'date-fns/locale';
import { CaseFormValues } from "./caseSchema";
import { Button } from "@/components/ui/button"; // Added this import

export const CaseAppealDetailsFormSection = () => {
  const { control } = useFormContext<CaseFormValues>();

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">تفاصيل الطعون والإجراءات الخاصة</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={control}
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
          control={control}
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
          control={control}
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
          control={control}
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
  );
};