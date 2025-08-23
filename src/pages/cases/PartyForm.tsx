import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { partySchema, PartyFormData } from "./actions";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ar } from 'date-fns/locale';

interface PartyFormProps {
  onSubmit: (data: PartyFormData) => void;
  isPending: boolean;
  defaultValues?: Partial<PartyFormData>;
}

export const PartyForm = ({ onSubmit, isPending, defaultValues }: PartyFormProps) => {
  const form = useForm<PartyFormData>({
    resolver: zodResolver(partySchema),
    defaultValues: defaultValues || {
      full_name: "",
      father_name: "",
      mother_name: "",
      national_id: "",
      date_of_birth: undefined,
      nationality: "",
      address: "",
      phone: "",
      email: "",
      occupation: "",
      marital_status: "",
      party_type: "مدعي",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="full_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>الاسم الكامل</FormLabel>
              <FormControl>
                <Input placeholder="اسم الطرف..." {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="party_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>نوع الطرف</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر نوع الطرف" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="مدعي">مدعي</SelectItem>
                  <SelectItem value="مدعى عليه">مدعى عليه</SelectItem>
                  <SelectItem value="متهم">متهم</SelectItem>
                  <SelectItem value="ضحية">ضحية</SelectItem>
                  <SelectItem value="طرف مدني">طرف مدني</SelectItem>
                  <SelectItem value="آخر">آخر</SelectItem>
                </SelectContent>
              </Select>
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
                <Input placeholder="اسم الأب..." {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="mother_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>اسم الأم</FormLabel>
              <FormControl>
                <Input placeholder="اسم الأم..." {...field} value={field.value || ""} />
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
              <FormLabel>الرقم الوطني</FormLabel>
              <FormControl>
                <Input placeholder="رقم الهوية الوطنية..." {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="date_of_birth"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>تاريخ الميلاد</FormLabel>
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
          control={form.control}
          name="nationality"
          render={({ field }) => (
            <FormItem>
              <FormLabel>الجنسية</FormLabel>
              <FormControl>
                <Input placeholder="الجنسية..." {...field} value={field.value || ""} />
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
              <FormLabel>العنوان</FormLabel>
              <FormControl>
                <Input placeholder="عنوان الطرف..." {...field} value={field.value || ""} />
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
                <Input placeholder="رقم الهاتف..." {...field} value={field.value || ""} />
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
                <Input placeholder="البريد الإلكتروني..." {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="occupation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>المهنة</FormLabel>
              <FormControl>
                <Input placeholder="المهنة..." {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="marital_status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>الحالة الاجتماعية</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ""}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الحالة الاجتماعية" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="أعزب">أعزب</SelectItem>
                  <SelectItem value="متزوج">متزوج</SelectItem>
                  <SelectItem value="مطلق">مطلق</SelectItem>
                  <SelectItem value="أرمل">أرمل</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isPending}>
          {isPending ? "جاري الحفظ..." : "حفظ"}
        </Button>
      </form>
    </Form>
  );
};