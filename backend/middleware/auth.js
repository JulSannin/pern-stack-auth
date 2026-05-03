import jwt from "jsonwebtoken"
import pool from "../config/db.js";

// Middleware для защиты маршрутов.
// Подключается к маршруту вторым аргументом: router.get('/me', protect, handler)
// Если проверка проходит — передаёт управление следующему обработчику через next().
export const protect = async (req, res, next) => {
    try {
        // Токен хранится в httpOnly cookie — JS на фронтенде его не видит (защита от XSS)
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({ message: "Not authorized, no token"});
        }

        // Верифицируем токен и достаём payload ({ id, iat, exp })
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Получаем актуальные данные пользователя из БД по id из токена.
        // Пароль намеренно не запрашиваем — он нигде дальше не нужен.
        const user = await pool.query("SELECT id, name, email FROM users WHERE id = $1", [decoded.id]);

        if (user.rows.length === 0) {
            return res.status(401).json({ message: "Not authorized, user not found" })
        }
        
        // Прикрепляем данные пользователя к объекту запроса —
        // следующий обработчик сможет обратиться к ним через req.user
        req.user = user.rows[0];
        next();

    } 
    catch (error) {
        // jwt.verify выбросит ошибку, если токен просрочен или подделан
        console.error(error);
        res.status(401).json({ message: "Not authorized, token failed"})
    }
}