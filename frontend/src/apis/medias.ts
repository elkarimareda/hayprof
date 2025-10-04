import api from "@/lib/request";
import type { AxiosResponse } from "axios";

export function uploadMedia(
  file: File | Blob,
  purpose: "introduction_video" | "profile_photo",
  thumbnails?: File | Blob,
  isUser: boolean = false
): Promise<
  AxiosResponse<{
    id: number;
    url: string;
    type: "video" | "image";
    media_purpose: "introduction_video" | "profile_photo" | "other";
  }>
> {
  const formData = new FormData();
  formData.append("file", file);
  if (thumbnails) {
    formData.append("thumbnails", thumbnails);
  }
  formData.append("media_purpose", purpose);

  return api.post(isUser ? `${"/user/upload"}` : `${"/upload"}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}
