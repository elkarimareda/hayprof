import { uploadMedia } from "@/apis/medias";
import FormAbout from "@/components/FormAbout";
import FormAvailability, {
  type AvailabilityData,
} from "@/components/FormAvailability";
import FormCertification from "@/components/FormCertification";
import FormDescription from "@/components/FormDescription";
import FormEducation from "@/components/FormEducation";
import FormPhoto from "@/components/FormPhoto";
import FormPricing from "@/components/FormPricing";
import FormVideo from "@/components/FormVideo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/utils/request";
import type {
  TeacherAboutRegistrationInputs,
  TeacherCertificationRegistrationInputs,
  TeacherDescriptionRegistrationInputs,
  TeacherEducationRegistrationInputs,
  TeacherPhotoRegistrationInputs,
  TeacherPricingRegistrationInputs,
  TeacherVideoRegistrationInputs,
} from "@/validators/onboarding/teacherSchema";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import type { AxiosError } from "axios";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/_app/onboarding")({
  beforeLoad: ({ context }) => {
    if (context.auth.user?.onboarding_completed) {
      throw redirect({
        to: "/profile", // Redirect to specific teacher onboarding
      });
    }
  },
  component: Onboarding,
});

const OnboardingStep = {
  ABOUT: 1,
  PHOTO: 2,
  CERTIFICATION: 3,
  EDUCATION: 4,
  DESCRIPTION: 5,
  VIDEO: 6,
  AVAILABILITY: 7,
  PRICING: 8,
  FINAL: 9,
} as const;

const OnboardingDescription = {
  [OnboardingStep.ABOUT]: "onboarding.about_description",
  [OnboardingStep.PHOTO]: "onboarding.photo_description",
  [OnboardingStep.CERTIFICATION]: "onboarding.certification_description",
  [OnboardingStep.EDUCATION]: "onboarding.education_description",
  [OnboardingStep.DESCRIPTION]: "onboarding.description_description",
  [OnboardingStep.VIDEO]: "onboarding.video_description",
  [OnboardingStep.AVAILABILITY]: "onboarding.availability_description",
  [OnboardingStep.PRICING]: "onboarding.pricing_description",
};

function Onboarding() {
  const { t } = useTranslation();
  const [step, setStep] = useState<number>(OnboardingStep.ABOUT);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleNext = async (
    data?:
      | TeacherAboutRegistrationInputs
      | TeacherPhotoRegistrationInputs
      | TeacherCertificationRegistrationInputs
      | TeacherEducationRegistrationInputs
      | { description: TeacherDescriptionRegistrationInputs }
      | TeacherVideoRegistrationInputs
      | { availabilities: AvailabilityData; timezone: string }
      | TeacherPricingRegistrationInputs
  ) => {
    console.log("Data received:", data);
    if (
      (step === OnboardingStep.VIDEO || step === OnboardingStep.PHOTO) &&
      data
    ) {
      const file =
        step === OnboardingStep.PHOTO
          ? "photo" in data
            ? data.photo[0]
            : undefined
          : "video" in data
            ? data.video
            : undefined;

      const thumbnails =
        step === OnboardingStep.VIDEO && data && "thumbnails" in data
          ? data.thumbnails
          : undefined;

      if (file) {
        setIsLoading(true);

        try {
          const response = await uploadMedia(
            file,
            step === OnboardingStep.VIDEO
              ? "introduction_video"
              : "profile_photo",
            thumbnails
          );
          localStorage.setItem(
            "teacher_data",
            JSON.stringify({
              ...JSON.parse(localStorage.getItem("teacher_data") ?? "{}"),
              ...{
                [step === OnboardingStep.VIDEO ? "video" : "photo"]:
                  response.data.id,
              },
            })
          );
        } catch (error: AxiosError | unknown) {
          toast.error((error as AxiosError).message);
          return;
        } finally {
          setIsLoading(false);
        }
      }
    } else if (step === OnboardingStep.PRICING) {
      const finalData = {
        ...JSON.parse(localStorage.getItem("teacher_data") ?? "{}"),
        ...data,
      };

      console.log(finalData);

      try {
        // Submit final onboarding data to backend
        // ... your API calls to save data ...

        // Mark onboarding as completed
        const response = await api.post(
          "/complete-teacher-onboarding",
          finalData
        );
        localStorage.removeItem("teacher_data");
        toast.success(response.data.message);

        // Redirect to profile
        navigate({ to: "/profile" });
      } catch (error) {
        toast.error("Error completing onboarding:" + error);
      }
    } else {
      localStorage.setItem(
        "teacher_data",
        JSON.stringify({
          ...JSON.parse(localStorage.getItem("teacher_data") ?? "{}"),
          ...data,
        })
      );
    }

    if (step < OnboardingStep.FINAL) {
      setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    if (step > OnboardingStep.ABOUT) {
      setStep(step - 1);
    }
  };

  const styleStepper = (currentStep: number) => {
    return `px-4 py-1 ${step >= currentStep ? "font-bold" : ""}`;
  };

  return (
    <div className="flex flex-col items-center justify-center ">
      <nav
        aria-label="Progress"
        className="flex items-center divide-x border bg-card w-full justify-center py-2 rounded-xl shadow-sm"
      >
        <ol className={styleStepper(OnboardingStep.ABOUT)}>
          {t("onboarding.about")}
        </ol>
        <ol className={styleStepper(OnboardingStep.PHOTO)}>
          {t("onboarding.photo")}
        </ol>
        <ol className={styleStepper(OnboardingStep.CERTIFICATION)}>
          {t("onboarding.certification")}
        </ol>
        <ol className={styleStepper(OnboardingStep.EDUCATION)}>
          {t("onboarding.education")}
        </ol>
        <ol className={styleStepper(OnboardingStep.DESCRIPTION)}>
          {t("onboarding.description")}
        </ol>
        <ol className={styleStepper(OnboardingStep.VIDEO)}>
          {t("onboarding.video")}
        </ol>
        <ol className={styleStepper(OnboardingStep.AVAILABILITY)}>
          {t("onboarding.availability")}
        </ol>
        <ol className={styleStepper(OnboardingStep.PRICING)}>
          {t("onboarding.pricing")}
        </ol>
      </nav>
      <main className="w-full max-w-xl m-6">
        <Card>
          <CardHeader>
            <CardTitle>
              {t(
                OnboardingDescription[
                  step as keyof typeof OnboardingDescription
                ]
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {step === OnboardingStep.ABOUT && <FormAbout onNext={handleNext} />}
            {step === OnboardingStep.PHOTO && (
              <FormPhoto
                isLoading={isLoading}
                onPrevious={handlePrevious}
                onNext={handleNext}
              />
            )}
            {step === OnboardingStep.CERTIFICATION && (
              <FormCertification
                onPrevious={handlePrevious}
                onNext={handleNext}
              />
            )}
            {step === OnboardingStep.EDUCATION && (
              <FormEducation onPrevious={handlePrevious} onNext={handleNext} />
            )}
            {step === OnboardingStep.DESCRIPTION && (
              <FormDescription
                onPrevious={handlePrevious}
                onNext={handleNext}
              />
            )}
            {step === OnboardingStep.VIDEO && (
              <FormVideo
                isLoading={isLoading}
                onPrevious={handlePrevious}
                onNext={handleNext}
              />
            )}
            {step === OnboardingStep.AVAILABILITY && (
              <FormAvailability
                onNext={handleNext}
                onPrevious={handlePrevious}
              />
            )}
            {step === OnboardingStep.PRICING && (
              <FormPricing onNext={handleNext} onPrevious={handlePrevious} />
            )}
            {step === OnboardingStep.FINAL && (
              <div>
                <h2>{t("onboarding.final.title")}</h2>
                <p>{t("onboarding.final.description")}</p>
              </div>
            )}
            {/* Add other components for each step here */}
            {/* Example: {step === OnboardingStep.PHOTO && <FormPhoto />} */}
            {/* Continue for other steps... */}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
