import { Navigate, Route, Routes } from "react-router-dom";

import { useAuth } from "./context/AuthContext.jsx";
import { AuthPage } from "./pages/AuthPage.jsx";
import { HomePage } from "./pages/HomePage.jsx";
import { PlayerPage } from "./pages/PlayerPage.jsx";
import { UploadPage } from "./pages/UploadPage.jsx";

export default function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="yadro-bg grid min-h-screen place-items-center text-yadro-textMute">
        Загрузка…
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/video/:id" element={<PlayerPage />} />
      <Route path="/upload" element={<UploadPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}