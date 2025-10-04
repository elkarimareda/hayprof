import { cx } from "class-variance-authority";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import { useRef, useState } from "react";

interface Props {
  src?: string;
  thumbnail?: string;
  className?: string;
}

function VideoPlayer({ src, thumbnail, className }: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

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

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
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

  return (
    <div
      className={cx(
        `relative mb-8 bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-xl overflow-hidden shadow-xl`,
        className
      )}
    >
      <div className="aspect-video relative group">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          src={src ?? undefined}
          poster={thumbnail}
          playsInline
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleTimeUpdate}
        />

        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {/* Center Controls */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex items-center gap-4">
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
            </div>
          </div>

          {/* Timeline Controls */}
          <div className="absolute bottom-4 left-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg p-4 flex items-center justify-between gap-4">
            <div className="flex items-center flex-1 gap-3">
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
            <button
              onClick={toggleMute}
              className="w-12 h-12 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-300 hover:scale-110"
            >
              {isMuted ? (
                <VolumeX className="w-6 h-6 text-white" />
              ) : (
                <Volume2 className="w-6 h-6 text-white" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VideoPlayer;
