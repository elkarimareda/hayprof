import type { PropsWithChildren } from "react";
import UserMenu from "@/components/UserMenu";
import Logo from "@/assets/logo.svg?react";

const Dashboard: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className="h-screen flex">
      {/* Fixed Sidebar */}
      <aside className="w-64 bg-gray-800 fixed h-full flex justify-between flex-col">
        <div className="p-4">
          <Logo className="w-44" />
          <nav className="space-y-2">
            <a
              href="#"
              className="flex items-center text-gray-300 hover:bg-gray-700 rounded p-2"
            >
              <span className="ml-2">Dashboard</span>
            </a>
            <a
              href="#"
              className="flex items-center text-gray-300 hover:bg-gray-700 rounded p-2"
            >
              <span className="ml-2">Analytics</span>
            </a>
            <a
              href="#"
              className="flex items-center text-gray-300 hover:bg-gray-700 rounded p-2"
            >
              <span className="ml-2">Reports</span>
            </a>
            <a
              href="#"
              className="flex items-center text-gray-300 hover:bg-gray-700 rounded p-2"
            >
              <span className="ml-2">Settings</span>
            </a>
          </nav>
        </div>
        <div className="p-4">
          <UserMenu />
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 ml-64">
        {/* Page Content */}
        <main className="p-6 min-h-screen">{children}</main>
      </div>
    </div>
  );
};

export default Dashboard;
