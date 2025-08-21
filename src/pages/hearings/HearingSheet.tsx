import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { HearingForm } from "./HearingForm";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createHearing, updateHearing, HearingFormData } from "./actions";
import { getCases } from "../cases/actions";
import { showSuccess, showError } from "@/utils/toast";
import { Skeleton } from "@/components/ui/skeleton";

type Hearing = {
  id: string;
  [key: string]: any;
};

interface HearingSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hearing?: Hearing | null;
}

export const HearingSheet = ({ open, onOpenChange, hearing }: HearingSheetProps) => {
  const queryClient = useQueryClient();
  const isEditMode = !!hearing;

  const { data: cases, isLoading: isLoadingCases } = useQuery({
    queryKey: ["cases"],
    queryFn: getCases,
  });

  const createMutation = useMutation({
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

  const updateMutation = useMutation({
    mutationFn: updateHearing,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hearings"] });
      showSuccess("تم تحديث بيانات الجلسة بنجاح.");
      onOpenChange(false);
    },
    onError: (error) => {
      showError(error.message);
    },
  });

  const handleSubmit = (data: HearingFormData) => {
    if (isEditMode) {
      updateMutation.mutate({ id: hearing.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };
  
  const defaultValues = hearing ? {
    ...hearing,
    hearing_date: hearing.hearing_date ? new Date(hearing.hearing_date) : undefined,
  } : {};

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isEditMode ? "تعديل بيانات الجلسة" : "إضافة جلسة جديدة"}</SheetTitle>
          <SheetDescription>
            {isEditMode ? "قم بتحديث التفاصيل أدناه." : "أدخل تفاصيل الجلسة الجديدة هنا."}
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
              isPending={createMutation.isPending || updateMutation.isPending}
              cases={cases.map(c => ({ id: c.id, case_number: c.case_number, client_name: c.client_name }))}
              defaultValues={defaultValues}
            />
          ) : (
            <div>لا يمكن تحميل قائمة القضايا.</div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};