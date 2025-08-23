import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { adjournmentSchema, AdjournmentFormData } from "./adjournmentActions";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface AdjournmentFormProps {
  onSubmit: (data: AdjournmentFormData) => void;
  isPending: boolean;
  defaultValues?: Partial<AdjournmentFormData>;
}

export const AdjournmentForm = ({ onSubmit, isPending, defaultValues }: AdjournmentFormProps) => {
  const form = useForm<AdjournmentFormData>({
    resolver: zodResolver(adjournmentSchema),
    defaultValues: defaultValues || {
      adjournment_date: new Date(),
      reason: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="adjournment_date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>تاريخ التأجيل</FormLabel>
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
                        format(field.value, "PPP")
                      ) : (
                        <span>اختر تاريخًا</span>
                      )}
                      <CalendarIcon className="mr-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>سبب التأجيل</FormLabel>
              <FormControl>
                <Textarea placeholder="اكتب سبب التأجيل هنا..." {...field} />
              </FormControl>
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