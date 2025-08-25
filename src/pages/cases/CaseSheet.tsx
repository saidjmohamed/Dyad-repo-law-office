import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { CaseForm } from "./CaseForm";
import { createCase, updateCase, Case } from "./actions";
import { getClients } from "../clients/actions";
import { showSuccess, showError } from "@/utils/toast";
import { CaseFormValues } from "./caseSchema";

interface CaseSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  caseData?: Case | null;
}

export const CaseSheet = ({ open, onOpenChange, caseData }: CaseSheetProps) => {
  const queryClient = useQueryClient();

  const { data: clients, isLoading: isLoadingClients } = useQuery({
    queryKey: ["clients"],
    queryFn: getClients,
  });

  const createMutation = useMutation({
    mutationFn: createCase,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cases"] });
      queryClient.invalidateQueries({ queryKey: ["hearings"] }); // <--- إضافة هذا السطر
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
      queryClient.invalidateQueries({ queryKey: ["case", caseData?.id] });
      queryClient.invalidateQueries({ queryKey: ["hearings"] }); // <--- إضافة هذا السطر
      showSuccess("تم تحديث القضية بنجاح.");
      onOpenChange(false);
    },
    onError: (error) => {
      showError(error.message);
    },
  });

  const onSubmit = (data: CaseFormValues) => {
    if (caseData) {
      updateMutation.mutate({ id: caseData.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{caseData ? "تعديل قضية" : "إضافة قضية جديدة"}</SheetTitle>
          <SheetDescription>
            {caseData ? "قم بتعديل تفاصيل القضية." : "أدخل تفاصيل القضية الجديدة هنا."}
          </SheetDescription>
        </SheetHeader>
        {isLoadingClients ? (
          <div>جاري تحميل الموكلين...</div>
        ) : (
          <CaseForm
            onSubmit={onSubmit}
            isLoading={createMutation.isPending || updateMutation.isPending}
            initialData={caseData || undefined}
            clients={clients || []}
          />
        )}
      </SheetContent>
    </Sheet>
  );
};