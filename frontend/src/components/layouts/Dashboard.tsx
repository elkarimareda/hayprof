import type { PropsWithChildren } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { Home, BookOpen, Users, GraduationCap } from "lucide-react";
import Logo from "@/assets/logo.svg?react";
import UserMenu from "@/components/UserMenu";

const Dashboard: React.FC<PropsWithChildren> = ({ children }) => {
  const location = useLocation();

  const navItems = [
    { to: "/dashboard", label: "Dashboard", icon: <Home size={18} /> },
    {
      to: "/dashboard/subjects",
      label: "Subjects",
      icon: <BookOpen size={18} />,
    },
    { to: "/dashboard/students", label: "Students", icon: <Users size={18} /> },
    {
      to: "/dashboard/teachers",
      label: "Teachers",
      icon: <GraduationCap size={18} />,
    },
    {
      to: "/dashboard/courses",
      label: "Courses",
      icon: <BookOpen size={18} />,
    },
  ];

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-800 fixed h-full flex flex-col border-r shadow-lg">
        <div className="p-4 flex items-center gap-2 m-auto">
          <Logo className="w-36 text-white" />
        </div>

        <nav className="flex-1 px-3 space-y-1 mt-4">
          {navItems.map(({ to, label, icon }) => {
            const active = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
                  ${
                    active
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-gray-300 hover:bg-slate-700 hover:text-white"
                  }`}
              >
                {icon}
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main */}
      <div className="flex-1 ml-64 flex flex-col">
        <header className="h-14 bg-white border-b shadow-sm flex items-center justify-between px-6">
          <div className="font-medium text-gray-700">Welcome back 👋</div>
          <UserMenu />
        </header>

        <main className="p-6 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};

export default Dashboard;
