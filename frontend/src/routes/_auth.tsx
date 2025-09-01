import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import AppLayout from "@/components/layouts/App";

export const Route = createFileRoute("/_auth")({
  validateSearch: (search) => ({
    redirect: (search.redirect as string) || "/",
  }),
  beforeLoad: ({ context, search }) => {
    if (context.auth.isAuthenticated) {
      throw redirect({ to: search.redirect });
    }
  },
  component: OnBoarding,
});

function OnBoarding() {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}
