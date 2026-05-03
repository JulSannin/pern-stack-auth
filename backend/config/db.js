import {Pool} from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Pool — пул соединений с PostgreSQL.
// Вместо открытия нового соединения при каждом запросе,
// пул переиспользует уже открытые — это быстрее и экономит ресурсы.
const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
})

// Событие успешного подключения к БД
pool.on("connect", () => {
    console.log("Connected to the database");
})

// Событие ошибки на уровне пула (например, обрыв соединения)
pool.on("error", (err) => {
    console.error("Database error", err);
})

// Экспортируем пул — он используется во всех файлах, которым нужна БД
export default pool;