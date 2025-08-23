import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Pencil, Trash2, User } from "lucide-react";
import { showError, showSuccess } from "@/utils/toast";
import { DeleteConfirmationDialog } from "@/components/DeleteConfirmationDialog";
import { PartyForm } from "./PartyForm";
import { createParty, updateParty, deleteParty, PartyFormData, Party } from "./actions";
import { format } from "date-fns";

interface CasePartiesProps {
  caseId: string;
  parties: Party[];
}

export const CaseParties = ({ caseId, parties }: CasePartiesProps) => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingParty, setEditingParty] = useState<Party | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [partyToDelete, setPartyToDelete] = useState<Party | null>(null);
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: createParty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["case", caseId] });
      showSuccess("تمت إضافة الطرف بنجاح.");
      setIsSheetOpen(false);
    },
    onError: (error) => showError(error.message),
  });

  const updateMutation = useMutation({
    mutationFn: updateParty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["case", caseId] });
      showSuccess("تم تحديث الطرف بنجاح.");
      setIsSheetOpen(false);
    },
    onError: (error) => showError(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteParty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["case", caseId] });
      showSuccess("تم حذف الطرف بنجاح.");
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => showError(error.message),
  });

  const handleAddClick = () => {
    setEditingParty(null);
    setIsSheetOpen(true);
  };

  const handleEditClick = (party: Party) => {
    setEditingParty(party);
    setIsSheetOpen(true);
  };

  const handleDeleteClick = (party: Party) => {
    setPartyToDelete(party);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (partyToDelete) {
      deleteMutation.mutate(partyToDelete.id);
    }
  };

  const handleSubmit = (data: PartyFormData) => {
    if (editingParty) {
      updateMutation.mutate({ id: editingParty.id, ...data });
    } else {
      createMutation.mutate({ case_id: caseId, ...data });
    }
  };

  const defaultValues = editingParty ? {
    ...editingParty,
    date_of_birth: editingParty.date_of_birth ? new Date(editingParty.date_of_birth) : undefined,
    father_name: editingParty.father_name ?? undefined,
    mother_name: editingParty.mother_name ?? undefined,
    national_id: editingParty.national_id ?? undefined,
    nationality: editingParty.nationality ?? undefined,
    address: editingParty.address ?? undefined,
    phone: editingParty.phone ?? undefined,
    email: editingParty.email ?? undefined,
    occupation: editingParty.occupation ?? undefined,
    marital_status: editingParty.marital_status ?? undefined,
  } : undefined;

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>الأطراف</CardTitle>
            <CardDescription>جميع الأطراف المرتبطة بهذه القضية.</CardDescription>
          </div>
          <Button onClick={handleAddClick}>
            <PlusCircle className="w-4 h-4 ml-2" />
            إضافة طرف
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الاسم الكامل</TableHead>
                <TableHead>نوع الطرف</TableHead>
                <TableHead>الرقم الوطني</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {parties && parties.length > 0 ? (
                parties.map((party) => (
                  <TableRow key={party.id}>
                    <TableCell className="font-medium">{party.full_name}</TableCell>
                    <TableCell>{party.party_type}</TableCell>
                    <TableCell>{party.national_id || "-"}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1 space-x-reverse">
                        <Button variant="ghost" size="icon" onClick={() => handleEditClick(party)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(party)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">لا توجد أطراف مسجلة لهذه القضية.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editingParty ? "تعديل طرف" : "إضافة طرف جديد"}</SheetTitle>
          </SheetHeader>
          <div className="py-4">
            <PartyForm
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