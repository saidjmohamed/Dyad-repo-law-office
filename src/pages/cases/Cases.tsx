import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCases, deleteCase, Case } from "./actions"; // استيراد Case من actions
import { getClients } from "../clients/actions";
import { Button } from "@/components/ui/button";
import { PlusCircle, Pencil, Trash2, Eye } from "lucide-react";
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
import { format } from "date-fns";
import { DeleteConfirmationDialog } from "@/components/DeleteConfirmationDialog";
import { showSuccess, showError } from "@/utils/toast";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { caseCategoryOptions, procedureTypeOptions, jurisdictionSectionOptions, feesStatusOptions } from "@/data/caseOptions"; // استيراد الخيارات الجديدة

type CaseData = Case; // استخدام النوع الموحد Case

const Cases = () => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingCase, setEditingCase] = useState<CaseData | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingCaseId, setDeletingCaseId] = useState<string | null>(null);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCaseCategory, setFilterCaseCategory] = useState(""); // Renamed
  const [filterProcedureType, setFilterProcedureType] = useState(""); // New filter
  const [filterCourtName, setFilterCourtName] = useState(""); // Renamed
  const [filterStatus, setFilterStatus] = useState("");
  const [filterRegisteredAtFrom, setFilterRegisteredAtFrom] = useState<Date | undefined>(undefined); // Renamed
  const [filterRegisteredAtTo, setFilterRegisteredAtTo] = useState<Date | undefined>(undefined); // Renamed
  const [filterClientId, setFilterClientId] = useState("");

  const queryClient = useQueryClient();

  const { data: cases, isLoading, isError } = useQuery<CaseData[]>({
    queryKey: ["cases", searchTerm, filterCaseCategory, filterProcedureType, filterCourtName, filterStatus, filterRegisteredAtFrom, filterRegisteredAtTo, filterClientId],
    queryFn: () => getCases({
      searchTerm,
      filterCaseCategory,
      filterCourtName,
      filterStatus,
      filterRegisteredAtFrom: filterRegisteredAtFrom?.toISOString(),
      filterRegisteredAtTo: filterRegisteredAtTo?.toISOString(),
      filterClientId,
    }),
  });

  const { data: clients } = useQuery({
    queryKey: ["clients"],
    queryFn: getClients,
  });

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

  const handleEditClick = (caseData: CaseData) => {
    setEditingCase(caseData);
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

  const clearFilters = () => {
    setSearchTerm("");
    setFilterCaseCategory("");
    setFilterProcedureType("");
    setFilterCourtName("");
    setFilterStatus("");
    setFilterRegisteredAtFrom(undefined);
    setFilterRegisteredAtTo(undefined);
    setFilterClientId("");
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

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>تصفية القضايا</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              placeholder="ابحث برقم القضية، الموكل..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Select value={filterCaseCategory} onValueChange={setFilterCaseCategory}>
              <SelectTrigger><SelectValue placeholder="نوع القضية" /></SelectTrigger>
              <SelectContent>
                {caseCategoryOptions.map(option => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterProcedureType} onValueChange={setFilterProcedureType}>
              <SelectTrigger><SelectValue placeholder="نوع الإجراء" /></SelectTrigger>
              <SelectContent>
                {procedureTypeOptions.map(option => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input
              placeholder="اسم المحكمة/المجلس"
              value={filterCourtName}
              onChange={(e) => setFilterCourtName(e.target.value)}
            />
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger><SelectValue placeholder="حالة القضية" /></SelectTrigger>
              <SelectContent>
                {feesStatusOptions.map(option => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterClientId} onValueChange={setFilterClientId}>
              <SelectTrigger><SelectValue placeholder="الموكل" /></SelectTrigger>
              <SelectContent>
                {clients?.map(client => <SelectItem key={client.id} value={client.id}>{client.full_name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filterRegisteredAtFrom ? format(filterRegisteredAtFrom, "PPP") : <span>تاريخ التسجيل (من)</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={filterRegisteredAtFrom} onSelect={setFilterRegisteredAtFrom} initialFocus />
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filterRegisteredAtTo ? format(filterRegisteredAtTo, "PPP") : <span>تاريخ التسجيل (إلى)</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={filterRegisteredAtTo} onSelect={setFilterRegisteredAtTo} initialFocus />
              </PopoverContent>
            </Popover>
            <Button onClick={clearFilters} variant="outline">مسح الفلاتر</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>قائمة القضايا</CardTitle>
          <CardDescription>
            هنا قائمة بجميع القضايا المسجلة في النظام.
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
            <div className="overflow-x-auto">
              <Table className="min-w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">رقم القضية</TableHead>
                    <TableHead className="text-right">الموكل</TableHead>
                    <TableHead className="text-right">نوع القضية</TableHead>
                    <TableHead className="text-right">نوع الإجراء</TableHead>
                    <TableHead className="text-right">تاريخ التسجيل</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                    <TableHead className="text-right">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cases && cases.length > 0 ? (
                    cases.map((caseItem: CaseData) => (
                      <TableRow key={caseItem.id}>
                        <TableCell className="font-medium text-right">{caseItem.case_number || "-"}</TableCell>
                        <TableCell className="text-right">{caseItem.client_name || "-"}</TableCell>
                        <TableCell className="text-right">{caseItem.case_category}</TableCell>
                        <TableCell className="text-right">{caseItem.procedure_type}</TableCell>
                        <TableCell className="text-right">
                          {caseItem.registered_at ? format(new Date(caseItem.registered_at), "PPP") : "-"}
                        </TableCell>
                        <TableCell className="text-right">{caseItem.status || "جديدة"}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center space-x-2 space-x-reverse justify-end">
                            <Link to={`/cases/${caseItem.id}`}>
                              <Button variant="ghost" size="icon">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </Link>
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
                      <TableCell colSpan={7} className="text-center">
                        لا يوجد قضايا لعرضها.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <CaseSheet 
        open={isSheetOpen} 
        onOpenChange={setIsSheetOpen}
        caseData={editingCase}
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