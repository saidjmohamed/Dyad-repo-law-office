import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
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
import { ar } from 'date-fns/locale';
import { CaseFormValues } from "./caseSchema";
import { caseCategoryOptions, procedureTypeOptions } from "@/data/caseOptions";
import { Button } from "@/components/ui/button"; // Added this import

interface CaseGeneralInfoFormSectionProps {
  clients: { id: string; full_name: string }[];
}

export const CaseGeneralInfoFormSection = ({ clients }: CaseGeneralInfoFormSectionProps) => {
  const { control } = useFormContext<CaseFormValues>();

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">معلومات عامة عن القضية</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={control}
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
          control={control}
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
          control={control}
          name="case_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>رقم القضية</FormLabel>
              <FormControl>
                <Input placeholder="مثال: 123/2025" {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
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
          control={control}
          name="client_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>الموكل</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(value === "none" ? null : value)}
                value={field.value ?? "none"}
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
  );
};