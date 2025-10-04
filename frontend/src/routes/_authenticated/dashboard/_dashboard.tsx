import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import DashboardLayout from "@/components/layouts/Dashboard";

export const Route = createFileRoute("/_authenticated/dashboard/_dashboard")({
  beforeLoad: ({ context }) => {
    // If user is not authenticated or not an admin, redirect to home
    const userType = context.auth?.user?.user_type;
    if (userType !== "admin") {
      throw redirect({ to: "/" });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
}
