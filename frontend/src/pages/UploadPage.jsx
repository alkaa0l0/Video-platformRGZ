import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { api } from "../api/client.js";
import { Button } from "../components/Button.jsx";
import { Field } from "../components/Field.jsx";
import { TopBar } from "../components/TopBar.jsx";
import { useAuth } from "../context/AuthContext.jsx";

/**
 * Страница загрузки видео. Доступна только авторизованным.
 * Любой вошедший пользователь может загрузить видео без админ-панели.
 */
export function UploadPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [poster, setPoster] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const fileInputRef = useRef(null);
  const posterInputRef = useRef(null);

  // Не залогинен — предлагаем войти
  if (!user) {
    return (
      <div className="yadro-bg min-h-screen">
        <TopBar />
        <main className="grid place-items-center px-4 py-24 text-center">
          <div>
            <h1 className="text-2xl font-bold text-white">Нужен вход</h1>
            <p className="mt-2 text-yadro-textMute">
              Чтобы загружать видео, сначала войдите в аккаунт.
            </p>
            <div className="mt-6">
              <Button onClick={() => navigate("/auth")}>Войти</Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const pickFile = (f) => {
    if (!f) return;
    if (!f.type.startsWith("video/")) {
      setError("Это не видеофайл. Нужен файл формата MP4, WebM и т. п.");
      return;
    }
    setError("");
    setFile(f);
    if (!title) setTitle(f.name.replace(/\.[^.]+$/, ""));
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    pickFile(e.dataTransfer.files?.[0]);
  };

  const formatSize = (bytes) => {
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + " КБ";
    return (bytes / 1024 / 1024).toFixed(1) + " МБ";
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!file) {
      setError("Выберите видеофайл.");
      return;
    }
    if (!title.trim()) {
      setError("Введите название.");
      return;
    }

    const form = new FormData();
    form.append("title", title.trim());
    form.append("description", description.trim());
    form.append("file", file);
    if (poster) form.append("poster", poster);

    setBusy(true);
    setProgress(0);
    try {
      const { data } = await api.post("/api/videos/", form, {
        onUploadProgress: (ev) => {
          if (ev.total) {
            setProgress(Math.round((ev.loaded / ev.total) * 100));
          }
        },
      });
      navigate(`/video/${data.id}`);
    } catch (err) {
      const d = err?.response?.data;
      setError(
        (d && (d.file?.[0] || d.title?.[0] || d.detail)) ||
          "Не удалось загрузить видео. Попробуйте ещё раз."
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="yadro-bg min-h-screen">
      <TopBar />

      <main className="mx-auto max-w-2xl px-4 pb-20">
        <h1 className="text-3xl font-bold text-white">Загрузка видео</h1>
        <p className="mt-1.5 text-sm text-yadro-textMute">
          Видео появится в общей ленте сразу после загрузки.
        </p>

        <form onSubmit={submit} className="mt-8 space-y-6">
          {/* Зона drag-and-drop */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            className={[
              "cursor-pointer rounded-xl2 border-2 border-dashed px-6 py-12 text-center transition",
              dragOver
                ? "border-yadro-primary bg-yadro-primary/10"
                : "border-yadro-border bg-yadro-surface/60 hover:border-yadro-primary/60",
            ].join(" ")}
          >
            {file ? (
              <div>
                <FilmIcon />
                <p className="mt-3 font-semibold text-white">{file.name}</p>
                <p className="text-sm text-yadro-textMute">
                  {formatSize(file.size)} — нажмите, чтобы выбрать другой
                </p>
              </div>
            ) : (
              <div>
                <FilmIcon />
                <p className="mt-3 font-semibold text-white">
                  Перетащите видео сюда
                </p>
                <p className="text-sm text-yadro-textMute">
                  или нажмите, чтобы выбрать файл (MP4 рекомендуется)
                </p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(e) => pickFile(e.target.files?.[0])}
            />
          </div>

          <Field
            label="Название"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Например: Мой первый ролик"
          />

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-yadro-textMute">
              Описание
            </span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Коротко о чём видео (необязательно)"
              className="w-full resize-none rounded-md border border-yadro-border bg-yadro-input/60 px-4 py-3 text-yadro-text placeholder:text-yadro-textMute/70 outline-none transition focus:border-yadro-accent/70 focus:bg-yadro-input/80"
            />
          </label>

          {/* Постер (необязательно) */}
          <div>
            <span className="mb-1.5 block text-sm font-medium text-yadro-textMute">
              Обложка (необязательно)
            </span>
            <button
              type="button"
              onClick={() => posterInputRef.current?.click()}
              className="rounded-md border border-yadro-border bg-yadro-surface px-4 py-2.5 text-sm text-yadro-text transition hover:border-yadro-primary/60"
            >
              {poster ? poster.name : "Выбрать изображение"}
            </button>
            <input
              ref={posterInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setPoster(e.target.files?.[0] || null)}
            />
          </div>

          {/* Прогресс загрузки */}
          {busy && (
            <div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-yadro-surface2">
                <div
                  className="h-full rounded-full bg-yadro-primary transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-1.5 text-center text-sm text-yadro-textMute">
                Загружено {progress}%
              </p>
            </div>
          )}

          {error && (
            <p className="rounded-md bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </p>
          )}

          <Button type="submit" disabled={busy}>
            {busy ? "Загружаем…" : "Опубликовать видео"}
          </Button>
        </form>
      </main>
    </div>
  );
}

function FilmIcon() {
  return (
    <svg
      width="44"
      height="44"
      viewBox="0 0 44 44"
      fill="none"
      className="mx-auto"
      aria-hidden
    >
      <rect
        x="6"
        y="10"
        width="32"
        height="24"
        rx="4"
        stroke="#FF5C39"
        strokeWidth="2"
      />
      <path
        d="M19 18.5L26 22L19 25.5V18.5Z"
        fill="#FF5C39"
      />
      <path
        d="M6 16h32M6 28h32"
        stroke="#FF5C39"
        strokeWidth="1.5"
        opacity="0.4"
      />
    </svg>
  );
}