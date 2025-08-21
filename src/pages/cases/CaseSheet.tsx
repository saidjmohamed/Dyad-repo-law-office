import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { CaseForm } from "./CaseForm";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createCase, CaseFormData } from "./actions";
import { getClients } from "../clients/actions";
import { showSuccess, showError } from "@/utils/toast";
import { Skeleton } from "@/components/ui/skeleton";

interface CaseSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CaseSheet = ({ open, onOpenChange }: CaseSheetProps) => {
  const queryClient = useQueryClient();

  const { data: clients, isLoading: isLoadingClients } = useQuery({
    queryKey: ["clients"],
    queryFn: getClients,
  });

  const mutation = useMutation({
    mutationFn: createCase,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cases"] });
      showSuccess("تمت إضافة القضية بنجاح.");
      onOpenChange(false);
    },
    onError: (error) => {
      showError(error.message);
    },
  });

  const handleSubmit = (data: CaseFormData) => {
    mutation.mutate(data);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>إضافة قضية جديدة</SheetTitle>
          <SheetDescription>
            أدخل تفاصيل القضية الجديدة هنا. انقر على "حفظ" عند الانتهاء.
          </SheetDescription>
        </SheetHeader>
        <div className="py-4">
          {isLoadingClients ? (
            <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
          ) : clients ? (
            <CaseForm 
              onSubmit={handleSubmit} 
              isPending={mutation.isPending}
              clients={clients}
            />
          ) : (
            <div>لا يمكن تحميل قائمة الموكلين.</div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};