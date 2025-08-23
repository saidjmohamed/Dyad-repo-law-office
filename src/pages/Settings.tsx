import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Briefcase, MapPin } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { professionalInfo } from "@/data/professionalInfo"; // استيراد المعلومات المهنية

const Settings = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">الإعدادات</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>المعلومات المهنية</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="flex justify-center">
            <Avatar className="h-24 w-24">
              <AvatarImage src="/lawyer.jpg" alt="محمد سايج" />
              <AvatarFallback>MS</AvatarFallback>
            </Avatar>
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
  );
};

export default Settings;