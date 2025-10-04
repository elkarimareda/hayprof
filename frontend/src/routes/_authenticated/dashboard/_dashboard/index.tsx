import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/dashboard/_dashboard/")({
  component: IndexComponent,
});

function IndexComponent() {
  const { auth } = Route.useRouteContext();
  return (
    <div className="bg-white p-6 rounded-lg">
      <h2 className="text-xl font-semibold mb-2">Welcome back!</h2>
      <p className="text-gray-600">
        Hello, <strong>{auth.user?.name}</strong>! You are successfully
        authenticated.
      </p>
      <p className="text-sm text-gray-500 mt-2">Email: {auth.user?.email}</p>
    </div>
  );
}
