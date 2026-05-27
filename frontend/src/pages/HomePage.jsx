import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { api } from "../api/client.js";
import { TopBar } from "../components/TopBar.jsx";

/**
 * Главная страница: сетка всех видео.
 * Поддерживает поиск по названию через ?q= в адресе.
 */
export function HomePage() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [params] = useSearchParams();
  const query = (params.get("q") || "").trim();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get("/api/videos/");
        if (!cancelled) setVideos(data.results || data);
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

  // Фильтрация по поисковому запросу
  const filtered = useMemo(() => {
    if (!query) return videos;
    const q = query.toLowerCase();
    return videos.filter((v) => v.title.toLowerCase().includes(q));
  }, [videos, query]);

  return (
    <div className="yadro-bg min-h-screen">
      <TopBar />

      <main className="px-6 pb-16 lg:px-12">
        {query ? (
          <h1 className="mb-8 text-2xl font-bold text-white">
            Результаты по запросу:{" "}
            <span className="text-yadro-primary">«{query}»</span>
          </h1>
        ) : (
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">Смотри и делись 🎬</h1>
            <p className="mt-1.5 text-sm text-yadro-textMute">
              Все видео платформы в одном месте.
            </p>
          </div>
        )}

        {loading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="aspect-video animate-pulse rounded-xl2 bg-yadro-surface"
              />
            ))}
          </div>
        )}

        {!loading && error && <p className="text-yadro-textMute">{error}</p>}

        {!loading && !error && filtered.length === 0 && (
          <div className="rounded-xl2 bg-yadro-surface/70 p-12 text-center text-yadro-textMute">
            {query ? (
              <p>По запросу «{query}» ничего не нашлось.</p>
            ) : (
              <p>
                Видео пока нет. Войди в аккаунт и нажми «Загрузить» в шапке.
              </p>
            )}
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((v) => (
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
      className="group block overflow-hidden rounded-xl2 bg-yadro-surface/60 transition hover:-translate-y-1 hover:bg-yadro-surface hover:shadow-card"
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
        <div className="absolute inset-0 grid place-items-center bg-black/0 transition group-hover:bg-black/25">
          <div className="grid h-14 w-14 place-items-center rounded-full bg-yadro-primary/95 opacity-0 transition group-hover:opacity-100">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="white">
              <path d="M5 3v14l12-7z" />
            </svg>
          </div>
        </div>
      </div>
      <div className="p-4">
        <h3 className="line-clamp-2 text-base font-semibold leading-snug text-white">
          {video.title}
        </h3>
        <p className="mt-2 flex items-center gap-2 text-xs text-yadro-textMute">
          <span className="truncate">{video.owner_email}</span>
          <span>·</span>
          <span className="shrink-0">{video.views} просмотров</span>
        </p>
      </div>
    </Link>
  );
}

function PosterPlaceholder() {
  return (
    <div className="grid h-full w-full place-items-center bg-gradient-to-br from-yadro-surface to-yadro-bgDeep">
      <svg width="46" height="46" viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect
          x="3"
          y="5"
          width="18"
          height="14"
          rx="4"
          stroke="#FF6B47"
          strokeWidth="1.6"
        />
        <path d="M10 9.5L15 12L10 14.5V9.5Z" fill="#FF6B47" />
      </svg>
    </div>
  );
}