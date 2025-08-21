import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { HearingForm } from "./HearingForm";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createHearing, HearingFormData } from "./actions";
import { getCases } from "../cases/actions";
import { showSuccess, showError } from "@/utils/toast";
import { Skeleton } from "@/components/ui/skeleton";

interface HearingSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const HearingSheet = ({ open, onOpenChange }: HearingSheetProps) => {
  const queryClient = useQueryClient();

  const { data: cases, isLoading: isLoadingCases } = useQuery({
    queryKey: ["cases"],
    queryFn: getCases,
  });

  const mutation = useMutation({
    mutationFn: createHearing,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hearings"] });
      showSuccess("تمت إضافة الجلسة بنجاح.");
      onOpenChange(false);
    },
    onError: (error) => {
      showError(error.message);
    },
  });

  const handleSubmit = (data: HearingFormData) => {
    mutation.mutate(data);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>إضافة جلسة جديدة</SheetTitle>
          <SheetDescription>
            أدخل تفاصيل الجلسة الجديدة هنا. انقر على "حفظ" عند الانتهاء.
          </SheetDescription>
        </SheetHeader>
        <div className="py-4">
          {isLoadingCases ? (
            <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
          ) : cases ? (
            <HearingForm 
              onSubmit={handleSubmit} 
              isPending={mutation.isPending}
              cases={cases.map(c => ({ id: c.id, case_number: c.case_number, client_name: c.client_name }))}
            />
          ) : (
            <div>لا يمكن تحميل قائمة القضايا.</div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};