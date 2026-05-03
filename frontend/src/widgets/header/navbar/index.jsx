import React from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

// user    — данные текущего пользователя или null
// setUser — функция для сброса состояния после логаута
const Navbar = ({ user, setUser }) => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        // Сервер перезапишет cookie пустой строкой с мгновенным истечением
        await axios.post("/api/auth/logout");
        setUser(null); // сбрасываем пользователя в глобальном state
        navigate("/"); // переходим на главную
    };

    return (
        <nav className="bg-gray-800 text-white">
            <div className="max-w-6xl mx-auto p-4 flex justify-between items-center">
                <div className="flex items-center">
                    <Link to="/" className="font-bold mr-4">PERN Auth</Link>
                    {/* Отображаем имя пользователя, если авторизован */}
                    {user ? (<p>{user.name}</p>) : (null)}
                </div>
                <div>
                    {/* Авторизованным — кнопка выхода, гостям — ссылки Login/Register */}
                    {user ? (
                        <button
                            onClick={handleLogout}
                            className="bg-red-500 px-3 py-1 rounded">
                            Logout
                        </button>
                    ) : (
                        <>
                            <Link to="/login" className="mx-2">Login</Link>
                            <Link to="/register" className="mx-2">Register</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    )
}

export default Navbar;