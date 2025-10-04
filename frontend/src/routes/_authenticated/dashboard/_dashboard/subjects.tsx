import DataTable from "@/components/ui/DataTable";
import type { Subject } from "@/Models/Common";
import api from "@/lib/request";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_authenticated/dashboard/_dashboard/subjects"
)({
  loader: async () => {
    const response = await api.get(`/subjects`);
    return response.data?.subjects;
  },
  component: RouteComponent,
});

function RouteComponent() {
  const subjectData: Subject[] = Route.useLoaderData();

  return (
    <DataTable
      data={subjectData}
      description="A list of subjects."
      columns={["name", "description", "type", "is_active"]}
    />
  );
}
