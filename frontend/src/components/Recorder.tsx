import React, { useEffect, useRef, useState } from "react";
import {
  Camera,
  Square,
  Upload,
  Download,
  Play,
  Pause,
  RotateCcw,
} from "lucide-react";
import { useTranslation } from "react-i18next";

interface RecorderProps {
  onRecorded: (blob: Blob, filename?: string) => void;
  onReset: () => void;
  maxRecordingTimeMs?: number;
}

const Recorder: React.FC<RecorderProps> = ({
  onRecorded,
  onReset,
  maxRecordingTimeMs = 2 * 60 * 1000,
}) => {
  const { t } = useTranslation();
  const [isRecording, setIsRecording] = useState(false);
  const [mediaSupported, setMediaSupported] = useState(true);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);
  const recordingTimerRef = useRef<number | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    return () => {
      stopStream();
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      if (timerRef.current) window.clearTimeout(timerRef.current);
      if (recordingTimerRef.current)
        window.clearInterval(recordingTimerRef.current);
    };
  }, [previewUrl]);

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      try {
        videoRef.current.srcObject = null;
      } catch {
        /* noop */
      }
    }
  };

  const formatVideoTime = (seconds: number) => {
    if (!Number.isFinite(seconds) || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const ct = videoRef.current.currentTime;
      const dur = videoRef.current.duration;

      setCurrentTime(Number.isFinite(ct) ? ct : 0);
      setDuration(Number.isFinite(dur) ? dur : 0);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || !duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;

    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const startRecordingTimer = () => {
    setRecordingTime(0);
    recordingTimerRef.current = window.setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);
  };

  const stopRecordingTimer = () => {
    if (recordingTimerRef.current) {
      window.clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
  };

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1920, height: 1080, facingMode: "user" },
        audio: true,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
        videoRef.current.play().catch(() => {});
      }

      const options: MediaRecorderOptions = {};
      if (
        MediaRecorder.isTypeSupported &&
        MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")
      ) {
        options.mimeType = "video/webm;codecs=vp9,opus";
      } else if (
        MediaRecorder.isTypeSupported &&
        MediaRecorder.isTypeSupported("video/webm;codecs=vp8,opus")
      ) {
        options.mimeType = "video/webm;codecs=vp8,opus";
      }

      const mr = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mr;
      chunksRef.current = [];

      mr.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mr.onerror = (e) => {
        console.error("MediaRecorder error:", e);
        setIsRecording(false);
        stopRecordingTimer();
      };

      mr.onstop = () => {
        if (chunksRef.current.length === 0) {
          console.error("No data recorded");
          // Still clean up the stream even if no data was recorded
          stopStream();
          return;
        }

        let mimeType = "video/webm";
        if (mediaRecorderRef.current?.mimeType) {
          mimeType = mediaRecorderRef.current.mimeType;
        } else if (chunksRef.current[0]?.type) {
          mimeType = chunksRef.current[0].type;
        }

        const blob = new Blob(chunksRef.current, { type: mimeType });

        if (blob.size === 0) {
          console.error("Generated blob is empty");
          stopStream();
          return;
        }

        const url = URL.createObjectURL(blob);

        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
        }

        setPreviewUrl(url);
        stopStream();
        setIsPlaying(false); // Reset playing state

        if (videoRef.current) {
          videoRef.current.src = url;
          videoRef.current.controls = false;
          videoRef.current.load();
        }

        const extension = mimeType.includes("webm")
          ? "webm"
          : mimeType.includes("mp4")
            ? "mp4"
            : "webm";

        onRecorded(blob, `recorded-${Date.now()}.${extension}`);
      };

      mr.start(1000);
      setIsRecording(true);
      startRecordingTimer();

      if (maxRecordingTimeMs > 0) {
        timerRef.current = window.setTimeout(
          () => stopRecording(),
          maxRecordingTimeMs
        );
      }
    } catch (err) {
      console.error("Media devices error:", err);
      setMediaSupported(false);
    }
  };

  const stopRecording = () => {
    // Immediately update UI state to prevent multiple calls
    setIsRecording(false);
    setIsPlaying(false);
    stopRecordingTimer();

    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    // Handle MediaRecorder stopping
    if (mediaRecorderRef.current) {
      const currentState = mediaRecorderRef.current.state;

      if (currentState === "recording") {
        try {
          mediaRecorderRef.current.requestData();
          mediaRecorderRef.current.stop();
        } catch (error) {
          console.error("Error stopping MediaRecorder:", error);
        }
      } else if (currentState === "paused") {
        try {
          mediaRecorderRef.current.stop();
        } catch (error) {
          console.error("Error stopping paused MediaRecorder:", error);
        }
      }
    }
  };

  const handleFileSelected = (file?: File) => {
    if (!file) return;

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    if (videoRef.current) {
      try {
        videoRef.current.srcObject = null;
        videoRef.current.src = url;
        videoRef.current.controls = false;
        videoRef.current.load();
      } catch {
        /* noop */
      }
    }

    onRecorded(file, file.name);
  };

  const togglePlayback = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {});
      }
      setIsPlaying(!isPlaying);
    }
  };

  const resetRecording = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    stopStream();
    setIsPlaying(false);
    setRecordingTime(0);
    setCurrentTime(0);
    setDuration(0);
    onReset();
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {!mediaSupported && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          <span className="text-red-700 font-medium">
            Camera and microphone access is not supported in this browser
          </span>
        </div>
      )}

      {/* Video Container */}
      <div className="relative mb-8 bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-2xl overflow-hidden shadow-2xl">
        <div className="aspect-video relative group">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            src={previewUrl ?? undefined}
            playsInline
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleTimeUpdate}
          />

          {/* Recording Indicator */}
          {isRecording && (
            <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-500 text-white px-3 py-2 rounded-full animate-pulse">
              <div className="w-3 h-3 bg-white rounded-full"></div>
              <span className="font-semibold">
                REC {formatVideoTime(recordingTime)}
              </span>
            </div>
          )}

          {/* Play Button Overlay */}
          {previewUrl && !isRecording && (
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {/* Center Controls */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex items-center gap-4">
                  <button
                    onClick={resetRecording}
                    className="w-12 h-12 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300 hover:scale-110"
                    title="Reset"
                  >
                    <RotateCcw className="w-5 h-5 text-white" />
                  </button>

                  <button
                    onClick={togglePlayback}
                    className="w-20 h-20 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300 hover:scale-110"
                  >
                    {isPlaying ? (
                      <Pause className="w-8 h-8 text-white ml-0" />
                    ) : (
                      <Play className="w-8 h-8 text-white ml-1" />
                    )}
                  </button>

                  <a
                    href={previewUrl}
                    download
                    className="w-12 h-12 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300 hover:scale-110"
                    title="Download"
                  >
                    <Download className="w-5 h-5 text-white" />
                  </a>
                </div>
              </div>

              {/* Timeline Controls */}
              <div className="absolute bottom-4 left-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <span className="text-white text-sm font-medium min-w-[40px]">
                    {formatVideoTime(currentTime)}
                  </span>

                  <div
                    className="flex-1 h-2 bg-white/20 rounded-full cursor-pointer relative group/timeline"
                    onClick={handleSeek}
                  >
                    <div
                      className="h-full bg-red-500 rounded-full transition-all duration-150 relative"
                      style={{
                        width: duration
                          ? `${(currentTime / duration) * 100}%`
                          : "0%",
                      }}
                    >
                      <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg opacity-0 group-hover/timeline:opacity-100 transition-opacity duration-200"></div>
                    </div>
                  </div>

                  <span className="text-white text-sm font-medium min-w-[40px]">
                    {formatVideoTime(duration)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!previewUrl && !isRecording && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-gray-400">
                <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Ready to record</p>
                <p className="text-sm">
                  Click start recording or choose a file
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        {/* Main Recording Button */}
        {!isRecording ? (
          <button
            type="button"
            onClick={start}
            disabled={!mediaSupported}
            className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
          >
            <Camera className="w-5 h-5" />
            {t("start")} {t("recording")}
          </button>
        ) : (
          <button
            type="button"
            onClick={stopRecording}
            className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-gray-700 to-gray-800 text-white font-semibold rounded-xl hover:from-gray-800 hover:to-gray-900 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Square className="w-5 h-5" />
            {t("stop")} {t("recording")}
          </button>
        )}

        {/* File Upload */}
        <label className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer transform hover:scale-105">
          <input
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              handleFileSelected(f);
            }}
          />
          <Upload className="w-5 h-5" />
          {t("upload")} {t("video")}
        </label>

        {/* Secondary Actions */}
        {previewUrl && (
          <div className="flex gap-3">
            {/* These buttons are now in the video overlay, but keeping this div for potential future actions */}
          </div>
        )}
      </div>

      {/* Recording Info */}
      {maxRecordingTimeMs > 0 && (
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Maximum recording time: {Math.floor(maxRecordingTimeMs / 60000)}{" "}
            minutes
          </p>
        </div>
      )}
    </div>
  );
};

export default Recorder;
