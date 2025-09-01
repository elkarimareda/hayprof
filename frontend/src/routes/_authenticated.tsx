import { UserType } from "@/Models/Auth";
import { createFileRoute, redirect, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: ({ context, location }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({
        to: "/login",
        search: {
          redirect: location.href,
        },
      });
    } else {
      // User is authenticated
      const isOnboardingRoute = location.pathname === "/onboarding";

      if (
        context.auth.user?.user_type === UserType.teacher &&
        !context.auth.user?.onboarding_completed &&
        !isOnboardingRoute // Don't redirect if already on onboarding route
      ) {
        throw redirect({
          to: "/onboarding", // Redirect to specific teacher onboarding
        });
      }
    }
  },
  component: Authenticated,
});

function Authenticated() {
  return <Outlet />;
}
