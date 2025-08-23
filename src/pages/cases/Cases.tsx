import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { CaseSheet } from "./CaseSheet";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteCase, getCases, Case as CaseData, CaseFormData } from "./actions"; // استيراد CaseFormData
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { judicialStructure } from "@/data/judicialStructure";
import { Skeleton } from "@/components/ui/skeleton";

const Cases = () => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingCase, setEditingCase] = useState<CaseData | null>(null);
  const [globalFilter, setGlobalFilter] = useState("");
  const [filterCaseCategory, setFilterCaseCategory] = useState("");
  const [filterDivisionOrChamber, setFilterDivisionOrChamber] = useState("");
  const [filterAppealType, setFilterAppealType] = useState("");

  const queryClient = useQueryClient();

  const { data: cases, isLoading } = useQuery<CaseData[]>({
    queryKey: ["cases", globalFilter, filterCaseCategory, filterDivisionOrChamber, filterAppealType],
    queryFn: () => getCases(filterCaseCategory, filterDivisionOrChamber, filterAppealType, globalFilter),
  });

  const deleteCaseMutation = useMutation({
    mutationFn: deleteCase,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cases"] });
      toast.success("تم حذف القضية بنجاح.");
    },
    onError: (error) => {
      toast.error(`فشل حذف القضية: ${error.message}`);
    },
  });

  const handleEdit = (caseData: CaseData) => {
    setEditingCase(caseData);
    setIsSheetOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteCaseMutation.mutate(id);
  };

  const columns: ColumnDef<CaseData>[] = useMemo(() => [
    {
      accessorKey: "case_number",
      header: "رقم القضية",
      cell: ({ row }) => (
        <Link to={`/cases/${row.original.id}`} className="text-primary hover:underline">
          {row.getValue("case_number")}
        </Link>
      ),
    },
    {
      accessorKey: "client_name",
      header: "الموكل",
    },
    {
      accessorKey: "case_type",
      header: "نوع القضية",
    },
    {
      accessorKey: "case_category",
      header: "مدني/جزائي",
    },
    {
      accessorKey: "court",
      header: "المحكمة/المجلس",
    },
    {
      accessorKey: "court_division_or_chamber",
      header: "القسم/الغرفة",
    },
    {
      accessorKey: "status",
      header: "الحالة",
      cell: ({ row }) => {
        const status = row.getValue("status");
        let variant: "default" | "secondary" | "destructive" | "outline" = "default";
        switch (status) {
          case "جديدة":
            variant = "secondary";
            break;
          case "قيد التنفيذ":
            variant = "default";
            break;
          case "مكتملة":
            variant = "outline";
            break;
          case "مؤجلة":
            variant = "destructive";
            break;
        }
        return <Badge variant={variant}>{status as string}</Badge>;
      },
    },
    {
      id: "actions",
      header: "الإجراءات",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">فتح القائمة</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>الإجراءات</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => handleEdit(row.original)}>تعديل</DropdownMenuItem>
            <DropdownMenuSeparator />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  حذف
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>هل أنت متأكد تمامًا؟</AlertDialogTitle>
                  <AlertDialogDescription>
                    لا يمكن التراجع عن هذا الإجراء. سيؤدي هذا إلى حذف القضية وجميع البيانات المرتبطة بها بشكل دائم.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>إلغاء</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleDelete(row.original.id)}>
                    حذف
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ], []);

  const allDivisionsAndChambers = useMemo(() => {
    const divisions = judicialStructure.courts.flatMap(court => court.divisions);
    const chambers = judicialStructure.councils.flatMap(council => council.chambers);
    return Array.from(new Set([...divisions, ...chambers]));
  }, []);

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">القضايا</h1>
          <p className="text-gray-600 dark:text-gray-400">إدارة جميع القضايا الخاصة بك.</p>
        </div>
        <Button onClick={() => { setEditingCase(null); setIsSheetOpen(true); }}>
          <PlusCircle className="ml-2 h-4 w-4" />
          إضافة قضية جديدة
        </Button>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <Input
          placeholder="بحث عام..."
          value={globalFilter}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="max-w-sm flex-1"
        />
        <Select value={filterCaseCategory} onValueChange={setFilterCaseCategory}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="تصفية حسب الفئة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">الكل</SelectItem>
            {judicialStructure.case_categories.map((category) => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterDivisionOrChamber} onValueChange={setFilterDivisionOrChamber}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="تصفية حسب القسم/الغرفة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">الكل</SelectItem>
            {allDivisionsAndChambers.map((item) => (
              <SelectItem key={item} value={item}>{item}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterAppealType} onValueChange={setFilterAppealType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="تصفية حسب نوع الطعن" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">الكل</SelectItem>
            {judicialStructure.appeal_types.map((type) => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-[300px] w-full" />
        </div>
      ) : (
        <DataTable columns={columns} data={cases || []} />
      )}

      <CaseSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        caseData={editingCase}
      />
    </div>
  );
};

export default Cases;