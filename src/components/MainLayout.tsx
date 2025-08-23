import { useEffect, useState } from "react";
import { Outlet, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SidebarNav } from "./SidebarNav";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Menu, UserCircle } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { getProfile } from "@/pages/settings/actions"; // استيراد دالة جلب الملف الشخصي

const MainLayout = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);

  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
  });

  useEffect(() => {
    const fetchUserName = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Use profile data if available, otherwise fallback to email
        setUserName(profile?.first_name && profile?.last_name 
          ? `${profile.first_name} ${profile.last_name}` 
          : user.user_metadata.full_name || user.email);
      }
    };

    fetchUserName();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        // Update user name based on session or profile
        setUserName(profile?.first_name && profile?.last_name 
          ? `${profile.first_name} ${profile.last_name}` 
          : session.user.user_metadata.full_name || session.user.email);
      } else {
        setUserName(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [profile, navigate]); // إضافة profile كاعتمادية

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    const first = firstName?.[0] || '';
    const last = lastName?.[0] || '';
    return `${first}${last}`.toUpperCase() || "MS";
  };

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-64 bg-sidebar border-l border-border dark:bg-gray-900 dark:border-gray-800">
        <div className="flex items-center h-16 px-6 border-b dark:border-gray-800">
          <h1 className="text-lg font-semibold">مكتب الأستاذ سايج محمد</h1>
        </div>
        <SidebarNav />
      </aside>

      <div className="flex flex-col flex-1">
        <header className="flex items-center justify-between h-16 px-4 bg-background border-b border-border md:px-6 dark:bg-gray-950 dark:border-gray-800">
          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="w-6 h-6" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full max-w-xs p-0">
                <div className="flex items-center h-16 px-6 border-b dark:border-gray-800">
                    <h1 className="text-lg font-semibold">القائمة</h1>
                </div>
                <SidebarNav onLinkClick={() => setMobileMenuOpen(false)} />
            </SheetContent>
          </Sheet>
          
          <div className="flex-1"></div> {/* Spacer */}

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="rounded-full h-9 w-9 p-0">
                {isLoadingProfile ? (
                  <UserCircle className="w-6 h-6" />
                ) : (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profile?.avatar_url || undefined} alt={userName || "User"} />
                    <AvatarFallback>{getInitials(profile?.first_name, profile?.last_name)}</AvatarFallback>
                  </Avatar>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{userName || "حسابي"}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/settings">الإعدادات</Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                تسجيل الخروج
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-secondary dark:bg-gray-900/50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;