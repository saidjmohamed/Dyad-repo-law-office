import React from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Trash2, PlusCircle } from 'lucide-react';
import { AttachmentFormValues } from './caseSchema'; // Assuming AttachmentFormValues is defined in caseSchema.ts

interface CaseAttachmentFieldsProps {
  name: string; // This will be 'attachments'
  label: string;
}

export const CaseAttachmentFields = ({ name, label }: CaseAttachmentFieldsProps) => {
  const { control, formState: { errors } } = useFormContext<any>(); // Use any for now, will refine with actual form type
  const { fields, append, remove } = useFieldArray({
    control,
    name: name,
  });

  const getAttachmentErrors = (index: number) => {
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
              name={`${name}.${index}.file`}
              render={({ field: formField }) => (
                <FormItem>
                  <FormLabel>الملف</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      onChange={(e) => formField.onChange(e.target.files ? e.target.files[0] : null)}
                    />
                  </FormControl>
                  <FormMessage>{getAttachmentErrors(index)?.file?.message}</FormMessage>
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`${name}.${index}.title`}
              render={({ field: formField }) => (
                <FormItem>
                  <FormLabel>تسمية الملف</FormLabel>
                  <FormControl>
                    <Input placeholder="تسمية الملف" {...formField} value={formField.value ?? ""} />
                  </FormControl>
                  <FormMessage>{getAttachmentErrors(index)?.title?.message}</FormMessage>
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`${name}.${index}.description`}
              render={({ field: formField }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>وصف/ملاحظات</FormLabel>
                  <FormControl>
                    <Textarea placeholder="وصف الملف أو ملاحظات إضافية" {...formField} value={formField.value ?? ""} />
                  </FormControl>
                  <FormMessage>{getAttachmentErrors(index)?.description?.message}</FormMessage>
                </FormItem>
              )}
            />
          </div>
          <Button type="button" variant="destructive" size="sm" onClick={() => remove(index)} className="mt-2">
            <Trash2 className="w-4 h-4 ml-2" />
            حذف هذا المرفق
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        onClick={() => append({ file: null, title: null, description: null })}
        className="mt-4"
      >
        <PlusCircle className="w-4 h-4 ml-2" />
        إضافة مرفق
      </Button>
    </div>
  );
};