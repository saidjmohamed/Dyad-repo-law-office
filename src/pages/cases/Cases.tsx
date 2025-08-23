import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCases, deleteCase } from "./actions";
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
import { judicialStructure } from "@/data/judicialStructure";

type CaseData = {
  id: string;
  case_type: string;
  court: string;
  division?: string | null;
  case_number: string;
  filing_date?: string | null;
  status?: string | null;
  clients?: { full_name: string } | null;
  [key: string]: any;
};

const Cases = () => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingCase, setEditingCase] = useState<CaseData | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingCaseId, setDeletingCaseId] = useState<string | null>(null);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCaseType, setFilterCaseType] = useState("");
  const [filterCourt, setFilterCourt] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterFilingDateFrom, setFilterFilingDateFrom] = useState<Date | undefined>(undefined);
  const [filterFilingDateTo, setFilterFilingDateTo] = useState<Date | undefined>(undefined);
  const [filterClientId, setFilterClientId] = useState("");

  const queryClient = useQueryClient();

  const { data: cases, isLoading, isError } = useQuery<CaseData[]>({
    queryKey: ["cases", searchTerm, filterCaseType, filterCourt, filterStatus, filterFilingDateFrom, filterFilingDateTo, filterClientId],
    queryFn: () => getCases({
      searchTerm,
      filterCaseType,
      filterCourt,
      filterStatus,
      filterFilingDateFrom: filterFilingDateFrom?.toISOString(),
      filterFilingDateTo: filterFilingDateTo?.toISOString(),
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
    setFilterCaseType("");
    setFilterCourt("");
    setFilterStatus("");
    setFilterFilingDateFrom(undefined);
    setFilterFilingDateTo(undefined);
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
            <Select value={filterCaseType} onValueChange={setFilterCaseType}>
              <SelectTrigger><SelectValue placeholder="نوع القضية" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="مدنية">مدنية</SelectItem>
                <SelectItem value="جزائية">جزائية</SelectItem>
                <SelectItem value="تجارية">تجارية</SelectItem>
                <SelectItem value="إدارية">إدارية</SelectItem>
                <SelectItem value="أحوال شخصية">أحوال شخصية</SelectItem>
                <SelectItem value="عقارية">عقارية</SelectItem>
                <SelectItem value="اجتماعية">اجتماعية</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterCourt} onValueChange={setFilterCourt}>
              <SelectTrigger><SelectValue placeholder="جهة التقاضي" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={judicialStructure.tribunal.title}>{judicialStructure.tribunal.title}</SelectItem>
                <SelectItem value={judicialStructure.court_of_appeal.title}>{judicialStructure.court_of_appeal.title}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger><SelectValue placeholder="حالة القضية" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="جديدة">جديدة</SelectItem>
                <SelectItem value="مؤجلة">مؤجلة</SelectItem>
                <SelectItem value="للحكم">للحكم</SelectItem>
                <SelectItem value="محكومة">محكومة</SelectItem>
                <SelectItem value="منتهية">منتهية</SelectItem>
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
                  {filterFilingDateFrom ? format(filterFilingDateFrom, "PPP") : <span>تاريخ القيد (من)</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={filterFilingDateFrom} onSelect={setFilterFilingDateFrom} initialFocus />
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filterFilingDateTo ? format(filterFilingDateTo, "PPP") : <span>تاريخ القيد (إلى)</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={filterFilingDateTo} onSelect={setFilterFilingDateTo} initialFocus />
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
                    <TableHead className="text-right">جهة التقاضي</TableHead>
                    <TableHead className="text-right">تاريخ القيد</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                    <TableHead className="text-right">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cases && cases.length > 0 ? (
                    cases.map((caseItem) => (
                      <TableRow key={caseItem.id}>
                        <TableCell className="font-medium text-right">{caseItem.case_number}</TableCell>
                        <TableCell className="text-right">{caseItem.clients?.full_name || "-"}</TableCell>
                        <TableCell className="text-right">{caseItem.case_type}</TableCell>
                        <TableCell className="text-right">{caseItem.court}</TableCell>
                        <TableCell className="text-right">
                          {caseItem.filing_date ? format(new Date(caseItem.filing_date), "PPP") : "-"}
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