import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { HearingForm } from "./HearingForm";
import { createHearing, updateHearing, getCases, HearingFormData, CaseWithClientName } from "./actions"; // Corrected import for HearingFormData and CaseWithClientName
import { showSuccess, showError } from "@/utils/toast";

interface HearingSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hearing?: { id: string; case_id?: string | null; hearing_date: string; room?: string | null; judge?: string | null; result?: string | null; notes?: string | null } | null;
}

export const HearingSheet = ({ open, onOpenChange, hearing }: HearingSheetProps) => {
  const queryClient = useQueryClient();
  const { data: cases, isLoading: isLoadingCases, isError: isErrorCases } = useQuery<CaseWithClientName[]>({ // Use CaseWithClientName type
    queryKey: ["cases"],
    queryFn: getCases,
  });

  const createMutation = useMutation({
    mutationFn: createHearing,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hearings"] });
      showSuccess("تم إضافة الجلسة بنجاح.");
      onOpenChange(false);
    },
    onError: (error) => {
      showError(error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateHearing,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hearings"] });
      showSuccess("تم تحديث الجلسة بنجاح.");
      onOpenChange(false);
    },
    onError: (error) => {
      showError(error.message);
    },
  });

  const onSubmit = (data: HearingFormData) => {
    if (hearing) {
      updateMutation.mutate({ id: hearing.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const defaultValues = hearing ? {
    ...hearing,
    hearing_date: new Date(hearing.hearing_date),
    // Convert null to undefined for fields that expect string | undefined
    room: hearing.room ?? undefined,
    judge: hearing.judge ?? undefined,
    result: hearing.result ?? undefined,
    notes: hearing.notes ?? undefined,
  } : undefined;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{hearing ? "تعديل جلسة" : "إضافة جلسة جديدة"}</SheetTitle>
          <SheetDescription>
            {hearing ? "قم بتعديل تفاصيل الجلسة." : "أدخل تفاصيل الجلسة الجديدة هنا."}
          </SheetDescription>
        </SheetHeader>
        {isLoadingCases ? (
          <div>جاري تحميل القضايا...</div>
        ) : isErrorCases ? (
          <div className="text-red-500">حدث خطأ أثناء تحميل القضايا.</div>
        ) : (
          <HearingForm
            onSubmit={onSubmit}
            isPending={createMutation.isPending || updateMutation.isPending}
            cases={cases || []}
            defaultValues={defaultValues}
          />
        )}
      </SheetContent>
    </Sheet>
  );
};