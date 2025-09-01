import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import type { User } from "../Models/Auth";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => void;
}

interface MyRouterContext {
  auth: AuthState;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => (
    <div className="min-h-screen">
      <Outlet />
      <LanguageSwitcher />
      <TanStackRouterDevtools />
    </div>
  ),
});
