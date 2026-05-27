import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";
import { YadroLogo } from "./YadroLogo.jsx";

/** Шапка: логотип, поиск по видео, кнопка загрузки / профиль. */
export function TopBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const submitSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/?q=${encodeURIComponent(q)}` : "/");
  };

  return (
    <header className="flex items-center gap-4 px-6 py-5 md:px-8">
      <Link to="/" aria-label="На главную" className="shrink-0">
        <YadroLogo size={44} />
      </Link>

      {/* Поиск */}
      <form onSubmit={submitSearch} className="mx-auto w-full max-w-md">
        <div className="flex items-center gap-2 rounded-full border border-yadro-border bg-yadro-surface px-4 py-2.5 transition focus-within:border-yadro-primary/60">
          <SearchIcon />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск видео…"
            className="w-full bg-transparent text-sm text-yadro-text placeholder:text-yadro-textMute outline-none"
          />
        </div>
      </form>

      {/* Правая часть */}
      {user ? (
        <div className="flex shrink-0 items-center gap-3">
          <Link
            to="/upload"
            className="flex items-center gap-2 rounded-full bg-yadro-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-yadro-primaryHover"
          >
            <UploadIcon />
            <span className="hidden sm:inline">Загрузить</span>
          </Link>

          <div className="hidden items-center gap-2.5 text-yadro-textMute md:flex">
            <UserIcon />
            <span className="text-sm">{user.first_name || user.email}</span>
          </div>
          <button
            onClick={logout}
            className="rounded-full p-2 text-yadro-textMute transition hover:bg-white/5"
            aria-label="Выйти"
            title="Выйти"
          >
            <LogoutIcon />
          </button>
        </div>
      ) : (
        <Link
          to="/auth"
          className="flex shrink-0 items-center gap-2 rounded-full border border-yadro-border px-4 py-2 text-sm font-semibold text-yadro-text transition hover:border-yadro-primary/60"
        >
          <UserIcon />
          Войти
        </Link>
      )}
    </header>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden>
      <circle cx="9" cy="9" r="6" stroke="#9D9AAE" strokeWidth="1.7" />
      <path
        d="M13.5 13.5L17 17"
        stroke="#9D9AAE"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M8 11V3m0 0L4.5 6.5M8 3l3.5 3.5M3 12.5h10"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 28 28" fill="none" aria-hidden>
      <circle cx="14" cy="14" r="13" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="14" cy="11" r="3.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M6.5 22c1.5-3.2 4.4-4.8 7.5-4.8s6 1.6 7.5 4.8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M14 7V5a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M10 12h11m0 0-3-3m3 3-3 3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}