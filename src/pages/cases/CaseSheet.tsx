import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { CaseForm, CaseFormValues } from "./CaseForm"; // استيراد CaseFormValues
import { createCase, updateCase, Case } from "./actions"; // استخدام Case من actions
import { getClients } from "../clients/actions";
import { showSuccess, showError } from "@/utils/toast";

interface CaseSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  caseData?: Case | null; // استخدام نوع Case الموحد
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
      queryClient.invalidateQueries({ queryKey: ["case", caseData?.id] }); // Invalidate specific case details
      showSuccess("تم تحديث القضية بنجاح.");
      onOpenChange(false);
    },
    onError: (error) => {
      showError(error.message);
    },
  });

  const onSubmit = (data: CaseFormValues) => { // استخدام CaseFormValues
    // تحويل حقول التاريخ من Date إلى string (ISO) قبل الإرسال
    const formattedData = {
      ...data,
      filing_date: data.filing_date ? data.filing_date.toISOString() : null,
      last_adjournment_date: data.last_adjournment_date ? data.last_adjournment_date.toISOString() : null,
      next_hearing_date: data.next_hearing_date ? data.next_hearing_date.toISOString() : null,
    };

    if (caseData) {
      updateMutation.mutate({ id: caseData.id, ...formattedData });
    } else {
      createMutation.mutate(formattedData);
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
            isLoading={createMutation.isPending || updateMutation.isPending} // استخدام isLoading
            initialData={caseData || undefined} // تمرير initialData بدلاً من defaultValues
            clients={clients || []}
          />
        )}
      </SheetContent>
    </Sheet>
  );
};