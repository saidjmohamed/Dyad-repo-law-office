import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { TaskForm } from "./TaskForm";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createTask, TaskFormData } from "./actions";
import { getCases } from "../cases/actions";
import { showSuccess, showError } from "@/utils/toast";
import { Skeleton } from "@/components/ui/skeleton";

interface TaskSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TaskSheet = ({ open, onOpenChange }: TaskSheetProps) => {
  const queryClient = useQueryClient();

  const { data: cases, isLoading: isLoadingCases } = useQuery({
    queryKey: ["cases"],
    queryFn: getCases,
  });

  const mutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      showSuccess("تمت إضافة المهمة بنجاح.");
      onOpenChange(false);
    },
    onError: (error) => {
      showError(error.message);
    },
  });

  const handleSubmit = (data: TaskFormData) => {
    // Ensure null is passed for empty string case_id
    const submissionData = {
        ...data,
        case_id: data.case_id === "" ? null : data.case_id,
    };
    mutation.mutate(submissionData);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>إضافة مهمة جديدة</SheetTitle>
          <SheetDescription>
            أدخل تفاصيل المهمة الجديدة هنا. انقر على "حفظ" عند الانتهاء.
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
            <TaskForm 
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