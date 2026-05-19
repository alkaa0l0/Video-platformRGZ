import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { api } from "../api/client.js";
import { Button } from "../components/Button.jsx";
import { Field } from "../components/Field.jsx";
import { Tabs } from "../components/Tabs.jsx";
import { TopBar } from "../components/TopBar.jsx";
import { useAuth } from "../context/AuthContext.jsx";

/**
 * Страница «Регистрация» + вкладка «Код доступа».
 * Соответствует страницам 14 и 16 PDF.
 */
export function AuthPage() {
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") === "code" ? "code" : "register";
  const setTab = (v) => setParams({ tab: v });

  return (
    <div className="yadro-bg min-h-screen">
      <TopBar />

      <main className="flex flex-col items-center px-4 pb-16">
        <div className="w-full max-w-[460px]">
          <Tabs
            value={tab}
            onChange={setTab}
            items={[
              { value: "register", label: "Регистрация" },
              { value: "code", label: "Код доступа" },
            ]}
          />

          <div className="mt-6 rounded-xl bg-yadro-surface/85 p-7 shadow-card backdrop-blur-sm hairline">
            {tab === "register" ? <RegisterForm /> : <AccessCodeForm />}
          </div>
        </div>
      </main>
    </div>
  );
}

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
          Object.entries(data).map(([k, v]) => [k, Array.isArray(v) ? v[0] : String(v)])
        )
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <SectionTitle>Данные для авторизации</SectionTitle>
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

      <SectionTitle>Прочие данные</SectionTitle>
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
        {busy ? "Отправляем…" : "Отправить"}
      </Button>

      <p className="text-xs text-yadro-textMute">* поле, обязательное для заполнения</p>
    </form>
  );
}

function AccessCodeForm() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [info, setInfo] = useState("");
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    if (!email) {
      setError("Поле обязательно для заполнения");
      return;
    }
    setBusy(true);
    try {
      const { data } = await api.post("/api/auth/access-code/", { email });
      let text = data.detail || "Код отправлен.";
      if (data.debug_code) text += ` Тестовый код: ${data.debug_code}`;
      setInfo(text);
    } catch (err) {
      setError(err?.response?.data?.email?.[0] || "Не удалось отправить код");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <SectionTitle>Укажите электронную почту для восстановления кода</SectionTitle>
      <Field
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="mail@mail.com"
        error={error}
      />
      <Button type="submit" disabled={busy}>
        {busy ? "Отправляем…" : "Отправить код"}
      </Button>
      {info && <p className="text-xs text-yadro-accent">{info}</p>}
    </form>
  );
}

function SectionTitle({ children }) {
  return <h3 className="text-base font-bold tracking-wide text-white">{children}</h3>;
}
