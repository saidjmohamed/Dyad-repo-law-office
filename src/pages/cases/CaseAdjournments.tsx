import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createAdjournment,
  updateAdjournment,
  deleteAdjournment,
  AdjournmentFormData,
} from "./adjournmentActions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Pencil, Trash2 } from "lucide-react";
import { showError, showSuccess } from "@/utils/toast";
import { DeleteConfirmationDialog } from "@/components/DeleteConfirmationDialog";
import { AdjournmentForm } from "./AdjournmentForm";
import { format } from "date-fns";

type Adjournment = {
  id: string;
  adjournment_date: string;
  reason?: string | null;
};

interface CaseAdjournmentsProps {
  caseId: string;
  adjournments: Adjournment[];
}

export const CaseAdjournments = ({ caseId, adjournments }: CaseAdjournmentsProps) => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingAdjournment, setEditingAdjournment] = useState<Adjournment | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [adjournmentToDelete, setAdjournmentToDelete] = useState<Adjournment | null>(null);
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: createAdjournment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["case", caseId] });
      showSuccess("تمت إضافة التأجيل بنجاح.");
      setIsSheetOpen(false);
    },
    onError: (error) => showError(error.message),
  });

  const updateMutation = useMutation({
    mutationFn: updateAdjournment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["case", caseId] });
      showSuccess("تم تحديث التأجيل بنجاح.");
      setIsSheetOpen(false);
    },
    onError: (error) => showError(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAdjournment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["case", caseId] });
      showSuccess("تم حذف التأجيل بنجاح.");
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => showError(error.message),
  });

  const handleAddClick = () => {
    setEditingAdjournment(null);
    setIsSheetOpen(true);
  };

  const handleEditClick = (adjournment: Adjournment) => {
    setEditingAdjournment(adjournment);
    setIsSheetOpen(true);
  };

  const handleDeleteClick = (adjournment: Adjournment) => {
    setAdjournmentToDelete(adjournment);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (adjournmentToDelete) {
      deleteMutation.mutate(adjournmentToDelete.id);
    }
  };

  const handleSubmit = (data: AdjournmentFormData) => {
    if (editingAdjournment) {
      updateMutation.mutate({ id: editingAdjournment.id, ...data });
    } else {
      createMutation.mutate({ caseId, ...data });
    }
  };

  const defaultValues = editingAdjournment ? {
    ...editingAdjournment,
    adjournment_date: new Date(editingAdjournment.adjournment_date),
    reason: editingAdjournment.reason ?? undefined, // تحويل null إلى undefined
  } : undefined;

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>التأجيلات</CardTitle>
            <CardDescription>سجل بجميع التأجيلات لهذه القضية.</CardDescription>
          </div>
          <Button onClick={handleAddClick}>
            <PlusCircle className="w-4 h-4 ml-2" />
            إضافة تأجيل
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>تاريخ التأجيل</TableHead>
                <TableHead>السبب</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {adjournments && adjournments.length > 0 ? (
                adjournments.map((adj) => (
                  <TableRow key={adj.id}>
                    <TableCell>{format(new Date(adj.adjournment_date), "PPP")}</TableCell>
                    <TableCell>{adj.reason || "-"}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1 space-x-reverse">
                        <Button variant="ghost" size="icon" onClick={() => handleEditClick(adj)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(adj)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center">لا توجد تأجيلات مسجلة.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{editingAdjournment ? "تعديل تأجيل" : "إضافة تأجيل جديد"}</SheetTitle>
          </SheetHeader>
          <div className="py-4">
            <AdjournmentForm
              onSubmit={handleSubmit}
              isPending={createMutation.isPending || updateMutation.isPending}
              defaultValues={defaultValues}
            />
          </div>
        </SheetContent>
      </Sheet>

      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDelete}
        isPending={deleteMutation.isPending}
      />
    </>
  );
};