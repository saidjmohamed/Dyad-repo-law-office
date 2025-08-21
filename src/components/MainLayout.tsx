import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
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

const MainLayout = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-64 bg-gray-50 border-l border-gray-200 dark:bg-gray-900 dark:border-gray-800">
        <div className="flex items-center h-16 px-6 border-b dark:border-gray-800">
          <h1 className="text-lg font-semibold">مكتب المحاماة</h1>
        </div>
        <SidebarNav />
      </aside>

      <div className="flex flex-col flex-1">
        <header className="flex items-center justify-between h-16 px-4 bg-white border-b md:px-6 dark:bg-gray-950 dark:border-gray-800">
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
              <Button variant="ghost" size="icon" className="rounded-full">
                <UserCircle className="w-6 h-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>حسابي</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                تسجيل الخروج
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50 dark:bg-gray-900/50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;