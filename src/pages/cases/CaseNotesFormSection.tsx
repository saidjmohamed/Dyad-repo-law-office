import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { CaseFormValues } from "./caseSchema";

export const CaseNotesFormSection = () => {
  const { control } = useFormContext<CaseFormValues>();

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">ملاحظات</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={control}
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
          control={control}
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
  );
};