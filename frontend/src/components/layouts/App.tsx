import type { PropsWithChildren } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import Logo from "@/assets/logo.svg?react";
import UserMenu from "@/components/UserMenu";
import { cx } from "class-variance-authority";
import Footer from "../Footer";

const App: React.FC<PropsWithChildren> = ({ children }) => {
  const location = useLocation();

  const navigationItems = [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "Courses",
      href: "/courses",
    },
    {
      label: "Teachers",
      href: "/teachers",
    },
  ];

  const isActive = (href: string) => {
    return (
      location.pathname === href ||
      (href !== "/" && location.pathname.startsWith(href))
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Navigation */}
      <nav className="sticky top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Link to="/">
                <Logo className="w-24 h-auto cursor-pointer" />
              </Link>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cx(" hover:text-purple-600 ", {
                    "font-bold text-purple-800": isActive(item.href),
                    "text-slate-700 font-medium": !isActive(item.href),
                  })}
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <div className="flex items-center space-x-4">
              <UserMenu />
              {/* <button className="text-slate-700 hover:text-purple-600 font-medium">
                Sign In
              </button>
              <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-xl font-medium hover:shadow-lg transition-all duration-300">
                Get Started
              </button> */}
            </div>
          </div>
        </div>
      </nav>
      {/* Main Content */}
      <main
        className={
          location.pathname === "/" ? "" : "max-w-7xl mx-auto px-6 py-4"
        }
      >
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default App;
