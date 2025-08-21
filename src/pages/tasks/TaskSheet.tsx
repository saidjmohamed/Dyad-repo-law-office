import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { TaskForm } from "./TaskForm";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createTask, updateTask, TaskFormData } from "./actions";
import { getCases } from "../cases/actions";
import { showSuccess, showError } from "@/utils/toast";
import { Skeleton } from "@/components/ui/skeleton";

type Task = {
  id: string;
  [key: string]: any;
};

interface TaskSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task | null;
}

export const TaskSheet = ({ open, onOpenChange, task }: TaskSheetProps) => {
  const queryClient = useQueryClient();
  const isEditMode = !!task;

  const { data: cases, isLoading: isLoadingCases } = useQuery({
    queryKey: ["cases"],
    queryFn: getCases,
  });

  const createMutation = useMutation({
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

  const updateMutation = useMutation({
    mutationFn: updateTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      showSuccess("تم تحديث المهمة بنجاح.");
      onOpenChange(false);
    },
    onError: (error) => {
      showError(error.message);
    },
  });

  const handleSubmit = (data: TaskFormData) => {
    if (isEditMode) {
      updateMutation.mutate({ id: task.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const defaultValues = task ? {
    ...task,
    due_date: task.due_date ? new Date(task.due_date) : null,
  } : {};

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isEditMode ? "تعديل المهمة" : "إضافة مهمة جديدة"}</SheetTitle>
          <SheetDescription>
            {isEditMode ? "قم بتحديث تفاصيل المهمة." : "أدخل تفاصيل المهمة الجديدة هنا."}
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