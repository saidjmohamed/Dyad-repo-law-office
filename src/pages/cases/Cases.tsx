import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCases, deleteCase } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Pencil, Trash2, Search, CalendarIcon, FilterIcon } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { getClients } from "../clients/actions";

type Case = {
  id: string;
  case_number: string;
  client_name: string;
  case_type: string;
  court: string;
  status: string;
  filing_date?: string | null;
  [key: string]: any;
};

const Cases = () => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingCase, setEditingCase] = useState<Case | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingCaseId, setDeletingCaseId] = useState<string | null>(null); // Corrected variable name
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCaseType, setFilterCaseType] = useState("");
  const [filterCourt, setFilterCourt] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterFilingDateFrom, setFilterFilingDateFrom] = useState<Date | undefined>(undefined);
  const [filterFilingDateTo, setFilterFilingDateTo] = useState<Date | undefined>(undefined);
  const [filterClientId, setFilterClientId] = useState("");

  const queryClient = useQueryClient();

  const { data: clients, isLoading: isLoadingClients } = useQuery({
    queryKey: ["clients"],
    queryFn: getClients,
  });

  const { data: cases, isLoading, isError } = useQuery<Case[]>({
    queryKey: ["cases", searchTerm, filterCaseType, filterCourt, filterStatus, filterFilingDateFrom, filterFilingDateTo, filterClientId],
    queryFn: () => getCases({ // Corrected: Wrap getCases in an arrow function
      searchTerm,
      case_type: filterCaseType || undefined,
      court: filterCourt || undefined,
      status: filterStatus || undefined,
      filing_date_from: filterFilingDateFrom,
      filing_date_to: filterFilingDateTo,
      client_id: filterClientId || undefined,
    }),
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

  const handleEditClick = (caseItem: Case) => {
    setEditingCase(caseItem);
    setIsSheetOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setDeletingCaseId(id); // Corrected: Use setDeletingCaseId
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (deletingCaseId) { // Corrected: Use deletingCaseId
      deleteMutation.mutate(deletingCaseId); // Corrected: Use deletingCaseId
    }
  };

  const handleClearFilters = () => {
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

      <Card>
        <CardHeader>
          <CardTitle>قائمة القضايا</CardTitle>
          <CardDescription>
            هنا قائمة بجميع القضايا المسجلة في النظام.
          </CardDescription>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ابحث برقم القضية، الموكل، النوع..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-4 pr-8"
              />
            </div>
            <Select value={filterCaseType} onValueChange={setFilterCaseType}>
              <SelectTrigger>
                <SelectValue placeholder="فلتر حسب نوع القضية" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">الكل</SelectItem>
                <SelectItem value="جنائية">جنائية</SelectItem>
                <SelectItem value="مدنية">مدنية</SelectItem>
                <SelectItem value="تجارية">تجارية</SelectItem>
                <SelectItem value="إدارية">إدارية</SelectItem>
                <SelectItem value="عمالية">عمالية</SelectItem>
                <SelectItem value="أحوال شخصية">أحوال شخصية</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="فلتر حسب المحكمة"
              value={filterCourt}
              onChange={(e) => setFilterCourt(e.target.value)}
            />
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="فلتر حسب الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">الكل</SelectItem>
                <SelectItem value="جديدة">جديدة</SelectItem>
                <SelectItem value="قيد النظر">قيد النظر</SelectItem>
                <SelectItem value="مكتملة">مكتملة</SelectItem>
                <SelectItem value="مؤجلة">مؤجلة</SelectItem>
                <SelectItem value="منقوضة">منقوضة</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterClientId} onValueChange={setFilterClientId} disabled={isLoadingClients}>
              <SelectTrigger>
                <SelectValue placeholder="فلتر حسب الموكل" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">الكل</SelectItem>
                {clients?.map(client => (
                  <SelectItem key={client.id} value={client.id}>{client.full_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !filterFilingDateFrom && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="ml-2 h-4 w-4" />
                  {filterFilingDateFrom ? format(filterFilingDateFrom, "PPP") : "تاريخ رفع الدعوى من"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filterFilingDateFrom}
                  onSelect={setFilterFilingDateFrom}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !filterFilingDateTo && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="ml-2 h-4 w-4" />
                  {filterFilingDateTo ? format(filterFilingDateTo, "PPP") : "تاريخ رفع الدعوى إلى"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filterFilingDateTo}
                  onSelect={setFilterFilingDateTo}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Button onClick={handleClearFilters} variant="outline" className="col-span-full lg:col-span-1">
              <FilterIcon className="ml-2 h-4 w-4" />
              مسح الفلاتر
            </Button>
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
                {cases && cases.length > 0 ? (
                  cases.map((caseItem) => (
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
                      {searchTerm || filterCaseType || filterCourt || filterStatus || filterFilingDateFrom || filterFilingDateTo || filterClientId ? "لم يتم العثور على نتائج مطابقة للفلاتر." : "لا يوجد قضايا لعرضها."}
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