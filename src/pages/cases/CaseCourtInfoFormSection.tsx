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
import { jurisdictionSectionOptions, supremeCourtChamberOptions } from "@/data/caseOptions";

export const CaseCourtInfoFormSection = () => {
  const { control } = useFormContext<CaseFormValues>();

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">المحكمة / المجلس</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={control}
          name="court_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>اسم المحكمة / المجلس</FormLabel>
              <FormControl>
                <Input placeholder="اكتب اسم المحكمة أو اتركها فارغة لتعبئتها لاحقاً" {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="province"
          render={({ field }) => (
            <FormItem>
              <FormLabel>الولاية (الحالة/الولاية القضائية)</FormLabel>
              <FormControl>
                <Input placeholder="مثال: الجزائر العاصمة" {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="jurisdiction_section"
          render={({ field }) => (
            <FormItem>
              <FormLabel>الاختصاص / القسم / الغرفة</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الاختصاص..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {jurisdictionSectionOptions.map((option) => (
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
          name="appeal_to_court"
          render={({ field }) => (
            <FormItem>
              <FormLabel>محكمة الاستئناف / المجلس (إن وُجد)</FormLabel>
              <FormControl>
                <Input placeholder="اكتب اسم محكمة الاستئناف أو اتركها إن لم ينطبق" {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="supreme_court_chamber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>غرفة المحكمة العليا (إن وُجد طعن بالنقض)</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الغرفة..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {supremeCourtChamberOptions.map((option) => (
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
    </div>
  );
};