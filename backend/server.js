import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.js"

// Загружаем переменные окружения из файла .env
dotenv.config();

const app = express();

// Разрешаем запросы только с адреса фронтенда.
// credentials: true — обязательно, чтобы браузер отправлял cookie вместе с запросами.
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
}))

// Парсим тело запроса как JSON (для req.body)
app.use(express.json());

// Парсим входящие cookie (для req.cookies.token)
app.use(cookieParser());

// Все маршруты аутентификации доступны по префиксу /api/auth
app.use("/api/auth", authRoutes)

const PORT = process.env.PORT

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})
