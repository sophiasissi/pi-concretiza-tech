// backend/db.js
const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',        // ajuste para seu usuário
  password: '',        // ajuste para sua senha
  database: 'login_db' // crie esse banco antes
});

connection.connect(err => {
  if (err) throw err;
  console.log('Conectado ao banco de dados MySQL!');
});

module.exports = connection;
