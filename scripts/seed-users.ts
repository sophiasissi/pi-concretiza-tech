// scripts/seed-users.js
require('dotenv').config();
const bcrypt = require('bcryptjs');
const mysql  = require('mysql2/promise');

// 1) Configure a pool igual ao seu Next.js (use variáveis de ambiente)
const pool = mysql.createPool({
  host:     process.env.MYSQL_HOST,
  user:     process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DB,
  waitForConnections: true,
  connectionLimit: 10,
});

// 2) Defina aqui seu array de usuários (ou faça um require de um JSON/CSV)
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
