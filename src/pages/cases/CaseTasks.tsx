import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Pencil, Trash2, PlusCircle } from "lucide-react";
import { format } from "date-fns";
import { TaskSheet } from "../tasks/TaskSheet";
import { DeleteConfirmationDialog } from "@/components/DeleteConfirmationDialog";
import { deleteTask, updateTaskStatus } from "../tasks/actions";
import { showError, showSuccess } from "@/utils/toast";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type Task = {
  id: string;
  title: string;
  done: boolean;
  due_date: string | null;
  priority: string | null;
  case_id: string | null; // Make case_id nullable
};

interface CaseTasksProps {
  caseId: string;
  tasks: Task[];
}

export const CaseTasks = ({ caseId, tasks }: CaseTasksProps) => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const statusUpdateMutation = useMutation<any, Error, { id: string; done: boolean }>({
    mutationFn: updateTaskStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["case", caseId] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] }); // Invalidate general tasks list too
      showSuccess("تم تحديث حالة المهمة.");
    },
    onError: (error) => {
      showError(error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["case", caseId] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] }); // Invalidate general tasks list too
      showSuccess("تم حذف المهمة بنجاح.");
      setIsDeleteDialogOpen(false);
      setDeletingTaskId(null);
    },
    onError: (error) => {
      showError(error.message);
    },
  });

  const handleStatusChange = (id: string, done: boolean) => {
    statusUpdateMutation.mutate({ id, done });
  };

  const handleAddClick = () => {
    setEditingTask(null);
    setIsSheetOpen(true);
  };

  const handleEditClick = (task: Task) => {
    setEditingTask(task);
    setIsSheetOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setDeletingTaskId(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (deletingTaskId) {
      deleteMutation.mutate(deletingTaskId);
    }
  };

  const getPriorityBadgeVariant = (priority: string | null) => {
    switch (priority) {
      case 'عالية':
        return 'destructive';
      case 'متوسط':
        return 'secondary';
      case 'منخفضة':
        return 'outline';
      default:
        return 'default';
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>المهام</CardTitle>
            <CardDescription>جميع المهام المتعلقة بهذه القضية.</CardDescription>
          </div>
          <Button onClick={handleAddClick}>
            <PlusCircle className="w-4 h-4 ml-2" />
            إضافة مهمة
          </Button>
        </CardHeader>
        <CardContent>
          {tasks && tasks.length > 0 ? (
            <div className="space-y-2">
              {tasks.map((task) => (
                <div key={task.id} className="flex items-center p-3 bg-background rounded-lg border">
                  <Checkbox
                    id={`task-${task.id}`}
                    checked={task.done}
                    onCheckedChange={(checked) => handleStatusChange(task.id, !!checked)}
                    className="ml-4"
                  />
                  <div className="flex-1">
                    <label
                      htmlFor={`task-${task.id}`}
                      className={cn(
                        "font-medium",
                        task.done && "line-through text-muted-foreground"
                      )}
                    >
                      {task.title}
                    </label>
                    <div className="text-sm text-muted-foreground space-x-2 space-x-reverse">
                      {task.due_date && <span>تستحق في: {format(new Date(task.due_date), "PPP")}</span>}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse mr-2">
                    <Badge variant={getPriorityBadgeVariant(task.priority)}>{task.priority || 'متوسط'}</Badge>
                    <Button variant="ghost" size="icon" onClick={() => handleEditClick(task)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(task.id)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">لا توجد مهام مرفقة.</p>
          )}
        </CardContent>
      </Card>
      <TaskSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        task={editingTask ? { ...editingTask, case_id: caseId } : undefined} // Pass undefined for new task
        caseIdForNewTask={caseId} // Pass caseId for new tasks
      />
      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDelete}
        isPending={deleteMutation.isPending}
      />
    </>
  );
};