import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Настройки cookie с токеном.
// httpOnly   — cookie недоступна из JavaScript (защита от XSS-атак).
// secure     — отправляется только по HTTPS (включается в продакшене).
// sameSite   — cookie не отправляется при межсайтовых запросах (защита от CSRF).
// maxAge     — время жизни: 30 дней в миллисекундах.
const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === `production`,
    sameSite: `Strict`,
    maxAge: 30 * 24 * 60 * 60 * 1000
}

// Создаёт JWT с id пользователя внутри payload.
// Токен живёт 30 дней — совпадает с maxAge cookie.
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: `30d`
    });
}

// ─── Регистрация ────────────────────────────────────────────────────
// POST /api/auth/register
// Тело запроса: { name, email, password }
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    // Базовая валидация — все поля обязательны
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Please provide all required fields' })
    }

    // Проверяем, не занят ли email
    const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (userExists.rows.length > 0) {
        return res.status(400).json({ message: 'User already exists' });
    }

    // Хэшируем пароль перед сохранением.
    // Второй аргумент (10) — число раундов соли: чем больше, тем надёжнее, но медленнее.
    const hashedPassword = await bcrypt.hash(password, 10);

    // Сохраняем пользователя и сразу получаем нужные поля через RETURNING
    const newUser = await pool.query(
        'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email',
        [name, email, hashedPassword]
    );

    // Генерируем токен и устанавливаем его в cookie
    const token = generateToken(newUser.rows[0].id);
    res.cookie('token', token, cookieOptions);

    // Возвращаем данные пользователя (без пароля)
    return res.status(201).json({ user: newUser.rows[0] })
})

// ─── Вход ────────────────────────────────────────────────────────────
// POST /api/auth/login
// Тело запроса: { email, password }
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Please provide all required fields' })
    }

    // Ищем пользователя по email
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (user.rows.length === 0) {
        // Намеренно общее сообщение — не раскрываем, что именно неверно
        return res.status(400).json({ message: 'Invalid credentials' });
    }

    const userData = user.rows[0];

    // Сравниваем введённый пароль с хэшем из БД
    const isMatch = await bcrypt.compare(password, userData.password);

    if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(userData.id);
    res.cookie('token', token, cookieOptions);

    // Возвращаем только безопасные поля — пароль не включаем
    res.json({ user: { id: userData.id, name: userData.name, email: userData.email } });

})

// ─── Текущий пользователь ────────────────────────────────────────────
// GET /api/auth/me  (защищённый маршрут)
// protect-middleware верифицирует токен и кладёт пользователя в req.user
router.get('/me', protect, async (req, res) => {
    res.json(req.user);
})

// ─── Выход ────────────────────────────────────────────────────────────
// POST /api/auth/logout
// Перезаписываем cookie пустой строкой с maxAge: 1 мс —
// браузер немедленно помечает её как просроченную и удаляет.
router.post('/logout', (req, res) => {
    res.cookie('token', '', { ...cookieOptions, maxAge: 1 });
    res.json({ message: 'Logged out successfully' });
})

export default router;