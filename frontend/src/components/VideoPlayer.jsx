import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Видеоплеер с полностью рабочими элементами управления:
 *  - play / pause (кнопка и клик по видео)
 *  - перемотка (ползунок прогресса, можно тянуть)
 *  - громкость (ползунок) и mute
 *  - текущее время / длительность
 *  - полноэкранный режим
 */
export function VideoPlayer({ src, poster }) {
  const videoRef = useRef(null);
  const wrapRef = useRef(null);

  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);

  // Подписка на события видео
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onTime = () => setCurrent(v.currentTime);
    const onMeta = () => setDuration(v.duration || 0);
    const onVol = () => {
      setVolume(v.volume);
      setMuted(v.muted);
    };
    const onEnd = () => setPlaying(false);

    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);
    v.addEventListener("timeupdate", onTime);
    v.addEventListener("loadedmetadata", onMeta);
    v.addEventListener("volumechange", onVol);
    v.addEventListener("ended", onEnd);

    return () => {
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
      v.removeEventListener("timeupdate", onTime);
      v.removeEventListener("loadedmetadata", onMeta);
      v.removeEventListener("volumechange", onVol);
      v.removeEventListener("ended", onEnd);
    };
  }, [src]);

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play();
    else v.pause();
  }, []);

  const seekTo = (fraction) => {
    const v = videoRef.current;
    if (!v || !duration) return;
    v.currentTime = fraction * duration;
    setCurrent(v.currentTime);
  };

  const changeVolume = (fraction) => {
    const v = videoRef.current;
    if (!v) return;
    v.volume = fraction;
    v.muted = fraction === 0;
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
  };

  const toggleFullscreen = () => {
    const el = wrapRef.current;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else el.requestFullscreen?.();
  };

  const fmt = (s) => {
    if (!s || !isFinite(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const progress = duration ? current / duration : 0;

  return (
    <div
      ref={wrapRef}
      className="group relative aspect-video w-full overflow-hidden rounded-xl2 bg-yadro-bgDeep"
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="h-full w-full object-contain"
        preload="metadata"
        playsInline
        onClick={togglePlay}
      />

      {/* Большая кнопка play по центру, когда на паузе */}
      {!playing && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 m-auto grid h-16 w-16 place-items-center rounded-full bg-yadro-primary/90 text-white transition hover:bg-yadro-primary"
          aria-label="Воспроизвести"
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 4v16l13-8z" />
          </svg>
        </button>
      )}

      {/* Нижняя панель управления */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent px-4 pb-3 pt-8">
        {/* Ползунок прогресса */}
        <Slider value={progress} onChange={seekTo} />

        <div className="mt-2 flex items-center gap-3 text-white">
          <button onClick={togglePlay} aria-label={playing ? "Пауза" : "Играть"}>
            {playing ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="5" width="4" height="14" rx="1" />
                <rect x="14" y="5" width="4" height="14" rx="1" />
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 4v16l13-8z" />
              </svg>
            )}
          </button>

          {/* Громкость */}
          <button onClick={toggleMute} aria-label="Звук">
            {muted || volume === 0 ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 9v6h4l5 5V4L8 9H4z" />
                <path
                  d="M16 9l5 6m0-6l-5 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 9v6h4l5 5V4L8 9H4z" />
                <path
                  d="M16 8.5a5 5 0 0 1 0 7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
            )}
          </button>

          <div className="w-24">
            <Slider value={muted ? 0 : volume} onChange={changeVolume} />
          </div>

          {/* Время */}
          <span className="text-xs tabular-nums text-white/90">
            {fmt(current)} / {fmt(duration)}
          </span>

          <button
            onClick={toggleFullscreen}
            className="ml-auto"
            aria-label="Полный экран"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Ползунок 0..1 с поддержкой клика и перетаскивания мышью.
 * Используется и для прогресса, и для громкости.
 */
function Slider({ value, onChange }) {
  const trackRef = useRef(null);

  const apply = useCallback(
    (clientX) => {
      const el = trackRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      let p = (clientX - rect.left) / rect.width;
      p = Math.min(1, Math.max(0, p));
      onChange(p);
    },
    [onChange]
  );

  const onDown = (e) => {
    apply(e.clientX);
    const move = (ev) => apply(ev.clientX);
    const up = () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };

  return (
    <div
      ref={trackRef}
      onMouseDown={onDown}
      className="group/sl relative h-3 cursor-pointer"
    >
      {/* дорожка */}
      <div className="absolute top-1/2 h-1 w-full -translate-y-1/2 rounded-full bg-white/25">
        {/* заполнение */}
        <div
          className="h-full rounded-full bg-yadro-primary"
          style={{ width: `${value * 100}%` }}
        />
      </div>
      {/* бегунок */}
      <div
        className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white opacity-0 transition group-hover/sl:opacity-100"
        style={{ left: `${value * 100}%` }}
      />
    </div>
  );
}