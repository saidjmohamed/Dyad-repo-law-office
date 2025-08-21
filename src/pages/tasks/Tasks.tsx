import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTasks, updateTaskStatus } from "./actions";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { TaskSheet } from "./TaskSheet";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { showError, showSuccess } from "@/utils/toast";

// Define a type for the task data structure
type Task = {
  id: string;
  title: string;
  done: boolean;
  due_date: string | null;
  priority: string | null;
  case_number: string | null;
};

const Tasks = () => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const queryClient = useQueryClient();

  // Apply the Task type to useQuery for type safety
  const { data: tasks, isLoading, isError } = useQuery<Task[]>({
    queryKey: ["tasks"],
    queryFn: getTasks,
  });

  const mutation = useMutation<any, Error, { id: string; done: boolean }>({
    mutationFn: updateTaskStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      showSuccess("تم تحديث حالة المهمة.");
    },
    onError: (error) => {
      showError(error.message);
    },
  });

  const handleStatusChange = (id: string, done: boolean) => {
    mutation.mutate({ id, done });
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">إدارة المهام</h1>
          <p className="text-gray-600 dark:text-gray-400">
            تتبع وإدارة جميع المهام المطلوبة.
          </p>
        </div>
        <Button onClick={() => setIsSheetOpen(true)}>
          <PlusCircle className="w-4 h-4 ml-2" />
          إضافة مهمة
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>قائمة المهام</CardTitle>
          <CardDescription>
            هنا قائمة بجميع المهام المفتوحة والمكتملة.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : isError ? (
            <div className="text-red-500 text-center py-4">
              حدث خطأ أثناء جلب البيانات.
            </div>
          ) : tasks && tasks.length > 0 ? (
            <div className="space-y-4">
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
                      {task.case_number && <span>قضية: {task.case_number}</span>}
                      {task.due_date && <span>تستحق في: {format(new Date(task.due_date), "PPP")}</span>}
                    </div>
                  </div>
                  <Badge variant={getPriorityBadgeVariant(task.priority)}>{task.priority || 'متوسط'}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p>لا يوجد مهام لعرضها. قم بإضافة مهمة جديدة!</p>
            </div>
          )}
        </CardContent>
      </Card>

      <TaskSheet open={isSheetOpen} onOpenChange={setIsSheetOpen} />
    </>
  );
};

export default Tasks;