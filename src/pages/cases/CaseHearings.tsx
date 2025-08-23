import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pencil, Trash2, PlusCircle } from "lucide-react";
import { format } from "date-fns";
import { HearingSheet } from "../hearings/HearingSheet";
import { DeleteConfirmationDialog } from "@/components/DeleteConfirmationDialog";
import { deleteHearing } from "../hearings/actions";
import { showError, showSuccess } from "@/utils/toast";

type Hearing = {
  id: string;
  hearing_date: string;
  room?: string | null;
  judge?: string | null;
  result?: string | null;
  notes?: string | null;
};

interface CaseHearingsProps {
  caseId: string;
  hearings: Hearing[];
}

export const CaseHearings = ({ caseId, hearings }: CaseHearingsProps) => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingHearing, setEditingHearing] = useState<Hearing | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingHearingId, setDeletingHearingId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: deleteHearing,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["case", caseId] });
      queryClient.invalidateQueries({ queryKey: ["hearings"] }); // Invalidate general hearings list too
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

  const handleEditClick = (hearing: Hearing) => {
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
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>الجلسات</CardTitle>
            <CardDescription>جميع الجلسات المتعلقة بهذه القضية.</CardDescription>
          </div>
          <Button onClick={handleAddClick}>
            <PlusCircle className="w-4 h-4 ml-2" />
            إضافة جلسة
          </Button>
        </CardHeader>
        <CardContent>
          {hearings && hearings.length > 0 ? (
            <div className="overflow-x-auto">
              <Table className="min-w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">التاريخ</TableHead>
                    <TableHead className="text-right">القاعة</TableHead>
                    <TableHead className="text-right">القاضي</TableHead>
                    <TableHead className="text-right">النتيجة</TableHead>
                    <TableHead className="text-right">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {hearings.map((hearing) => (
                    <TableRow key={hearing.id}>
                      <TableCell className="text-right">{format(new Date(hearing.hearing_date), "PPP")}</TableCell>
                      <TableCell className="text-right">{hearing.room || "-"}</TableCell>
                      <TableCell className="text-right">{hearing.judge || "-"}</TableCell>
                      <TableCell className="text-right">{hearing.result || "-"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center space-x-2 space-x-reverse justify-end">
                          <Button variant="ghost" size="icon" onClick={() => handleEditClick(hearing)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(hearing.id)}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">لا توجد جلسات مرفقة.</p>
          )}
        </CardContent>
      </Card>
      <HearingSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        hearing={editingHearing ? { ...editingHearing, case_id: caseId } : undefined} // Pass undefined for new hearing
        caseIdForNewHearing={caseId} // Pass caseId for new hearings
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