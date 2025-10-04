import { Button } from "@/components/ui/button";
import { Users, UserMinus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Confirm } from "@/components/ui/Confirm";

interface Props {
  canEnroll: boolean;
  canUnenroll: boolean;
  enrolling: boolean;
  checkingEnrollment: boolean;
  isCancelled: boolean;
  confirmUnenrollOpen: boolean;
  onEnroll: () => void;
  onUnenroll: () => void;
  onConfirmUnenrollOpen: (open: boolean) => void;
}

export default function CourseActionButtons({
  canEnroll,
  canUnenroll,
  enrolling,
  checkingEnrollment,
  isCancelled,
  confirmUnenrollOpen,
  onEnroll,
  onUnenroll,
  onConfirmUnenrollOpen,
}: Props) {
  const { t } = useTranslation();

  if (!canEnroll && !canUnenroll) {
    return null;
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {canEnroll && (
        <Button
          size="lg"
          className="flex-1 sm:flex-none"
          onClick={onEnroll}
          disabled={enrolling || checkingEnrollment}
        >
          <Users className="w-4 h-4 mr-2" />
          {enrolling
            ? t("course.enrolling", "Enrolling...")
            : isCancelled
              ? t("course.re_enroll", "Re-enroll")
              : t("course.enroll", "Enroll Now")}
        </Button>
      )}

      {canUnenroll && (
        <>
          <Button
            size="lg"
            variant="outline"
            className="flex-1 sm:flex-none text-red-600 border-red-600 hover:bg-red-50"
            onClick={() => onConfirmUnenrollOpen(true)}
            disabled={enrolling || checkingEnrollment}
          >
            <UserMinus className="w-4 h-4 mr-2" />
            {enrolling
              ? t("course.unenrolling", "Unenrolling...")
              : t("course.unenroll", "Unenroll")}
          </Button>

          <Confirm
            open={confirmUnenrollOpen}
            title={t("course.confirm_unenroll_title", "Confirm Unenroll")}
            description={t(
              "course.confirm_unenroll_desc",
              "Are you sure you want to unenroll from this course?"
            )}
            onCancel={() => onConfirmUnenrollOpen(false)}
            onConfirm={async () => {
              onConfirmUnenrollOpen(false);
              await onUnenroll();
            }}
          />
        </>
      )}
    </div>
  );
}
