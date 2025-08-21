import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center p-8">
        <h1 className="text-4xl font-bold mb-4 text-gray-800 dark:text-gray-200">
          لوحة التحكم
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
          مرحباً بك في نظام إدارة مكتب المحاماة.
        </p>
        <Button onClick={handleLogout}>تسجيل الخروج</Button>
      </div>
    </div>
  );
};

export default Index;