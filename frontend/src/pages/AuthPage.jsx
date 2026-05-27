import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { api } from "../api/client.js";
import { Button } from "../components/Button.jsx";
import { Field } from "../components/Field.jsx";
import { Tabs } from "../components/Tabs.jsx";
import { TopBar } from "../components/TopBar.jsx";
import { useAuth } from "../context/AuthContext.jsx";

/**
 * Страница авторизации: вкладки «Вход» и «Регистрация».
 * Отдельный режим «recover» — восстановление кода доступа.
 * После входа/регистрации пользователь остаётся залогинен:
 * токены сохраняются в браузере (см. AuthContext + client.js).
 */
export function AuthPage() {
  // mode: 'login' | 'register' | 'recover'
  const [mode, setMode] = useState("login");

  return (
    <div className="yadro-bg min-h-screen">
      <TopBar />

      <main className="flex flex-col items-center px-4 pb-20">
        <div className="w-full max-w-[420px]">
          {mode !== "recover" && (
            <Tabs
              value={mode}
              onChange={setMode}
              items={[
                { value: "login", label: "Вход" },
                { value: "register", label: "Регистрация" },
              ]}
            />
          )}

          <div className="mt-6 rounded-xl2 bg-yadro-surface/85 p-7 shadow-card hairline">
            {mode === "login" && (
              <LoginForm onRecover={() => setMode("recover")} />
            )}
            {mode === "register" && <RegisterForm />}
            {mode === "recover" && (
              <RecoverForm onBack={() => setMode("login")} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

/* Достаёт читаемый текст ошибки из ответа DRF */
function readError(err, fallback) {
  const d = err?.response?.data;
  if (!d) return fallback;
  if (typeof d === "string") return d;
  return (
    d.detail ||
    d.non_field_errors?.[0] ||
    d.email?.[0] ||
    d.password?.[0] ||
    fallback
  );
}

/* ---------- ВХОД ---------- */
function LoginForm({ onRecover }) {
  const { login } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const onChange = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(form.email, form.password);
      nav("/");
    } catch (err) {
      setError(readError(err, "Неверный email или пароль."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-white">С возвращением</h2>
        <p className="mt-1 text-sm text-yadro-textMute">
          Войдите, чтобы загружать видео и писать в чат.
        </p>
      </div>

      <Field
        label="Электронная почта"
        type="email"
        autoComplete="email"
        value={form.email}
        onChange={onChange("email")}
        placeholder="my_email@mail.com"
      />
      <Field
        label="Пароль"
        type="password"
        autoComplete="current-password"
        value={form.password}
        onChange={onChange("password")}
        placeholder="Ваш пароль"
      />

      {error && (
        <p className="rounded-md bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </p>
      )}

      <Button type="submit" disabled={busy}>
        {busy ? "Входим…" : "Войти"}
      </Button>

      <button
        type="button"
        onClick={onRecover}
        className="block w-full text-center text-xs text-yadro-textMute hover:text-yadro-accent"
      >
        Не помню код доступа
      </button>
    </form>
  );
}

/* ---------- РЕГИСТРАЦИЯ ---------- */
function RegisterForm() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({
    email: "",
    last_name: "",
    first_name: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  const onChange = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setErrors({});
    setBusy(true);
    try {
      await register(form);
      nav("/");
    } catch (err) {
      const data = err?.response?.data || {};
      setErrors(
        Object.fromEntries(
          Object.entries(data).map(([k, v]) => [
            k,
            Array.isArray(v) ? v[0] : String(v),
          ])
        )
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-white">Создать аккаунт</h2>
        <p className="mt-1 text-sm text-yadro-textMute">
          Это займёт меньше минуты.
        </p>
      </div>

      <Field
        label="Электронная почта"
        type="email"
        required
        autoComplete="email"
        value={form.email}
        onChange={onChange("email")}
        placeholder="my_email@mail.com"
        error={errors.email}
      />
      <Field
        label="Пароль"
        type="password"
        required
        autoComplete="new-password"
        value={form.password}
        onChange={onChange("password")}
        placeholder="Минимум 6 символов"
        error={errors.password}
      />
      <Field
        label="Фамилия"
        required
        value={form.last_name}
        onChange={onChange("last_name")}
        placeholder="Ваша фамилия"
        error={errors.last_name}
      />
      <Field
        label="Имя"
        required
        value={form.first_name}
        onChange={onChange("first_name")}
        placeholder="Ваше имя"
        error={errors.first_name}
      />

      <Button type="submit" disabled={busy}>
        {busy ? "Создаём…" : "Зарегистрироваться"}
      </Button>

      <p className="text-xs text-yadro-textMute">
        * все поля обязательны для заполнения
      </p>
    </form>
  );
}

/* ---------- ВОССТАНОВЛЕНИЕ ---------- */
function RecoverForm({ onBack }) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [info, setInfo] = useState("");
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    if (!email) {
      setError("Введите электронную почту.");
      return;
    }
    setBusy(true);
    try {
      const { data } = await api.post("/api/auth/access-code/", { email });
      let text = data.detail || "Код отправлен.";
      if (data.debug_code) text += ` Тестовый код: ${data.debug_code}`;
      setInfo(text);
    } catch (err) {
      setError(readError(err, "Не удалось отправить код."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-white">Восстановление доступа</h2>
        <p className="mt-1 text-sm text-yadro-textMute">
          Укажите почту — отправим код для восстановления.
        </p>
      </div>

      <Field
        label="Электронная почта"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="my_email@mail.com"
      />

      {error && (
        <p className="rounded-md bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </p>
      )}
      {info && (
        <p className="rounded-md bg-yadro-primary/10 px-4 py-3 text-sm text-yadro-accent2">
          {info}
        </p>
      )}

      <Button type="submit" disabled={busy}>
        {busy ? "Отправляем…" : "Отправить код"}
      </Button>

      <button
        type="button"
        onClick={onBack}
        className="block w-full text-center text-xs text-yadro-textMute hover:text-yadro-accent"
      >
        ← Вернуться ко входу
      </button>
    </form>
  );
}