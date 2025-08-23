import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Briefcase, MapPin, Camera, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { professionalInfo } from "@/data/professionalInfo";
import { getProfile, uploadAvatar } from "./actions";
import { showError, showSuccess } from "@/utils/toast";
import { Skeleton } from "@/components/ui/skeleton";

type Profile = {
  first_name?: string | null;
  last_name?: string | null;
  avatar_url?: string | null;
};

const Settings = () => {
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: profile, isLoading: isLoadingProfile } = useQuery<Profile | null>({
    queryKey: ["profile"],
    queryFn: getProfile,
  });

  const uploadMutation = useMutation<Awaited<ReturnType<typeof uploadAvatar>>, Error, File>({
    mutationFn: uploadAvatar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      showSuccess("تم تحديث الصورة الشخصية بنجاح");
      setIsDialogOpen(false);
      setSelectedFile(null);
      setPreviewUrl(null);
    },
    onError: (error: Error) => {
      showError(error.message || "خطأ في رفع الصورة، حاول مرة أخرى");
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setIsDialogOpen(true);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      uploadMutation.mutate(selectedFile);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    const first = firstName?.[0] || '';
    const last = lastName?.[0] || '';
    return `${first}${last}`.toUpperCase() || "MS";
  };

  return (
    <>
      <div>
        <h1 className="text-3xl font-bold mb-6">الإعدادات</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>المعلومات المهنية</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="flex justify-center">
              <div className="relative group">
                {isLoadingProfile ? (
                  <Skeleton className="h-24 w-24 rounded-full" />
                ) : (
                  <Avatar className="h-24 w-24 cursor-pointer" onClick={handleAvatarClick}>
                    <AvatarImage src={profile?.avatar_url || "/lawyer.jpg"} alt={professionalInfo.name} />
                    <AvatarFallback>{getInitials(profile?.first_name, profile?.last_name)}</AvatarFallback>
                  </Avatar>
                )}
                <div 
                  className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  onClick={handleAvatarClick}
                >
                  <Camera className="h-8 w-8 text-white" />
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/png, image/jpeg, image/jpg"
                />
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center">
                <User className="w-5 h-5 ml-3 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">الاسم الكامل</p>
                  <p className="font-medium">{professionalInfo.name}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Briefcase className="w-5 h-5 ml-3 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">المهنة</p>
                  <p className="font-medium">{professionalInfo.title}</p>
                </div>
              </div>
              <div className="flex items-center">
                <MapPin className="w-5 h-5 ml-3 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">العنوان المهني</p>
                  <p className="font-medium">{professionalInfo.address}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>معاينة الصورة الشخصية</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center py-4">
            {previewUrl && (
              <img src={previewUrl} alt="Preview" className="w-48 h-48 rounded-full object-cover" />
            )}
          </div>
          <p className="text-center text-sm text-muted-foreground">معاينة الصورة الدائرية قبل الحفظ</p>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">إلغاء</Button>
            </DialogClose>
            <Button onClick={handleUpload} disabled={uploadMutation.isPending}>
              {uploadMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                "حفظ الصورة"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Settings;