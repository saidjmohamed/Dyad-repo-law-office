import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ar } from "date-fns/locale"; // Import Arabic locale for date-fns
import { cn } from "@/lib/utils";
import { createClient, updateClient } from "./actions";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useEffect } from "react";

// Define the form schema with new optional fields
const formSchema = z.object({
  full_name: z.string().min(1, { message: "الاسم الكامل مطلوب" }),
  national_id: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email({ message: "بريد إلكتروني غير صالح" }).or(z.literal("")).optional().nullable(),
  address: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  date_of_birth: z.date().optional().nullable(), // New field
  father_name: z.string().optional().nullable(), // New field
  profession: z.string().optional().nullable(), // New field
});

type ClientFormValues = z.infer<typeof formSchema>;

interface ClientSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client?: ClientFormValues & { id: string }; // Extend with id for edit mode
}

const ClientSheet = ({ open, onOpenChange, client }: ClientSheetProps) => {
  const isEditMode = !!client;
  const queryClient = useQueryClient();

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: "",
      national_id: "",
      phone: "",
      email: "",
      address: "",
      notes: "",
      date_of_birth: undefined,
      father_name: "",
      profession: "",
    },
  });

  useEffect(() => {
    if (client) {
      form.reset({
        ...client,
        date_of_birth: client.date_of_birth ? new Date(client.date_of_birth) : undefined,
      });
    } else {
      form.reset();
    }
  }, [client, form]);

  const createMutation = useMutation({
    mutationFn: createClient,
    onSuccess: () => {
      toast.success("تم إضافة الموكل بنجاح.");
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(`فشل إضافة الموكل: ${error.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateClient,
    onSuccess: () => {
      toast.success("تم تحديث بيانات الموكل بنجاح.");
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(`فشل تحديث بيانات الموكل: ${error.message}`);
    },
  });

  const onSubmit = (values: ClientFormValues) => {
    const clientData = {
      ...values,
      // Convert date_of_birth to ISO string or null
      date_of_birth: values.date_of_birth ? format(values.date_of_birth, 'yyyy-MM-dd') : null,
      // Ensure empty strings are converted to null for optional fields
      national_id: values.national_id || null,
      phone: values.phone || null,
      email: values.email || null,
      address: values.address || null,
      notes: values.notes || null,
      father_name: values.father_name || null,
      profession: values.profession || null,
    };

    if (isEditMode && client) {
      updateMutation.mutate({ id: client.id, ...clientData });
    } else {
      createMutation.mutate(clientData);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isEditMode ? "تعديل بيانات الموكل" : "إضافة موكل جديد"}</SheetTitle>
          <SheetDescription>
            {isEditMode ? "قم بتعديل معلومات الموكل الحالي." : "أدخل تفاصيل الموكل الجديد هنا."}
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الاسم الكامل</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="national_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>رقم التعريف الوطني</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>رقم الهاتف</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>البريد الإلكتروني</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>عنوان الإقامة</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* New fields */}
            <FormField
              control={form.control}
              name="date_of_birth"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-right">تاريخ الميلاد</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-right font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: ar }) // Use Arabic locale for display
                          ) : (
                            <span>اختر تاريخ الميلاد</span>
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
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                        locale={ar} // Use Arabic locale for calendar
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="father_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>اسم الأب</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="profession"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>المهنة</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ملاحظات إضافية</FormLabel>
                  <FormControl>
                    <Textarea {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={createMutation.isPending || updateMutation.isPending}>
              {isEditMode ? "تحديث الموكل" : "إضافة موكل"}
            </Button>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};

export default ClientSheet;