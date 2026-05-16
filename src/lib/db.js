/**
 * 数据库连接池配置
 * 
 * 使用 mysql2/promise 创建 MySQL 连接池。
 * 连接池会复用数据库连接，避免每次请求都创建新连接。
 * 
 * 配置说明：
 * - host: 数据库服务器地址
 * - user: 数据库用户名
 * - password: 数据库密码
 * - database: 使用的数据库名
 * - waitForConnections: 连接池满时是否等待（true = 排队等待）
 * - connectionLimit: 最大连接数（10 个并发连接）
 * - queueLimit: 等待队列最大长度（0 = 无限制）
 * 
 * 使用方式：
 * import pool from '@/lib/db'
 * const [rows] = await pool.query('SELECT * FROM articles')
 */
import mysql from "mysql2/promise";

const pool = mysql.createPool({
  // 只需要把硬编码的值替换为 process.env.XXX
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "ngmxlk_db",
  password: process.env.DB_PASSWORD || "d4r2WZSWGTs6ti5J",
  database: process.env.DB_NAME || "ngmxlk_db",
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool;
