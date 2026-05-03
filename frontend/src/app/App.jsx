import axios from "axios";
import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "../widgets/header/navbar/index";
import Home from "../pages/home/index";
import Login from "../pages/login/index";
import Register from "../pages/register/index";
import NotFound from "../shared/NotFound";

// Глобальная настройка axios: cookie будет автоматически отправляться
// с каждым запросом. Без этого JWT-токен не будет передаваться серверу.
axios.defaults.withCredentials = true;

function App() {

  // user — глобальное состояние текущего пользователя. Передаётся вниз всем компонентам.
  // setUser — функция для обновления user изнутри Navbar, Login, Register.
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  // loading: true, пока проверяем сессию при первой загрузке
  const [loading, setLoading] = useState(true);

  // При монтировании проверяем, авторизован ли пользователь.
  // Cookie автоматически подхватывается браузером — сервер верифицирует токен и возвращает данные.
  // [] — запускается один раз после первого рендера.
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("/api/auth/me");
        setUser(res.data);
      }
      catch {
        // Если запрос вернул 401 — пользователь не авторизован, оставляем user = null
        setUser(null);
      }
      finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [])

  // Пока идёт проверка — не рендерим роуты, чтобы избежать мерцания на /login
  if (loading) {
    return <div className="bg-gray-800 min-h-screen">Loading...</div>
  }

  return (
    <Router>
      <Navbar user={user} setUser={setUser} />
      <Routes>
        <Route path="/" element={<Home user={user} error={error} />} />
        {/* Авторизованный пользователь не может попасть на /login и /register — редирект на главную */}
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login setUser={setUser} />} />
        <Route path="/register" element={user ? <Navigate to="/" /> : <Register setUser={setUser} />} />
        {/* Любой неизвестный маршрут — страница 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;