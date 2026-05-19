import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";
import { YadroLogo } from "./YadroLogo.jsx";

/** Шапка — слева логотип, справа кнопка регистрации или профиль. */
export function TopBar() {
  const { user, logout } = useAuth();

  return (
    <header className="flex items-center justify-between px-8 py-6">
      <Link to="/" className="text-yadro-text" aria-label="На главную">
        <YadroLogo size={52} />
      </Link>

      {user ? (
        <div className="flex items-center gap-4 text-yadro-textMute">
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
      ) : (
        <Link
          to="/auth"
          className="flex items-center gap-3 text-sm font-semibold text-yadro-text hover:text-yadro-accent"
        >
          Регистрация
          <UserIcon />
        </Link>
      )}
    </header>
  );
}

function UserIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
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
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
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
