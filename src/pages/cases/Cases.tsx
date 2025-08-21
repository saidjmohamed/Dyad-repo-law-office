import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCases, deleteCase } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Pencil, Trash2, Search } from "lucide-react";
import { CaseSheet } from "./CaseSheet";
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
import { Badge } from "@/components/ui/badge";
import { DeleteConfirmationDialog } from "@/components/DeleteConfirmationDialog";
import { showSuccess, showError } from "@/utils/toast";
import { Link } from "react-router-dom";

type Case = {
  id: string;
  case_number: string;
  client_name: string;
  case_type: string;
  court: string;
  status: string;
  [key: string]: any;
};

const Cases = () => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingCase, setEditingCase] = useState<Case | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingCaseId, setDeletingCaseId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const queryClient = useQueryClient();
  const { data: cases, isLoading, isError } = useQuery<Case[]>({
    queryKey: ["cases"],
    queryFn: getCases,
  });

  const filteredCases = useMemo(() => {
    if (!cases) return [];
    // Perform client-side filtering based on search term
    return cases.filter(caseItem =>
      caseItem.case_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      caseItem.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      caseItem.case_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      caseItem.court.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (caseItem.division && caseItem.division.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (caseItem.last_adjournment_reason && caseItem.last_adjournment_reason.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (caseItem.judgment_summary && caseItem.judgment_summary.toLowerCase().includes(searchTerm.toLowerCase())) ||
      caseItem.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (caseItem.notes && caseItem.notes.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [cases, searchTerm]);

  const deleteMutation = useMutation({
    mutationFn: deleteCase,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cases"] });
      showSuccess("تم حذف القضية بنجاح.");
      setIsDeleteDialogOpen(false);
      setDeletingCaseId(null);
    },
    onError: (error) => {
      showError(error.message);
    },
  });

  const handleAddClick = () => {
    setEditingCase(null);
    setIsSheetOpen(true);
  };

  const handleEditClick = (caseItem: Case) => {
    setEditingCase(caseItem);
    setIsSheetOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setDeletingCaseId(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (deletingCaseId) {
      deleteMutation.mutate(deletingCaseId);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">إدارة القضايا</h1>
          <p className="text-gray-600 dark:text-gray-400">
            عرض، إضافة، وتعديل بيانات القضايا.
          </p>
        </div>
        <Button onClick={handleAddClick}>
          <PlusCircle className="w-4 h-4 ml-2" />
          إضافة قضية
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>قائمة القضايا</CardTitle>
          <CardDescription>
            هنا قائمة بجميع القضايا المسجلة في النظام.
          </CardDescription>
          <div className="relative mt-4">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="ابحث برقم القضية، الموكل، النوع..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-4 pr-8"
            />
          </div>
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
                  <TableHead>رقم القضية</TableHead>
                  <TableHead>الموكل</TableHead>
                  <TableHead>نوع القضية</TableHead>
                  <TableHead>المحكمة</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCases && filteredCases.length > 0 ? (
                  filteredCases.map((caseItem) => (
                    <TableRow key={caseItem.id}>
                      <TableCell className="font-medium">
                        <Link to={`/cases/${caseItem.id}`} className="hover:underline text-primary">
                          {caseItem.case_number}
                        </Link>
                      </TableCell>
                      <TableCell>{caseItem.client_name}</TableCell>
                      <TableCell>{caseItem.case_type}</TableCell>
                      <TableCell>{caseItem.court}</TableCell>
                      <TableCell>
                        <Badge>{caseItem.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <Button variant="ghost" size="icon" onClick={() => handleEditClick(caseItem)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(caseItem.id)}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      {searchTerm ? "لم يتم العثور على نتائج." : "لا يوجد قضايا لعرضها."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <CaseSheet 
        open={isSheetOpen} 
        onOpenChange={setIsSheetOpen} 
        caseItem={editingCase}
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

export default Cases;