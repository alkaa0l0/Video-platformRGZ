import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";
import { YadroLogo } from "./YadroLogo.jsx";

/** Шапка: логотип слева, кнопка загрузки + профиль / регистрация справа. */
export function TopBar() {
  const { user, logout } = useAuth();

  return (
    <header className="flex items-center justify-between px-8 py-6">
      <Link to="/" aria-label="На главную">
        <YadroLogo size={44} />
      </Link>

      {user ? (
        <div className="flex items-center gap-3">
          <Link
            to="/upload"
            className="flex items-center gap-2 rounded-lg bg-yadro-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-yadro-primaryHover"
          >
            <UploadIcon />
            Загрузить
          </Link>

          <div className="flex items-center gap-3 text-yadro-textMute">
            <span className="text-sm">{user.first_name || user.email}</span>
            <UserIcon />
            <button
              onClick={logout}
              className="rounded-md p-2 transition hover:bg-white/5"
              aria-label="Выйти"
              title="Выйти"
            >
              <LogoutIcon />
            </button>
          </div>
        </div>
      ) : (
        <Link
          to="/auth"
          className="flex items-center gap-3 text-sm font-semibold text-yadro-text hover:text-yadro-accent"
        >
          Войти
          <UserIcon />
        </Link>
      )}
    </header>
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
    <svg width="26" height="26" viewBox="0 0 28 28" fill="none" aria-hidden>
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