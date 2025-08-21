import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getHearings, deleteHearing } from "./actions";
import { Button } from "@/components/ui/button";
import { PlusCircle, Pencil, Trash2 } from "lucide-react";
import { HearingSheet } from "./HearingSheet";
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
import { format } from "date-fns";
import { DeleteConfirmationDialog } from "@/components/DeleteConfirmationDialog";
import { showSuccess, showError } from "@/utils/toast";

type HearingData = {
  id: string;
  hearing_date: string;
  case_number?: string;
  client_name?: string;
  room?: string | null;
  [key: string]: any;
};

const Hearings = () => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingHearing, setEditingHearing] = useState<HearingData | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingHearingId, setDeletingHearingId] = useState<string | null>(null);
  
  const queryClient = useQueryClient();
  const { data: hearings, isLoading, isError } = useQuery<HearingData[]>({
    queryKey: ["hearings"],
    queryFn: getHearings,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteHearing,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hearings"] });
      showSuccess("تم حذف الجلسة بنجاح.");
      setIsDeleteDialogOpen(false);
      setDeletingHearingId(null);
    },
    onError: (error) => {
      showError(error.message);
    },
  });

  const handleAddClick = () => {
    setEditingHearing(null);
    setIsSheetOpen(true);
  };

  const handleEditClick = (hearing: HearingData) => {
    setEditingHearing(hearing);
    setIsSheetOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setDeletingHearingId(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (deletingHearingId) {
      deleteMutation.mutate(deletingHearingId);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">إدارة الجلسات</h1>
          <p className="text-gray-600 dark:text-gray-400">
            عرض، إضافة، وتعديل بيانات الجلسات.
          </p>
        </div>
        <Button onClick={handleAddClick}>
          <PlusCircle className="w-4 h-4 ml-2" />
          إضافة جلسة
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>قائمة الجلسات</CardTitle>
          <CardDescription>
            هنا قائمة بجميع الجلسات المسجلة في النظام.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : isError ? (
            <div className="text-red-500 text-center py-4">
              حدث خطأ أثناء جلب البيانات.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>تاريخ الجلسة</TableHead>
                  <TableHead>رقم القضية</TableHead>
                  <TableHead>الموكل</TableHead>
                  <TableHead>القاعة</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {hearings && hearings.length > 0 ? (
                  hearings.map((hearing) => (
                    <TableRow key={hearing.id}>
                      <TableCell>{format(new Date(hearing.hearing_date), "PPP")}</TableCell>
                      <TableCell className="font-medium">{hearing.case_number}</TableCell>
                      <TableCell>{hearing.client_name}</TableCell>
                      <TableCell>{hearing.room || "-"}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <Button variant="ghost" size="icon" onClick={() => handleEditClick(hearing)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(hearing.id)}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      لا يوجد جلسات لعرضها.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <HearingSheet 
        open={isSheetOpen} 
        onOpenChange={setIsSheetOpen}
        hearing={editingHearing}
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

export default Hearings;