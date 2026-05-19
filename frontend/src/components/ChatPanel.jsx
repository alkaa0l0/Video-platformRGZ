import { useEffect, useRef, useState } from "react";

import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { Tabs } from "./Tabs.jsx";

/**
 * Чат-панель — повторяет страницы 15 и 17 PDF.
 * Состояния:
 *  - не залогинен → большая CTA-кнопка «Хотите отправить сообщение?» (стр.15)
 *  - залогинен    → инпут «Текст» + кнопка «Отправить» + «Имя в чате» (стр.17)
 */
export function ChatPanel({ videoId }) {
  const { user } = useAuth();
  const [tab, setTab] = useState("chat");
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef(null);

  const load = async () => {
    if (!videoId) return;
    try {
      const { data } = await api.get("/api/chat/", {
        params: { video: videoId, kind: tab },
      });
      setMessages(data.results || data);
    } catch {
      /* без шума, обычный 401 на гостевом просмотре */
    }
  };

  useEffect(() => {
    load();
    // лёгкий long-polling, чтобы не тянуть websockets в стартовый scaffold
    const t = setInterval(load, 4000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId, tab]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages.length]);

  const send = async (e) => {
    e?.preventDefault();
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      await api.post("/api/chat/", {
        video: videoId,
        text: text.trim(),
        kind: tab,
      });
      setText("");
      await load();
    } finally {
      setSending(false);
    }
  };

  const toggleLike = async (id) => {
    try {
      const { data } = await api.post(`/api/chat/${id}/like/`);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === id
            ? { ...m, liked_by_me: data.liked, likes_count: data.likes_count }
            : m
        )
      );
    } catch {
      /* игнор */
    }
  };

  return (
    <aside className="flex h-full flex-col rounded-md bg-yadro-bgDeep/90 px-5 pt-5">
      <Tabs
        value={tab}
        onChange={setTab}
        items={[
          { value: "chat", label: "Чат" },
          { value: "question", label: "Вопрос / ответ" },
        ]}
      />

      <div
        ref={listRef}
        className="dark-scroll mt-4 flex-1 space-y-2 overflow-y-auto pr-1"
      >
        {messages.length === 0 && (
          <div className="py-10 text-center text-sm text-yadro-textMute">
            Сообщений пока нет
          </div>
        )}
        {messages.map((m) => (
          <MessageCard key={m.id} message={m} onLike={() => toggleLike(m.id)} />
        ))}
      </div>

      {/* Низ панели: для гостя — CTA, для авторизованного — форма */}
      {user ? (
        <form onSubmit={send} className="mt-3 pb-4">
          <div className="relative">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Текст"
              className="w-full rounded-md border border-yadro-border bg-yadro-msg px-4 py-3 text-sm text-white placeholder:text-yadro-textMute outline-none focus:border-yadro-accent/70"
            />
            <PaperclipIcon className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-yadro-textMute" />
          </div>
          <button
            type="submit"
            disabled={sending || !text.trim()}
            className="mt-3 w-full rounded-md bg-yadro-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-yadro-primaryHover disabled:opacity-50"
          >
            Отправить
          </button>
          <div className="mt-3 flex items-center justify-between text-xs text-yadro-textMute">
            <span>
              Имя в чате:{" "}
              <span className="text-white">{user.chat_name || user.first_name || "—"}</span>
            </span>
            <button type="button" className="hover:text-white">
              Ред.
            </button>
          </div>
        </form>
      ) : (
        <div className="mt-3 pb-4">
          <a
            href="/auth"
            className="block rounded-md bg-yadro-primary px-4 py-4 text-center text-sm font-semibold leading-snug text-white transition hover:bg-yadro-primaryHover"
          >
            Хотите отправить сообщение?
            <br />
            <span className="font-normal opacity-90">Кликните на эту кнопку</span>
          </a>
        </div>
      )}
    </aside>
  );
}

function MessageCard({ message, onLike }) {
  return (
    <div className="flex items-start justify-between rounded-md bg-yadro-msg/80 px-4 py-3">
      <div className="min-w-0 pr-3">
        <div className="text-sm font-semibold text-white">
          {message.author_name}
        </div>
        <div className="truncate text-sm text-yadro-textMute">
          {message.text}
        </div>
      </div>
      <button
        type="button"
        onClick={onLike}
        className={[
          "flex shrink-0 items-center gap-1.5 text-sm transition",
          message.liked_by_me ? "text-red-400" : "text-yadro-textMute hover:text-white",
        ].join(" ")}
        aria-label="Лайк"
      >
        <HeartIcon filled={message.liked_by_me} />
        <span className="tabular-nums">{message.likes_count ?? 0}</span>
      </button>
    </div>
  );
}

function HeartIcon({ filled }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill={filled ? "currentColor" : "none"}>
      <path
        d="M8 13.5s-5-3-5-7a3 3 0 0 1 5-2.2A3 3 0 0 1 13 6.5c0 4-5 7-5 7Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PaperclipIcon({ className = "" }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={className}>
      <circle cx="8" cy="8" r="5" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="8" cy="8" r="1.5" fill="currentColor" />
    </svg>
  );
}
