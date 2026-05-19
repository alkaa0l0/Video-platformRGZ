import { useEffect, useRef, useState } from "react";

/**
 * Видеоплеер с минималистичной панелью управления:
 * play/pause слева, громкость + волна, иконки настроек и фуллскрина справа.
 * Точь-в-точь как на стр. 15 PDF.
 */
export function VideoPlayer({ src, poster }) {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);
    return () => {
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
    };
  }, []);

  const toggle = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play();
    else v.pause();
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  const goFullscreen = () => {
    const v = videoRef.current;
    if (v?.requestFullscreen) v.requestFullscreen();
  };

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-md bg-yadro-bgDeep">
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="h-full w-full object-cover"
        preload="metadata"
        playsInline
      />

      {/* нижняя панель управления */}
      <div className="pointer-events-auto absolute inset-x-0 bottom-0 flex items-center gap-3 px-4 py-3 text-white">
        <button onClick={toggle} aria-label={playing ? "Пауза" : "Воспроизвести"}>
          {playing ? (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <rect x="4" y="3" width="4" height="14" rx="1" />
              <rect x="12" y="3" width="4" height="14" rx="1" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M5 3v14l12-7z" />
            </svg>
          )}
        </button>

        <button onClick={toggleMute} aria-label={muted ? "Включить звук" : "Выключить звук"}>
          {muted ? (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M3 7v6h3l4 3V4L6 7H3z" />
              <path d="M14 8l3 3m0-3l-3 3" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M3 7v6h3l4 3V4L6 7H3z" />
            </svg>
          )}
        </button>

        {/* «волна» громкости из дизайна */}
        <div className="flex items-end gap-[2px]">
          {[3, 5, 7, 9, 7, 5, 7, 9, 5, 3].map((h, i) => (
            <span
              key={i}
              className="w-[2px] bg-white/70"
              style={{ height: `${h}px` }}
            />
          ))}
        </div>

        <div className="ml-auto flex items-center gap-3">
          <button aria-label="Настройки">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5" />
              <path
                d="M10 2v2M10 16v2M2 10h2M16 10h2M4.5 4.5l1.4 1.4M14.1 14.1l1.4 1.4M4.5 15.5l1.4-1.4M14.1 5.9l1.4-1.4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
          <button onClick={goFullscreen} aria-label="Полный экран">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M4 7V4h3M16 7V4h-3M4 13v3h3M16 13v3h-3"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
