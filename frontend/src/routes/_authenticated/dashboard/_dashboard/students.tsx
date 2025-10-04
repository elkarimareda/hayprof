import { getStudents } from "@/apis/students";
import DataTable from "@/components/ui/DataTable";
import type { Student } from "@/Models/Student";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_authenticated/dashboard/_dashboard/students"
)({
  loader: async () => {
    return getStudents();
  },
  component: RouteComponent,
});

function RouteComponent() {
  const studentsData: { students: Student[] } = Route.useLoaderData();
  return <DataTable data={studentsData.students} columns={["name", "email"]} />;
}
