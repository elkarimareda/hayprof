import { createFileRoute, Outlet } from "@tanstack/react-router";
import AppLayout from "@/components/layouts/App";

export const Route = createFileRoute("/_public")({
  component: OnBoarding,
});

function OnBoarding() {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}
