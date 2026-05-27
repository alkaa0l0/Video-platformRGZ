import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { api } from "../api/client.js";
import { ChatPanel } from "../components/ChatPanel.jsx";
import { RecommendedVideos } from "../components/RecommendedVideos.jsx";
import { TopBar } from "../components/TopBar.jsx";
import { VideoPlayer } from "../components/VideoPlayer.jsx";
import { useAuth } from "../context/AuthContext.jsx";

/**
 * Страница просмотра: плеер + лайки слева, чат и рекомендации справа.
 */
export function PlayerPage() {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        let target = null;
        if (id) {
          const { data } = await api.get(`/api/videos/${id}/`);
          target = data;
        } else {
          const { data } = await api.get("/api/videos/");
          const list = data.results || data;
          target = list[0] || null;
        }
        if (!cancelled) setVideo(target);
      } catch (e) {
        if (!cancelled) setError("Не удалось загрузить видео");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const streamUrl = video
    ? `${import.meta.env.VITE_API_URL || ""}/api/videos/${video.id}/stream/`
    : null;

  return (
    <div className="yadro-bg min-h-screen">
      <TopBar />

      <main className="grid gap-6 px-6 pb-16 lg:grid-cols-[1fr_380px] lg:px-12">
        {/* Левая колонка */}
        <section className="min-h-[60vh]">
          {loading && <PlayerSkeleton />}
          {!loading && video && (
            <>
              <VideoPlayer src={streamUrl} poster={video.poster_url} />
              <div className="mt-5">
                <h1 className="text-2xl font-bold text-white">{video.title}</h1>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs text-yadro-textMute">
                    {video.views} просмотров · {video.owner_email}
                  </p>
                  <ReactionBar video={video} onChange={setVideo} />
                </div>

                {video.description && (
                  <p className="mt-4 rounded-xl2 bg-yadro-surface/60 p-4 text-sm text-yadro-textMute">
                    {video.description}
                  </p>
                )}
              </div>
            </>
          )}
          {!loading && !video && (
            <EmptyState
              message={
                error ||
                "Видео ещё не загружены. Добавьте файл через страницу загрузки."
              }
            />
          )}
        </section>

        {/* Правая колонка */}
        <section className="space-y-6">
          {video && (
            <>
              <div className="h-[460px]">
                <ChatPanel videoId={video.id} />
              </div>
              <RecommendedVideos currentId={video.id} />
            </>
          )}
        </section>
      </main>
    </div>
  );
}

/* Кнопки лайк / дизлайк */
function ReactionBar({ video, onChange }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  const react = async (value) => {
    if (!user) {
      navigate("/auth");
      return;
    }
    if (busy) return;
    setBusy(true);
    try {
      const { data } = await api.post(`/api/videos/${video.id}/react/`, {
        value,
      });
      onChange({
        ...video,
        likes_count: data.likes,
        dislikes_count: data.dislikes,
        my_reaction: data.my_reaction,
      });
    } catch {
      /* тихо игнорируем */
    } finally {
      setBusy(false);
    }
  };

  const liked = video.my_reaction === "like";
  const disliked = video.my_reaction === "dislike";

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => react("like")}
        disabled={busy}
        className={[
          "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition",
          liked
            ? "bg-yadro-ok/20 text-yadro-ok"
            : "bg-yadro-surface text-yadro-textMute hover:text-white",
        ].join(" ")}
        aria-label="Нравится"
      >
        <ThumbIcon filled={liked} />
        {video.likes_count ?? 0}
      </button>

      <button
        onClick={() => react("dislike")}
        disabled={busy}
        className={[
          "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition",
          disliked
            ? "bg-yadro-primary/20 text-yadro-primary"
            : "bg-yadro-surface text-yadro-textMute hover:text-white",
        ].join(" ")}
        aria-label="Не нравится"
      >
        <ThumbIcon filled={disliked} down />
        {video.dislikes_count ?? 0}
      </button>
    </div>
  );
}

function ThumbIcon({ filled, down }) {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      style={{ transform: down ? "rotate(180deg)" : "none" }}
      aria-hidden
    >
      <path
        d="M7 10v10H4V10h3zm3 0l3.5-7c1.4 0 2.5 1.1 2.5 2.5V8h4.2c1 0 1.8.9 1.6 1.9l-1.4 7c-.2 1-1 1.6-2 1.6H10V10z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PlayerSkeleton() {
  return (
    <div className="aspect-video w-full animate-pulse rounded-xl2 bg-yadro-bgDeep/70" />
  );
}

function EmptyState({ message }) {
  return (
    <div className="grid aspect-video w-full place-items-center rounded-xl2 bg-yadro-bgDeep/80 p-8 text-center text-yadro-textMute">
      <p>{message}</p>
    </div>
  );
}