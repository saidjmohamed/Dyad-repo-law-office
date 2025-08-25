import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { CaseFormValues } from "./caseSchema";
import { accessControlOptions } from "@/data/caseOptions";

export const CaseAccessControlFormSection = () => {
  const { control } = useFormContext<CaseFormValues>();

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">صلاحيات الوصول للملف</h2>
      <FormField
        control={control}
        name="access_control"
        render={({ field }) => (
          <FormItem>
            <FormLabel>تعيين من يمكنه الوصول لهذا الملف</FormLabel>
            <div className="grid grid-cols-2 gap-2">
              {accessControlOptions.map((option) => (
                <FormItem
                  key={option.value}
                  className="flex flex-row items-start space-x-3 space-x-reverse space-y-0"
                >
                  <FormControl>
                    <Checkbox
                      checked={field.value?.includes(option.value)}
                      onCheckedChange={(checked) => {
                        return checked
                          ? field.onChange([...(field.value || []), option.value])
                          : field.onChange(
                              (field.value || []).filter(
                                (value) => value !== option.value
                              )
                            );
                      }}
                    />
                  </FormControl>
                  <FormLabel className="font-normal">
                    {option.label}
                  </FormLabel>
                </FormItem>
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};