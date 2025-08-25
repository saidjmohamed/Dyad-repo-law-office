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
import { CaseFormValues } from "./caseSchema";
import { criminalOffenseTypeOptions } from "@/data/caseOptions";

export const CaseCriminalDetailsFormSection = () => {
  const { control } = useFormContext<CaseFormValues>();

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">تفاصيل القضية الجزائية</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={control}
          name="criminal_offense_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>نوع الشكوى / الجرم</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر نوع الشكوى..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {criminalOffenseTypeOptions.map((option) => (
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
        <FormField
          control={control}
          name="complaint_filed_with"
          render={({ field }) => (
            <FormItem>
              <FormLabel>الجهة المودع لديها الشكوى</FormLabel>
              <FormControl>
                <Input placeholder="مثال: الشرطة القضائية، النيابة" {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="investigation_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>رقم/مرجع التحقيق (إن وُجد)</FormLabel>
              <FormControl>
                <Input {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};