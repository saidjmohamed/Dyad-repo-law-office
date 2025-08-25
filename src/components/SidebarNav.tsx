import { NavLink } from "react-router-dom";
import { Briefcase, CalendarClock, LayoutDashboard, Users, ListTodo, CalendarDays, Settings, Users2 } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "لوحة التحكم", href: "/", icon: LayoutDashboard },
  { name: "الموكلون", href: "/clients", icon: Users },
  { name: "القضايا", href: "/cases", icon: Briefcase },
  { name: "الجلسات", href: "/hearings", icon: CalendarClock },
  { name: "المهام", href: "/tasks", icon: ListTodo },
  { name: "التقويم", href: "/calendar", icon: CalendarDays },
];

const adminNavigation = [
    { name: "إدارة المستخدمين", href: "/users", icon: Users2 },
];

const bottomNavigation = [
    { name: "الإعدادات", href: "/settings", icon: Settings },
];

interface SidebarNavProps {
  onLinkClick?: () => void;
  userRole?: string | null;
}

export const SidebarNav = ({ onLinkClick, userRole }: SidebarNavProps) => {
  const isAdmin = userRole === 'admin';

  return (
    <nav className="flex flex-col justify-between flex-1 p-4">
      <div>
        <div className="space-y-2">
            {navigation.map((item) => (
                <NavLink
                key={item.name}
                to={item.href}
                end={item.href === "/"}
                onClick={onLinkClick}
                className={({ isActive }) =>
                    cn(
                    "flex items-center px-4 py-2 text-sm font-medium rounded-md",
                    isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent dark:text-gray-300 dark:hover:bg-gray-800"
                    )
                }
                >
                <item.icon className="w-5 h-5 ml-3" />
                {item.name}
                </NavLink>
            ))}
            {isAdmin && adminNavigation.map((item) => (
                <NavLink
                key={item.name}
                to={item.href}
                onClick={onLinkClick}
                className={({ isActive }) =>
                    cn(
                    "flex items-center px-4 py-2 text-sm font-medium rounded-md",
                    isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent dark:text-gray-300 dark:hover:bg-gray-800"
                    )
                }
                >
                <item.icon className="w-5 h-5 ml-3" />
                {item.name}
                </NavLink>
            ))}
        </div>
      </div>
      <div>
        {bottomNavigation.map((item) => (
            <NavLink
            key={item.name}
            to={item.href}
            onClick={onLinkClick}
            className={({ isActive }) =>
                cn(
                "flex items-center px-4 py-2 text-sm font-medium rounded-md",
                isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent dark:text-gray-300 dark:hover:bg-gray-800"
                )
            }
            >
            <item.icon className="w-5 h-5 ml-3" />
            {item.name}
            </NavLink>
        ))}
      </div>
    </nav>
  );
};