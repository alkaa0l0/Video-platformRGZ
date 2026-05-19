import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { api } from "../api/client.js";
import { TopBar } from "../components/TopBar.jsx";

/**
 * Главная: сетка карточек со всеми загруженными видео.
 */
export function HomePage() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get("/api/videos/");
        const list = data.results || data;
        if (!cancelled) setVideos(list);
      } catch {
        if (!cancelled) setError("Не удалось загрузить список видео");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="yadro-bg min-h-screen">
      <TopBar />

      <main className="px-6 pb-16 lg:px-12">
        <h1 className="mb-8 text-3xl font-bold text-white">Все видео</h1>

        {loading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="aspect-video animate-pulse rounded-md bg-yadro-bgDeep/70"
              />
            ))}
          </div>
        )}

        {!loading && error && (
          <p className="text-yadro-textMute">{error}</p>
        )}

        {!loading && !error && videos.length === 0 && (
          <div className="rounded-md bg-yadro-bgDeep/80 p-10 text-center text-yadro-textMute">
            Видео пока нет. Залей первое через админку{" "}
            <a
              href="http://127.0.0.1:8000/admin/"
              className="text-yadro-accent hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              /admin/
            </a>
            .
          </div>
        )}

        {!loading && videos.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {videos.map((v) => (
              <VideoCard key={v.id} video={v} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function VideoCard({ video }) {
  return (
    <Link
      to={`/video/${video.id}`}
      className="group block overflow-hidden rounded-md bg-yadro-surface/50 transition hover:bg-yadro-surface"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-yadro-bgDeep">
        {video.poster_url ? (
          <img
            src={video.poster_url}
            alt={video.title}
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        ) : (
          <PosterPlaceholder />
        )}
        <div className="absolute inset-0 grid place-items-center bg-black/0 transition group-hover:bg-black/30">
          <PlayBadge />
        </div>
      </div>
      <div className="p-4">
        <h3 className="truncate text-base font-semibold text-white">
          {video.title}
        </h3>
        <p className="mt-1 truncate text-xs text-yadro-textMute">
          {video.owner_email} · {video.views} просмотров
        </p>
      </div>
    </Link>
  );
}

function PosterPlaceholder() {
  return (
    <svg
      viewBox="0 0 160 90"
      className="h-full w-full"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <rect width="160" height="90" fill="#0E1166" />
      <path d="M0 90L60 30L80 50L120 10L160 50V90Z" fill="#14186F" opacity="0.7" />
      <path d="M0 90L40 60L70 80L120 40L160 70V90Z" fill="#1E2380" opacity="0.6" />
      <text
        x="80"
        y="55"
        textAnchor="middle"
        fontFamily="Manrope, sans-serif"
        fontWeight="800"
        fontSize="14"
        fill="#7B82FF"
        letterSpacing="3"
      >
        YADRO
      </text>
    </svg>
  );
}

function PlayBadge() {
  return (
    <div className="grid h-14 w-14 place-items-center rounded-full bg-yadro-primary/90 opacity-0 transition group-hover:opacity-100">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="white">
        <path d="M5 3v14l12-7z" />
      </svg>
    </div>
  );
}