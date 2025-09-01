import { type TeacherVideoRegistrationInputs } from "@/validators/onboarding/teacherSchema";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import Recorder from "@/components/Recorder";
import { useState } from "react";
import { LoaderCircle } from "lucide-react";
import { Input } from "@/components/ui/input";

interface Props {
  onNext: (data: TeacherVideoRegistrationInputs) => void;
  onPrevious: () => void;
  isLoading: boolean;
}

function FormVideo({ onPrevious, onNext, isLoading }: Props) {
  const { t } = useTranslation();
  const [video, setVideo] = useState<Blob | null>(null);
  const [thumbnails, setThumbnails] = useState<Blob | undefined>(undefined);

  const handleRecorded = async (blob: Blob, filename?: string) => {
    setVideo(blob);
    console.log("Video recorded:", blob, filename);
  };

  return (
    <>
      <Recorder onRecorded={handleRecorded} onReset={() => setVideo(null)} />
      <Input
        type="file"
        name="thumbnails"
        accept="image/*"
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          setThumbnails(e.target.files?.[0] || undefined);
        }}
      />
      <div className="flex justify-end gap-4 mt-6">
        <Button
          variant="outline"
          onClick={() => onPrevious()}
          disabled={isLoading}
        >
          {t("previous")}
        </Button>
        <Button
          disabled={!video || isLoading}
          onClick={() => video && onNext({ video, thumbnails })}
        >
          {isLoading && <LoaderCircle className="mr-2 animate-spin" />}
          {t("next")}
        </Button>
      </div>
    </>
  );
}

export default FormVideo;
