import type { PropsWithChildren } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import Logo from "@/assets/logo.svg?react";
import UserMenu from "@/components/UserMenu";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, Home } from "lucide-react";

const App: React.FC<PropsWithChildren> = ({ children }) => {
  const location = useLocation();

  const navigationItems = [
    {
      label: "Home",
      href: "/",
      icon: Home,
    },
    {
      label: "Courses",
      href: "/courses",
      icon: BookOpen,
    },
    {
      label: "Teachers",
      href: "/teachers",
      icon: Users,
    },
  ];

  const isActive = (href: string) => {
    return (
      location.pathname === href ||
      (href !== "/" && location.pathname.startsWith(href))
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link to="/">
                <Logo className="w-28 h-auto" />
              </Link>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.href} to={item.href}>
                    <Button
                      variant={isActive(item.href) ? "default" : "ghost"}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors"
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
            </nav>

            {/* User Menu */}
            <div className="flex items-center">
              <UserMenu />
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="flex justify-around py-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} to={item.href} className="flex-1">
                  <Button
                    variant={isActive(item.href) ? "default" : "ghost"}
                    className="w-full flex flex-col items-center gap-1 py-2 text-xs"
                    size="sm"
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

export default App;
