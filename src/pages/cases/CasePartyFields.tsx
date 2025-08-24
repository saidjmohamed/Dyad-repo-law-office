import { useFieldArray, useFormContext } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, PlusCircle } from 'lucide-react';
import { CaseFormValues } from './caseSchema';
import { partyRoleOptions } from '@/data/caseOptions';

interface CasePartyFieldsProps {
  name: 'plaintiffs' | 'defendants' | 'other_parties';
  label: string;
  partyType: 'plaintiff' | 'defendant' | 'other';
  showRoleSelect?: boolean;
}

export const CasePartyFields = ({ name, label, partyType, showRoleSelect = false }: CasePartyFieldsProps) => {
  const { control, formState: { errors } } = useFormContext<CaseFormValues>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: name,
  });

  const getPartyErrors = (index: number) => {
    if (errors[name] && errors[name]?.[index]) {
      return errors[name]?.[index] as any;
    }
    return undefined;
  };

  return (
    <div className="space-y-4 border p-4 rounded-md bg-muted/50">
      <h3 className="text-lg font-semibold">{label}</h3>
      {fields.map((field, index) => (
        <div key={field.id} className="space-y-4 border-t pt-4 first:border-t-0 first:pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={control}
              name={`${name}.${index}.name`}
              render={({ field: formField }) => (
                <FormItem>
                  <FormLabel>الاسم واللقب</FormLabel>
                  <FormControl>
                    <Input placeholder="الاسم الكامل" {...formField} value={formField.value ?? ""} />
                  </FormControl>
                  <FormMessage>{getPartyErrors(index)?.name?.message}</FormMessage>
                </FormItem>
              )}
            />
            {showRoleSelect && (
              <FormField
                control={control}
                name={`${name}.${index}.role`}
                render={({ field: formField }) => (
                  <FormItem>
                    <FormLabel>الدور</FormLabel>
                    <Select onValueChange={formField.onChange} defaultValue={formField.value || ""}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر الدور..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {partyRoleOptions.map((role) => (
                          <SelectItem key={role} value={role}>
                            {role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage>{getPartyErrors(index)?.role?.message}</FormMessage>
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={control}
              name={`${name}.${index}.role_detail`}
              render={({ field: formField }) => (
                <FormItem>
                  <FormLabel>صفة/صفة إضافية</FormLabel>
                  <FormControl>
                    <Input placeholder="مثال: صاحب الحق، ممثل قانوني" {...formField} value={formField.value ?? ""} />
                  </FormControl>
                  <FormMessage>{getPartyErrors(index)?.role_detail?.message}</FormMessage>
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`${name}.${index}.address`}
              render={({ field: formField }) => (
                <FormItem>
                  <FormLabel>العنوان الكامل</FormLabel>
                  <FormControl>
                    <Input placeholder="العنوان" {...formField} value={formField.value ?? ""} />
                  </FormControl>
                  <FormMessage>{getPartyErrors(index)?.address?.message}</FormMessage>
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`${name}.${index}.id_number`}
              render={({ field: formField }) => (
                <FormItem>
                  <FormLabel>رقم الهوية/جواز السفر</FormLabel>
                  <FormControl>
                    <Input placeholder="رقم الهوية" {...formField} value={formField.value ?? ""} />
                  </FormControl>
                  <FormMessage>{getPartyErrors(index)?.id_number?.message}</FormMessage>
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`${name}.${index}.contact`}
              render={({ field: formField }) => (
                <FormItem>
                  <FormLabel>الهاتف/البريد الإلكتروني</FormLabel>
                  <FormControl>
                    <Input placeholder="الهاتف أو البريد الإلكتروني" {...formField} value={formField.value ?? ""} />
                  </FormControl>
                  <FormMessage>{getPartyErrors(index)?.contact?.message}</FormMessage>
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`${name}.${index}.representative`}
              render={({ field: formField }) => (
                <FormItem>
                  <FormLabel>الممثل القانوني (إن وُجد)</FormLabel>
                  <FormControl>
                    <Input placeholder="اسم الممثل القانوني" {...formField} value={formField.value ?? ""} />
                  </FormControl>
                  <FormMessage>{getPartyErrors(index)?.representative?.message}</FormMessage>
                </FormItem>
              )}
            />
          </div>
          <Button type="button" variant="destructive" size="sm" onClick={() => remove(index)} className="mt-2">
            <Trash2 className="w-4 h-4 ml-2" />
            حذف {label.split('/')[0].replace('المدعي', 'هذا المدعي').replace('المدعى عليه', 'هذا المدعى عليه').replace('أطراف أخرى', 'هذا الطرف')}
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        onClick={() => append({ name: '', party_type: partyType, role: null, role_detail: null, address: null, id_number: null, contact: null, representative: null })}
        className="mt-4"
      >
        <PlusCircle className="w-4 h-4 ml-2" />
        إضافة {label.split('/')[0].replace('المدعي', 'مدعي').replace('المدعى عليه', 'مدعى عليه').replace('أطراف أخرى', 'طرف آخر')}
      </Button>
    </div>
  );
};