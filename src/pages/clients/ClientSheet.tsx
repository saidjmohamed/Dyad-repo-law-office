import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ClientForm } from "./ClientForm";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient, updateClient, ClientFormData } from "./actions";
import { showSuccess, showError } from "@/utils/toast";

// Define a type for the client data structure from the database
type Client = {
  id: string;
  full_name: string;
  national_id?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  notes?: string | null;
};

interface ClientSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client?: Client | null;
}

export const ClientSheet = ({ open, onOpenChange, client }: ClientSheetProps) => {
  const queryClient = useQueryClient();
  const isEditMode = !!client;

  const createMutation = useMutation({
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

  const updateMutation = useMutation({
    mutationFn: updateClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      showSuccess("تم تحديث بيانات الموكل بنجاح.");
      onOpenChange(false);
    },
    onError: (error) => {
      showError(error.message);
    },
  });

  const handleSubmit = (data: ClientFormData) => {
    if (isEditMode) {
      updateMutation.mutate({ id: client.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  // Prepare default values, converting null to undefined for form compatibility
  const defaultValues = client ? {
    ...client,
    national_id: client.national_id ?? undefined,
    phone: client.phone ?? undefined,
    email: client.email ?? undefined,
    address: client.address ?? undefined,
    notes: client.notes ?? undefined,
  } : undefined;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isEditMode ? "تعديل بيانات الموكل" : "إضافة موكل جديد"}</SheetTitle>
          <SheetDescription>
            {isEditMode
              ? "قم بتحديث التفاصيل أدناه. انقر على 'حفظ' عند الانتهاء."
              : "أدخل تفاصيل الموكل الجديد هنا. انقر على 'حفظ' عند الانتهاء."}
          </SheetDescription>
        </SheetHeader>
        <div className="py-4">
          <ClientForm
            onSubmit={handleSubmit}
            isPending={createMutation.isPending || updateMutation.isPending}
            defaultValues={defaultValues}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};