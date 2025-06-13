require('dotenv').config();
const bcrypt = require('bcryptjs');
const mysql  = require('mysql2/promise');

const pool = mysql.createPool({
  host:     process.env.MYSQL_HOST,
  user:     process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DB,
  waitForConnections: true,
  connectionLimit: 10,
});

// const users = [
//   { nome_completo: 'Administrador', usuario: 'admin',   senha: 'admin123', administrador: 1 },

// ];

async function run() {
  const conn = await pool.getConnection();
  try {
    for (const u of users) {
      const hash = await bcrypt.hash(u.senha, 10);
      await conn.execute(
        `INSERT INTO usuarios (nome_completo, usuario, senha, administrador)
         VALUES (?, ?, ?, ?)`,
        [u.nome_completo, u.usuario, hash, u.administrador]
      );
      console.log(`Inserido ${u.usuario}`);
    }
    console.log('Seed completo!');
  } catch (err) {
    console.error('Erro na seed:', err);
  } finally {
    conn.release();
    process.exit(0);
  }
}

run();
