import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getHearings, deleteHearing } from "./actions";
import { Button } from "@/components/ui/button";
import { PlusCircle, Pencil, Trash2 } from "lucide-react";
import { HearingSheet } from "./HearingSheet";
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
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type HearingData = {
  id: string;
  hearing_date: string;
  case_number?: string;
  client_name?: string;
  room?: string | null;
  case_id?: string | null;
  judge?: string | null;
  result?: string | null;
  notes?: string | null;
  [key: string]: any;
};

const Hearings = () => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingHearing, setEditingHearing] = useState<HearingData | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingHearingId, setDeletingHearingId] = useState<string | null>(null);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [typeFilter, setTypeFilter] = useState<'all' | 'first' | 'adjournment'>('all');

  const queryClient = useQueryClient();
  const { data: hearings, isLoading, isError } = useQuery<HearingData[]>({
    queryKey: ["hearings", { searchTerm, dateFrom, dateTo, type: typeFilter }],
    queryFn: () => getHearings({ searchTerm, dateFrom, dateTo, type: typeFilter }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteHearing,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hearings"] });
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

  const handleEditClick = (hearing: HearingData) => {
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

  const clearFilters = () => {
    setSearchTerm("");
    setDateFrom(undefined);
    setDateTo(undefined);
    setTypeFilter("all");
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">إدارة الجلسات</h1>
          <p className="text-gray-600 dark:text-gray-400">
            عرض، إضافة، وتعديل بيانات الجلسات.
          </p>
        </div>
        <Button onClick={handleAddClick}>
          <PlusCircle className="w-4 h-4 ml-2" />
          إضافة جلسة
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>تصفية الجلسات</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Input
            placeholder="ابحث برقم القضية أو اسم الموكل..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as any)}>
            <SelectTrigger><SelectValue placeholder="نوع الجلسة" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">الكل</SelectItem>
              <SelectItem value="first">الجلسة الأولى</SelectItem>
              <SelectItem value="adjournment">تأجيل</SelectItem>
            </SelectContent>
          </Select>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !dateFrom && "text-muted-foreground")}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateFrom ? format(dateFrom, "PPP") : <span>من تاريخ</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} /></PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !dateTo && "text-muted-foreground")}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateTo ? format(dateTo, "PPP") : <span>إلى تاريخ</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={dateTo} onSelect={setDateTo} /></PopoverContent>
          </Popover>
          <Button onClick={clearFilters} variant="outline" className="lg:col-span-4">مسح الفلاتر</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>قائمة الجلسات</CardTitle>
          <CardDescription>
            هنا قائمة بجميع الجلسات المسجلة في النظام.
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
                    <TableHead className="text-right">تاريخ الجلسة</TableHead>
                    <TableHead className="text-right">رقم القضية</TableHead>
                    <TableHead className="text-right">الموكل</TableHead>
                    <TableHead className="text-right">النوع</TableHead>
                    <TableHead className="text-right">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {hearings && hearings.length > 0 ? (
                    hearings.map((hearing) => (
                      <TableRow key={hearing.id}>
                        <TableCell className="text-right">{format(new Date(hearing.hearing_date), "PPP")}</TableCell>
                        <TableCell className="font-medium text-right">
                          {hearing.case_id ? (
                            <Link to={`/cases/${hearing.case_id}`} className="text-primary hover:underline">
                              {hearing.case_number || "-"}
                            </Link>
                          ) : (
                            hearing.case_number || "-"
                          )}
                        </TableCell>
                        <TableCell className="text-right">{hearing.client_name || "-"}</TableCell>
                        <TableCell className="text-right">
                          {hearing.notes === 'الجلسة الأولى (آلي)' ? (
                            <Badge variant="default">الجلسة الأولى</Badge>
                          ) : (
                            <Badge variant="secondary">تأجيل</Badge>
                          )}
                        </TableCell>
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
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">
                        لا يوجد جلسات لعرضها.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <HearingSheet 
        open={isSheetOpen} 
        onOpenChange={setIsSheetOpen}
        hearing={editingHearing}
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

export default Hearings;