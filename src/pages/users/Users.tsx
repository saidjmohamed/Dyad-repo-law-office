import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUsers, updateUserRole, UserProfile } from "./actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { showError, showSuccess } from "@/utils/toast";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";

const roleTranslations: { [key: string]: string } = {
  admin: "مدير",
  lawyer: "محامٍ",
  assistant: "مساعد",
};

const Users = () => {
  const queryClient = useQueryClient();

  const { data: users, isLoading, isError } = useQuery<UserProfile[]>({
    queryKey: ["users"],
    queryFn: getUsers,
  });

  const updateRoleMutation = useMutation<UserProfile, Error, { id: string; role: 'admin' | 'lawyer' | 'assistant' }>({
    mutationFn: updateUserRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      showSuccess("تم تحديث دور المستخدم بنجاح.");
    },
    onError: (error) => {
      showError(error.message);
    },
  });

  const handleRoleChange = (userId: string, role: 'admin' | 'lawyer' | 'assistant') => {
    updateRoleMutation.mutate({ id: userId, role });
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">إدارة المستخدمين</h1>
          <p className="text-gray-600 dark:text-gray-400">
            عرض وتعديل أدوار المستخدمين في النظام.
          </p>
        </div>
        <Button disabled>
            <UserPlus className="w-4 h-4 ml-2" />
            دعوة مستخدم (قريباً)
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>قائمة المستخدمين</CardTitle>
          <CardDescription>
            هنا قائمة بجميع المستخدمين المسجلين في النظام.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : isError ? (
            <div className="text-red-500 text-center py-4">
              حدث خطأ أثناء جلب البيانات. تأكد من أن لديك صلاحيات المدير.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الاسم</TableHead>
                  <TableHead>الدور</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users && users.length > 0 ? (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.first_name || "مستخدم"} {user.last_name || ""}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={user.role}
                          onValueChange={(value: 'admin' | 'lawyer' | 'assistant') => handleRoleChange(user.id, value)}
                          disabled={updateRoleMutation.isPending}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="اختر دورًا..." />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(roleTranslations).map(([key, value]) => (
                              <SelectItem key={key} value={key}>
                                {value}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center">
                      لا يوجد مستخدمون لعرضهم.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default Users;