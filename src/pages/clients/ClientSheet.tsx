import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ClientForm } from "./ClientForm";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient, ClientFormData } from "./actions";
import { showSuccess, showError } from "@/utils/toast";

interface ClientSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ClientSheet = ({ open, onOpenChange }: ClientSheetProps) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      showSuccess("تمت إضافة الموكل بنجاح.");
      onOpenChange(false);
    },
    onError: (error) => {
      showError(error.message);
    },
  });

  const handleSubmit = (data: ClientFormData) => {
    mutation.mutate(data);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>إضافة موكل جديد</SheetTitle>
          <SheetDescription>
            أدخل تفاصيل الموكل الجديد هنا. انقر على "حفظ" عند الانتهاء.
          </SheetDescription>
        </SheetHeader>
        <div className="py-4">
          <ClientForm onSubmit={handleSubmit} isPending={mutation.isPending} />
        </div>
      </SheetContent>
    </Sheet>
  );
};