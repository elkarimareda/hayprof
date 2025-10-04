import { getCourses, ReviewingCourse } from "@/apis/courses";
import DataTable from "@/components/ui/DataTable";
import type { Course } from "@/Models/Course";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export const Route = createFileRoute(
  "/_authenticated/dashboard/_dashboard/courses"
)({
  loader: async () => {
    const coursesData = await getCourses();
    return coursesData?.courses;
  },
  component: RouteComponent,
});

function RouteComponent() {
  const coursesData: Course[] = Route.useLoaderData();
  const [updatedCourses, setUpdatedCourses] = useState<Course[]>(coursesData);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [pendingCourseForRejection, setPendingCourseForRejection] =
    useState<Course | null>(null);
  const [rejectionNotes, setRejectionNotes] = useState("Not suitable");

  const reviewHandler = async (course: Course, isValidated: boolean) => {
    try {
      if (isValidated) {
        await ReviewingCourse("validate", course.id);
        setUpdatedCourses(
          updatedCourses.map((c) =>
            c.id === course.id ? { ...c, is_validated: true } : c
          )
        );
        toast.success(`Course with ID ${course.id} has been validated.`);
      } else {
        // open notes modal and store the pending course
        setPendingCourseForRejection(course);
        setRejectionNotes("Not suitable");
        setShowNotesModal(true);
      }
    } catch (error) {
      console.error("Error reviewing course:", error);
      toast.error("An error occurred while reviewing the course.");
    }
  };

  return (
    <>
      <DataTable
        data={updatedCourses}
        showActions
        onEdit={(course) => {
          alert(`Edit course with data: ${JSON.stringify(course)}`);
        }}
        onDelete={(course) => {
          alert(`Delete course with data: ${JSON.stringify(course)}`);
        }}
        onToggle={(course, _, columnKey, value) => {
          if (columnKey === "is_validated") {
            reviewHandler(course, value);
          }
        }}
        columns={[
          "title",
          "description",
          "subject",
          "level",
          "price",
          "is_validated",
        ]}
      />

      {/* Notes modal for rejections */}
      <AlertDialog open={showNotesModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject course</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide notes explaining why the course is being rejected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="mt-2">
            <textarea
              value={rejectionNotes}
              onChange={(e) => setRejectionNotes(e.target.value)}
              className="w-full min-h-[120px] p-2 border rounded-md"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setShowNotesModal(false);
                setPendingCourseForRejection(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                try {
                  if (pendingCourseForRejection) {
                    await ReviewingCourse(
                      "reject",
                      pendingCourseForRejection.id,
                      rejectionNotes || "Not suitable"
                    );
                    setUpdatedCourses(
                      updatedCourses.map((c) =>
                        c.id === pendingCourseForRejection.id
                          ? { ...c, is_validated: false }
                          : c
                      )
                    );
                    toast.success(
                      `Course with ID ${pendingCourseForRejection.id} has been rejected.`
                    );
                  }
                } catch (error) {
                  console.error(error);
                  toast.error("An error occurred while rejecting the course.");
                } finally {
                  setShowNotesModal(false);
                  setPendingCourseForRejection(null);
                }
              }}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
