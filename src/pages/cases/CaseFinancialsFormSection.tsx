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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CaseFormValues } from "./caseSchema";
import { feesStatusOptions } from "@/data/caseOptions";

export const CaseFinancialsFormSection = () => {
  const { control } = useFormContext<CaseFormValues>();

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">الأتعاب والمبالغ</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={control}
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
          control={control}
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
          control={control}
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
  );
};