import { NavLink } from "react-router-dom";
import { Briefcase, CalendarClock, LayoutDashboard, Users, ListTodo } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "لوحة التحكم", href: "/", icon: LayoutDashboard },
  { name: "الموكلون", href: "/clients", icon: Users },
  { name: "القضايا", href: "/cases", icon: Briefcase },
  { name: "الجلسات", href: "/hearings", icon: CalendarClock },
  { name: "المهام", href: "/tasks", icon: ListTodo },
];

interface SidebarNavProps {
  onLinkClick?: () => void;
}

export const SidebarNav = ({ onLinkClick }: SidebarNavProps) => {
  return (
    <nav className="flex-1 p-4 space-y-2">
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
                : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            )
          }
        >
          <item.icon className="w-5 h-5 ml-3" />
          {item.name}
        </NavLink>
      ))}
    </nav>
  );
};