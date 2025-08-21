import { useState, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createFinancialTransaction,
  updateFinancialTransaction,
  deleteFinancialTransaction,
  FinancialTransactionFormData,
} from "./financialActions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { PlusCircle, Pencil, Trash2 } from "lucide-react";
import { showError, showSuccess } from "@/utils/toast";
import { DeleteConfirmationDialog } from "@/components/DeleteConfirmationDialog";
import { FinancialsForm } from "./FinancialsForm";
import { format } from "date-fns";

type FinancialTransaction = {
  id: string;
  transaction_type: 'أتعاب' | 'مصروف';
  description: string;
  amount: number;
  transaction_date: string;
};

interface CaseFinancialsProps {
  caseId: string;
  transactions: FinancialTransaction[];
}

export const CaseFinancials = ({ caseId, transactions }: CaseFinancialsProps) => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<FinancialTransaction | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<FinancialTransaction | null>(null);
  const queryClient = useQueryClient();

  const { totalFees, totalExpenses, balance } = useMemo(() => {
    const totalFees = transactions
      .filter(t => t.transaction_type === 'أتعاب')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const totalExpenses = transactions
      .filter(t => t.transaction_type === 'مصروف')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const balance = totalFees - totalExpenses;
    return { totalFees, totalExpenses, balance };
  }, [transactions]);

  const createMutation = useMutation({
    mutationFn: createFinancialTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["case", caseId] });
      showSuccess("تمت إضافة المعاملة بنجاح.");
      setIsSheetOpen(false);
    },
    onError: (error) => showError(error.message),
  });

  const updateMutation = useMutation({
    mutationFn: updateFinancialTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["case", caseId] });
      showSuccess("تم تحديث المعاملة بنجاح.");
      setIsSheetOpen(false);
    },
    onError: (error) => showError(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteFinancialTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["case", caseId] });
      showSuccess("تم حذف المعاملة بنجاح.");
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => showError(error.message),
  });

  const handleAddClick = () => {
    setEditingTransaction(null);
    setIsSheetOpen(true);
  };

  const handleEditClick = (transaction: FinancialTransaction) => {
    setEditingTransaction(transaction);
    setIsSheetOpen(true);
  };

  const handleDeleteClick = (transaction: FinancialTransaction) => {
    setTransactionToDelete(transaction);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (transactionToDelete) {
      deleteMutation.mutate(transactionToDelete.id);
    }
  };

  const handleSubmit = (data: FinancialTransactionFormData) => {
    if (editingTransaction) {
      updateMutation.mutate({ id: editingTransaction.id, ...data });
    } else {
      createMutation.mutate({ caseId, ...data });
    }
  };

  const defaultValues = editingTransaction ? {
    ...editingTransaction,
    transaction_date: new Date(editingTransaction.transaction_date),
    amount: Number(editingTransaction.amount),
  } : undefined;

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>الأمور المالية</CardTitle>
            <CardDescription>سجل الأتعاب والمصروفات لهذه القضية.</CardDescription>
          </div>
          <Button onClick={handleAddClick}>
            <PlusCircle className="w-4 h-4 ml-2" />
            إضافة معاملة
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>التاريخ</TableHead>
                <TableHead>النوع</TableHead>
                <TableHead>الوصف</TableHead>
                <TableHead className="text-left">المبلغ</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions && transactions.length > 0 ? (
                transactions.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>{format(new Date(t.transaction_date), "PPP")}</TableCell>
                    <TableCell>{t.transaction_type}</TableCell>
                    <TableCell>{t.description}</TableCell>
                    <TableCell className="text-left">{Number(t.amount).toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1 space-x-reverse">
                        <Button variant="ghost" size="icon" onClick={() => handleEditClick(t)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(t)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">لا توجد معاملات مالية.</TableCell>
                </TableRow>
              )}
            </TableBody>
            <TableFooter>
                <TableRow>
                    <TableCell colSpan={3} className="font-bold">إجمالي الأتعاب</TableCell>
                    <TableCell className="text-left font-bold">{totalFees.toFixed(2)}</TableCell>
                    <TableCell></TableCell>
                </TableRow>
                <TableRow>
                    <TableCell colSpan={3} className="font-bold">إجمالي المصروفات</TableCell>
                    <TableCell className="text-left font-bold">{totalExpenses.toFixed(2)}</TableCell>
                    <TableCell></TableCell>
                </TableRow>
                <TableRow className="text-lg">
                    <TableCell colSpan={3} className="font-extrabold">الرصيد</TableCell>
                    <TableCell className="text-left font-extrabold">{balance.toFixed(2)}</TableCell>
                    <TableCell></TableCell>
                </TableRow>
            </TableFooter>
          </Table>
        </CardContent>
      </Card>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{editingTransaction ? "تعديل معاملة" : "إضافة معاملة جديدة"}</SheetTitle>
          </SheetHeader>
          <div className="py-4">
            <FinancialsForm
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