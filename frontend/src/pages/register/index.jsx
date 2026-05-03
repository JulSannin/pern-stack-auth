import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// setUser — проп из App.jsx для обновления глобального состояния после успешной регистрации
const Register = ({ setUser }) => {

    // Форма управляется через единый объект form.
    // Обновление поля: setForm({ ...form, fieldName: value }) — spread + перезапись.
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
    })

    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault(); // Отменяем стандартную отправку HTML-формы с перезагрузкой
        try {
            const res = await axios.post("/api/auth/register", form);
            // Сервер вернул { user } и установил cookie автоматически
            setUser(res.data.user); // обновляем глобальный state
            navigate("/");         // переходим на главную
        }
        catch (err) {
            setError("Registration failed");
        }
    }

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4">
            <form onSubmit={handleSubmit}
                className="bg-white p-6 rounded shadow-md w-full max-w-lg">
                <h2 className="text-2xl mb-6 font-bold text-center text-gray-800">Register</h2>
                {/* Ошибка отображается только если error не пустая строка */}
                {error && <p className="text-red-500 mb-3">{error}</p>}
                <input type="text" placeholder="name" value={form.name}
                    className="border p-2 w-full mb-3"
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
                <input type="email" placeholder="email" value={form.email}
                    className="border p-2 w-full mb-3"
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
                <input type="password" placeholder="password" value={form.password}
                    className="border p-2 w-full mb-3"
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <button className="bg-blue-500 text-white p-2 w-full">Register</button>
            </form>
        </div>
    )
}

export default Register;