import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { api } from "../api/client.js";

/**
 * Список рекомендованных видео — показывается рядом с чатом.
 * Берёт все видео, исключает текущее.
 */
export function RecommendedVideos({ currentId }) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get("/api/videos/");
        const list = (data.results || data)
          .filter((v) => v.id !== currentId)
          .slice(0, 8);
        if (!cancelled) setVideos(list);
      } catch {
        /* тихо игнорируем */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [currentId]);

  return (
    <div>
      <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-yadro-textMute">
        Рекомендуемые видео
      </h2>

      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex gap-3"
            >
              <div className="h-20 w-36 shrink-0 animate-pulse rounded-lg bg-yadro-surface" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-3 w-full animate-pulse rounded bg-yadro-surface" />
                <div className="h-3 w-2/3 animate-pulse rounded bg-yadro-surface" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && videos.length === 0 && (
        <p className="text-sm text-yadro-textMute">Других видео пока нет.</p>
      )}

      {!loading && videos.length > 0 && (
        <div className="space-y-3">
          {videos.map((v) => (
            <RecommendedItem key={v.id} video={v} />
          ))}
        </div>
      )}
    </div>
  );
}

function RecommendedItem({ video }) {
  return (
    <Link
      to={`/video/${video.id}`}
      className="group flex gap-3 rounded-lg p-1.5 transition hover:bg-yadro-surface"
    >
      <div className="relative h-20 w-36 shrink-0 overflow-hidden rounded-lg bg-yadro-bgDeep">
        {video.poster_url ? (
          <img
            src={video.poster_url}
            alt={video.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <Placeholder />
        )}
      </div>
      <div className="min-w-0 flex-1 py-0.5">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-white">
          {video.title}
        </h3>
        <p className="mt-1 truncate text-xs text-yadro-textMute">
          {video.owner_email}
        </p>
        <p className="text-xs text-yadro-textMute">
          {video.views} просмотров
        </p>
      </div>
    </Link>
  );
}

function Placeholder() {
  return (
    <div className="grid h-full w-full place-items-center bg-yadro-surface">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect
          x="3"
          y="5"
          width="18"
          height="14"
          rx="3"
          stroke="#FF5C39"
          strokeWidth="1.6"
        />
        <path d="M10 9.5L15 12L10 14.5V9.5Z" fill="#FF5C39" />
      </svg>
    </div>
  );
}