import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadCaseFile, deleteCaseFile, downloadCaseFile } from "./fileActions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { File, Upload, Download, Trash2, Loader2 } from "lucide-react";
import { showError, showSuccess } from "@/utils/toast";
import { DeleteConfirmationDialog } from "@/components/DeleteConfirmationDialog";

type CaseFile = {
  id: string;
  file_name: string;
  file_path: string;
  uploaded_at: string;
  size: number;
};

interface CaseDocumentsProps {
  caseId: string;
  files: CaseFile[];
}

const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export const CaseDocuments = ({ caseId, files }: CaseDocumentsProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<CaseFile | null>(null);
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: uploadCaseFile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["case", caseId] });
      showSuccess("تم رفع الملف بنجاح.");
      setIsSheetOpen(false);
      setSelectedFile(null);
    },
    onError: (error) => {
      showError(error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCaseFile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["case", caseId] });
      showSuccess("تم حذف الملف بنجاح.");
      setIsDeleteDialogOpen(false);
      setFileToDelete(null);
    },
    onError: (error) => {
      showError(error.message);
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (selectedFile) {
      uploadMutation.mutate({ caseId, file: selectedFile });
    }
  };

  const handleDeleteClick = (file: CaseFile) => {
    setFileToDelete(file);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (fileToDelete) {
      deleteMutation.mutate({ id: fileToDelete.id, file_path: fileToDelete.file_path });
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>المستندات</CardTitle>
            <CardDescription>جميع الملفات المتعلقة بهذه القضية.</CardDescription>
          </div>
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button>
                <Upload className="w-4 h-4 ml-2" />
                رفع مستند
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>رفع مستند جديد</SheetTitle>
              </SheetHeader>
              <form onSubmit={handleSubmit} className="py-4 space-y-4">
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Label htmlFor="document">اختر ملفًا</Label>
                  <Input id="document" type="file" onChange={handleFileChange} />
                </div>
                <Button type="submit" disabled={!selectedFile || uploadMutation.isPending}>
                  {uploadMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      جاري الرفع...
                    </>
                  ) : (
                    "رفع"
                  )}
                </Button>
              </form>
            </SheetContent>
          </Sheet>
        </CardHeader>
        <CardContent>
          {files && files.length > 0 ? (
            <div className="space-y-2">
              {files.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-2 border rounded-md">
                  <div className="flex items-center">
                    <File className="w-5 h-5 ml-3 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{file.file_name}</p>
                      <p className="text-sm text-muted-foreground">{formatBytes(file.size)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 space-x-reverse">
                    <Button variant="ghost" size="icon" onClick={() => downloadCaseFile(file.file_path, file.file_name)}>
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(file)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">لا توجد مستندات مرفقة.</p>
          )}
        </CardContent>
      </Card>
      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDelete}
        isPending={deleteMutation.isPending}
      />
    </>
  );
};