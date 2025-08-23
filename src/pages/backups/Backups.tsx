import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getBackups,
  createBackup,
  downloadBackup,
  restoreBackup,
  deleteBackup,
  BackupFormat,
  BackupTable,
} from "./actions.ts"; // تم تصحيح مسار الاستيراد
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { PlusCircle, Download, Upload, Trash2, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { showError, showSuccess } from "@/utils/toast";
import { Skeleton } from "@/components/ui/skeleton";
import { DeleteConfirmationDialog } from "@/components/DeleteConfirmationDialog";
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
import { TABLES_TO_BACKUP } from "@/integrations/supabase/constants";

type Backup = {
  id: string;
  filename: string;
  format: BackupFormat;
  size: number;
  created_at: string;
  storage_path: string;
};

const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const Backups = () => {
  const queryClient = useQueryClient();
  const [selectedFormat, setSelectedFormat] = useState<BackupFormat>('json');
  const [selectedTables, setSelectedTables] = useState<BackupTable[]>(TABLES_TO_BACKUP);
  const [isRestoreDialogOpen, setIsRestoreDialogOpen] = useState(false);
  const [backupToRestore, setBackupToRestore] = useState<Backup | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [backupToDelete, setBackupToDelete] = useState<Backup | null>(null);

  const { data: backups, isLoading: isLoadingBackups, isError: isErrorBackups } = useQuery<Backup[]>({
    queryKey: ["backups"],
    queryFn: getBackups,
  });

  const createBackupMutation = useMutation<Awaited<ReturnType<typeof createBackup>>, Error, { format: BackupFormat; tables: BackupTable[] }>({
    mutationFn: ({ format, tables }) =>
      createBackup(format, tables),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["backups"] });
      showSuccess("تم إنشاء النسخة الاحتياطية بنجاح.");
    },
    onError: (error) => {
      showError(error.message);
    },
  });

  const restoreBackupMutation = useMutation<Awaited<ReturnType<typeof restoreBackup>>, Error, string>({
    mutationFn: restoreBackup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["backups"] });
      // Invalidate all other queries that might have changed data
      queryClient.invalidateQueries(); 
      showSuccess("تم استعادة البيانات بنجاح.");
      setIsRestoreDialogOpen(false);
      setBackupToRestore(null);
    },
    onError: (error) => {
      showError(error.message);
    },
  });

  const deleteBackupMutation = useMutation<Awaited<ReturnType<typeof deleteBackup>>, Error, { id: string; storagePath: string }>({
    mutationFn: ({ id, storagePath }) =>
      deleteBackup(id, storagePath),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["backups"] });
      showSuccess("تم حذف النسخة الاحتياطية بنجاح.");
      setIsDeleteDialogOpen(false);
      setBackupToDelete(null);
    },
    onError: (error) => {
      showError(error.message);
    },
  });

  const handleCreateBackup = () => {
    createBackupMutation.mutate({ format: selectedFormat, tables: selectedTables });
  };

  const handleDownloadBackup = (backup: Backup) => {
    downloadBackup(backup.storage_path, backup.filename);
  };

  const handleRestoreClick = (backup: Backup) => {
    setBackupToRestore(backup);
    setIsRestoreDialogOpen(true);
  };

  const confirmRestore = () => {
    if (backupToRestore) {
      restoreBackupMutation.mutate(backupToRestore.id);
    }
  };

  const handleDeleteClick = (backup: Backup) => {
    setBackupToDelete(backup);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (backupToDelete) {
      deleteBackupMutation.mutate({ id: backupToDelete.id, storagePath: backupToDelete.storage_path });
    }
  };

  const handleTableToggle = (table: BackupTable) => {
    setSelectedTables((prev) =>
      prev.includes(table) ? prev.filter((t) => t !== table) : [...prev, table]
    );
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">النسخ الاحتياطية والاستعادة</h1>
          <p className="text-gray-600 dark:text-gray-400">
            إدارة النسخ الاحتياطية لبيانات تطبيقك.
          </p>
        </div>
        <Button
          onClick={handleCreateBackup}
          disabled={createBackupMutation.isPending || selectedTables.length === 0}
        >
          {createBackupMutation.isPending ? (
            <>
              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              جاري إنشاء نسخة احتياطية...
            </>
          ) : (
            <>
              <PlusCircle className="ml-2 h-4 w-4" />
              إنشاء نسخة احتياطية الآن
            </>
          )}
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>خيارات النسخ الاحتياطي</CardTitle>
          <CardDescription>
            اختر الجداول والصيغة لنسختك الاحتياطية الجديدة.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="backup-format">صيغة النسخة الاحتياطية</Label>
              <Select value={selectedFormat} onValueChange={(value: BackupFormat) => setSelectedFormat(value)}>
                <SelectTrigger id="backup-format">
                  <SelectValue placeholder="اختر صيغة..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">JSON</SelectItem>
                  {/* <SelectItem value="csv">CSV (لجدول واحد فقط)</SelectItem> */}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>الجداول المراد نسخها احتياطيًا</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {TABLES_TO_BACKUP.map((table) => (
                  <div key={table} className="flex items-center space-x-2 space-x-reverse">
                    <Checkbox
                      id={`table-${table}`}
                      checked={selectedTables.includes(table)}
                      onCheckedChange={() => handleTableToggle(table)}
                    />
                    <Label htmlFor={`table-${table}`} className="capitalize">
                      {table}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>النسخ الاحتياطية الموجودة</CardTitle>
          <CardDescription>
            قائمة بجميع النسخ الاحتياطية التي قمت بإنشائها.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingBackups ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : isErrorBackups ? (
            <div className="text-red-500 text-center py-4">
              حدث خطأ أثناء جلب النسخ الاحتياطية.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="min-w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">اسم الملف</TableHead>
                    <TableHead className="text-right">الصيغة</TableHead>
                    <TableHead className="text-right">الحجم</TableHead>
                    <TableHead className="text-right">تاريخ الإنشاء</TableHead>
                    <TableHead className="text-right">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {backups && backups.length > 0 ? (
                    backups.map((backup) => (
                      <TableRow key={backup.id}>
                        <TableCell className="font-medium text-right">{backup.filename}</TableCell>
                        <TableCell className="text-right">{backup.format.toUpperCase()}</TableCell>
                        <TableCell className="text-right">{formatBytes(backup.size)}</TableCell>
                        <TableCell className="text-right">{format(new Date(backup.created_at), "PPP p")}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center space-x-2 space-x-reverse justify-end">
                            <Button variant="ghost" size="icon" onClick={() => handleDownloadBackup(backup)}>
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleRestoreClick(backup)}>
                              <Upload className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(backup)}>
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">
                        لا توجد نسخ احتياطية لعرضها.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={isRestoreDialogOpen} onOpenChange={setIsRestoreDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من استعادة هذه النسخة الاحتياطية؟</AlertDialogTitle>
            <AlertDialogDescription>
              هذا الإجراء سيقوم بمسح البيانات الحالية واستبدالها ببيانات النسخة الاحتياطية. لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRestore} disabled={restoreBackupMutation.isPending}>
              {restoreBackupMutation.isPending ? "جاري الاستعادة..." : "نعم، استعد الآن"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDelete}
        isPending={deleteBackupMutation.isPending}
      />
    </>
  );
};

export default Backups;