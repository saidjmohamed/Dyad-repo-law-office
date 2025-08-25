import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"; // Added useMutation, useQueryClient
import { PlusCircle, Search, Edit, Trash2, Archive, ArchiveRestore } from "lucide-react"; // Replaced Unarchive with ArchiveRestore
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { getCases, deleteCase, toggleCaseArchiveStatus, Case as CaseType } from "./actions"; // Import CaseType from actions
import CaseSheet from "./CaseSheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { getClients } from "../clients/actions";
import { Client } from "../clients/ClientList"; // Import Client type
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type Case = { // This type should match the one in actions.ts
  id: string;
  case_number: string | null; // Allow null/undefined as per actions.ts
  status: string | null;
  client_id: string | null;
  created_at: string;
  updated_at: string | null;
  user_id: string;
  case_category: string;
  procedure_type: string;
  registered_at: string | null; // Allow null as per actions.ts
  court_name: string | null;
  province: string | null;
  jurisdiction_section: string | null;
  appeal_to_court: string | null;
  supreme_court_chamber: string | null;
  first_hearing_date: string | null;
  last_postponement_date: string | null;
  postponement_reason: string | null;
  next_hearing_date: string | null;
  judgment_text: string | null;
  statute_of_limitations: string | null;
  fees_amount: number | null;
  fees_status: string | null;
  fees_notes: string | null;
  internal_notes: string | null;
  public_summary: string | null;
  criminal_offense_type: string | null;
  complaint_filed_with: string | null;
  investigation_number: string | null;
  original_case_number: string | null;
  original_judgment_date: string | null;
  appellant_or_opponent: string | null;
  grounds_of_appeal: string | null;
  archived: boolean;
};

const Cases = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingCase, setEditingCase] = useState<Case | undefined>(undefined);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [caseToDelete, setCaseToDelete] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterClientId, setFilterClientId] = useState<string>("all");
  const [showArchived, setShowArchived] = useState<boolean>(false);

  const queryClient = useQueryClient(); // Initialized useQueryClient

  const { data: clients } = useQuery<Client[]>({ // Removed isLoadingClients as it's not used
    queryKey: ["clients"],
    queryFn: () => getClients({}),
  });

  const { data: cases, isLoading } = useQuery<CaseType[]>({ // Use CaseType
    queryKey: ["cases", searchTerm, filterStatus, filterClientId, showArchived],
    queryFn: () => getCases({
      searchTerm: searchTerm, // Corrected property name
      filterStatus: filterStatus === "all" ? undefined : filterStatus, // Corrected property name
      filterClientId: filterClientId === "all" ? undefined : filterClientId, // Corrected property name
      includeArchived: showArchived,
    }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCase,
    onSuccess: () => {
      toast.success("تم حذف القضية بنجاح.");
      queryClient.invalidateQueries({ queryKey: ["cases"] });
      setIsDeleteDialogOpen(false);
    },
    onError: (error: Error) => { // Explicitly type error
      toast.error(`فشل حذف القضية: ${error.message}`);
    },
  });

  const toggleArchiveMutation = useMutation({ // Renamed to avoid conflict with updateCase
    mutationFn: toggleCaseArchiveStatus, // Use the specific toggle function
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cases"] });
    },
    onError: (error: Error) => { // Explicitly type error
      toast.error(`فشل تحديث القضية: ${error.message}`);
    },
  });

  const handleAddCase = () => {
    setEditingCase(undefined);
    setIsSheetOpen(true);
  };

  const handleEditCase = (caseItem: Case) => {
    setEditingCase(caseItem);
    setIsSheetOpen(true);
  };

  const handleDeleteCase = (id: string) => {
    setCaseToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (caseToDelete) {
      deleteMutation.mutate(caseToDelete);
    }
  };

  const handleArchiveToggle = (caseItem: Case) => {
    toggleArchiveMutation.mutate({ id: caseItem.id, archived: !caseItem.archived });
    toast.success(`تم ${caseItem.archived ? "إلغاء أرشفة" : "أرشفة"} القضية بنجاح.`);
  };

  const getClientName = (clientId: string | null) => {
    return clients?.find((client) => client.id === clientId)?.full_name || "غير محدد";
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">القضايا</h1>
          <p className="text-gray-600 dark:text-gray-400">
            إدارة جميع القضايا الخاصة بك.
          </p>
        </div>
        <Button onClick={handleAddCase}>
          <PlusCircle className="mr-2 h-4 w-4" />
          إضافة قضية جديدة
        </Button>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
              <Input
                placeholder="البحث عن قضية..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="تصفية حسب الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="جديدة">جديدة</SelectItem>
                <SelectItem value="قيد التنفيذ">قيد التنفيذ</SelectItem>
                <SelectItem value="مكتملة">مكتملة</SelectItem>
                <SelectItem value="مؤجلة">مؤجلة</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterClientId} onValueChange={setFilterClientId}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="تصفية حسب الموكل" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الموكلين</SelectItem>
                {clients?.map((client: Client) => ( // Added null check and explicit type
                  <SelectItem key={client.id} value={client.id}>
                    {client.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => setShowArchived(!showArchived)}
              className="w-[180px]"
            >
              {showArchived ? "إخفاء الأرشيف" : "عرض الأرشيف"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>رقم القضية</TableHead>
                  <TableHead>الموكل</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>تاريخ التسجيل</TableHead>
                  <TableHead className="text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cases && cases.length > 0 ? ( // Added null check
                  cases.map((caseItem: CaseType) => ( // Explicitly type caseItem
                    <TableRow key={caseItem.id}>
                      <TableCell className="font-medium">
                        <Link to={`/cases/${caseItem.id}`} className="text-blue-500 hover:underline">
                          {caseItem.case_number}
                        </Link>
                      </TableCell>
                      <TableCell>{getClientName(caseItem.client_id)}</TableCell>
                      <TableCell>{caseItem.status}</TableCell>
                      <TableCell>{caseItem.registered_at ? new Date(caseItem.registered_at).toLocaleDateString() : "-"}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditCase(caseItem)}
                          className="ml-2"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleArchiveToggle(caseItem)}
                          className="ml-2"
                        >
                          {caseItem.archived ? <ArchiveRestore className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteCase(caseItem.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      لا توجد قضايا.
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
        caseData={editingCase}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد تمامًا؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيؤدي هذا الإجراء إلى حذف القضية بشكل دائم من سجلاتك.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>حذف</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Cases;