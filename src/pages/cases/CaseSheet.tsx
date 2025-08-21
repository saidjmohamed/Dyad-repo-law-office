import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { CaseForm } from "./CaseForm";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createCase, updateCase, CaseFormData } from "./actions";
import { getClients } from "../clients/actions";
import { showSuccess, showError } from "@/utils/toast";
import { Skeleton } from "@/components/ui/skeleton";

// Define a type for the case data structure from the database
type Case = {
  id: string;
  [key: string]: any;
};

interface CaseSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  caseItem?: Case | null;
}

export const CaseSheet = ({ open, onOpenChange, caseItem }: CaseSheetProps) => {
  const queryClient = useQueryClient();
  const isEditMode = !!caseItem;

  const { data: clients, isLoading: isLoadingClients } = useQuery({
    queryKey: ["clients"],
    queryFn: getClients,
  });

  const createMutation = useMutation({
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

  const updateMutation = useMutation({
    mutationFn: updateCase,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cases"] });
      showSuccess("تم تحديث بيانات القضية بنجاح.");
      onOpenChange(false);
    },
    onError: (error) => {
      showError(error.message);
    },
  });

  const handleSubmit = (data: CaseFormData) => {
    if (isEditMode) {
      updateMutation.mutate({ id: caseItem.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const defaultValues = caseItem ? {
    ...caseItem,
    filing_date: caseItem.filing_date ? new Date(caseItem.filing_date) : null,
  } : {};

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isEditMode ? "تعديل بيانات القضية" : "إضافة قضية جديدة"}</SheetTitle>
          <SheetDescription>
            {isEditMode
              ? "قم بتحديث التفاصيل أدناه. انقر على 'حفظ' عند الانتهاء."
              : "أدخل تفاصيل القضية الجديدة هنا. انقر على 'حفظ' عند الانتهاء."}
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
              isPending={createMutation.isPending || updateMutation.isPending}
              clients={clients}
              defaultValues={defaultValues}
            />
          ) : (
            <div>لا يمكن تحميل قائمة الموكلين.</div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};