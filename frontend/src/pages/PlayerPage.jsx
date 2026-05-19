import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { api } from "../api/client.js";
import { ChatPanel } from "../components/ChatPanel.jsx";
import { TopBar } from "../components/TopBar.jsx";
import { VideoPlayer } from "../components/VideoPlayer.jsx";

/**
 * Главная страница: плеер слева, чат справа.
 * Если id видео в URL нет — берём первое из списка.
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

  // URL потокового эндпоинта; токен передаём через query, чтобы <video src=…> работал
  const streamUrl = video
    ? `${import.meta.env.VITE_API_URL || ""}/api/videos/${video.id}/stream/`
    : null;

  return (
    <div className="yadro-bg min-h-screen">
      <TopBar />

      <main className="grid gap-6 px-6 pb-16 lg:grid-cols-[1fr_380px] lg:px-12">
        <section className="min-h-[60vh]">
          {loading && <PlayerSkeleton />}
          {!loading && video && (
            <>
              <VideoPlayer src={streamUrl} poster={video.poster_url} />
              <div className="mt-5">
                <h1 className="text-2xl font-bold text-white">{video.title}</h1>
                {video.description && (
                  <p className="mt-2 text-sm text-yadro-textMute">{video.description}</p>
                )}
                <p className="mt-3 text-xs text-yadro-textMute">
                  {video.views} просмотров · {video.owner_email}
                </p>
              </div>
            </>
          )}
          {!loading && !video && (
            <EmptyState message={error || "Видео ещё не загружены. Добавьте файл через админку или API."} />
          )}
        </section>

        <section className="lg:max-h-[78vh]">
          {video && <ChatPanel videoId={video.id} />}
        </section>
      </main>
    </div>
  );
}

function PlayerSkeleton() {
  return (
    <div className="aspect-video w-full animate-pulse rounded-md bg-yadro-bgDeep/70" />
  );
}

function EmptyState({ message }) {
  return (
    <div className="grid aspect-video w-full place-items-center rounded-md bg-yadro-bgDeep/80 p-8 text-center text-yadro-textMute">
      <p>{message}</p>
    </div>
  );
}
