import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { api } from "../api/client.js";
import { ChatPanel } from "../components/ChatPanel.jsx";
import { RecommendedVideos } from "../components/RecommendedVideos.jsx";
import { TopBar } from "../components/TopBar.jsx";
import { VideoPlayer } from "../components/VideoPlayer.jsx";

/**
 * Страница просмотра: плеер слева, чат и рекомендованные видео справа.
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
        {/* Левая колонка — плеер */}
        <section className="min-h-[60vh]">
          {loading && <PlayerSkeleton />}
          {!loading && video && (
            <>
              <VideoPlayer src={streamUrl} poster={video.poster_url} />
              <div className="mt-5">
                <h1 className="text-2xl font-bold text-white">{video.title}</h1>
                {video.description && (
                  <p className="mt-2 text-sm text-yadro-textMute">
                    {video.description}
                  </p>
                )}
                <p className="mt-3 text-xs text-yadro-textMute">
                  {video.views} просмотров · {video.owner_email}
                </p>
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

        {/* Правая колонка — чат + рекомендованные */}
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