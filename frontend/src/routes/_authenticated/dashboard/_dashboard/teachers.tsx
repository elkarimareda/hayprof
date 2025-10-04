import { getTeachers } from "@/apis/teachers";
import DataTable from "@/components/ui/DataTable";
import type { Teacher } from "@/Models/Teacher";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_authenticated/dashboard/_dashboard/teachers"
)({
  loader: async () => {
    return getTeachers();
  },
  component: RouteComponent,
});

function RouteComponent() {
  const teachersData: { teachers: Teacher[] } = Route.useLoaderData();
  return <DataTable data={teachersData.teachers} columns={["name", "email"]} />;
}
