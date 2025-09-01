import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import AppLayout from "@/components/layouts/App";

export const Route = createFileRoute("/_authenticated/_app")({
  beforeLoad: ({ context, location }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({
        to: "/login",
        search: {
          redirect: location.href,
        },
      });
    }
  },
  component: App,
});

function App() {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}
