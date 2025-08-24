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
import { getCases, Case as CaseType } from "../cases/actions";
import { showSuccess, showError } from "@/utils/toast";
import { Skeleton } from "@/components/ui/skeleton";

type Task = {
  id: string;
  title: string;
  done: boolean;
  due_date: string | null;
  priority: string | null;
  case_id: string | null;
};

type CaseForTaskForm = CaseType;

interface TaskSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task | null;
  caseIdForNewTask?: string;
}

export const TaskSheet = ({ open, onOpenChange, task, caseIdForNewTask }: TaskSheetProps) => {
  const queryClient = useQueryClient();
  const isEditMode = !!task;

  const { data: cases, isLoading: isLoadingCases } = useQuery<CaseForTaskForm[]>({
    queryKey: ["cases"],
    queryFn: () => getCases({}),
  });

  const createMutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["case", caseIdForNewTask] });
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
      queryClient.invalidateQueries({ queryKey: ["case", task?.case_id] });
      showSuccess("تم تحديث المهمة بنجاح.");
      onOpenChange(false);
    },
    onError: (error) => {
      showError(error.message);
    },
  });

  const handleSubmit = (data: TaskFormData) => {
    const submissionData = {
        ...data,
        case_id: data.case_id === "" ? null : data.case_id,
    };
    if (isEditMode) {
      updateMutation.mutate({ id: task.id, ...submissionData });
    } else {
      createMutation.mutate({ ...submissionData, case_id: caseIdForNewTask || submissionData.case_id });
    }
  };

  const defaultValues = task ? {
    ...task,
    due_date: task.due_date ? new Date(task.due_date) : undefined,
    priority: task.priority ?? undefined,
    case_id: task.case_id ?? undefined,
  } : {
    title: "",
    priority: "متوسط",
    case_id: caseIdForNewTask ?? undefined,
    due_date: undefined,
    done: false,
  };

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
              cases={cases.map((c: CaseForTaskForm) => ({ id: c.id, case_number: c.case_number || 'غير محدد', client_name: c.client_name || 'غير معروف' }))}
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