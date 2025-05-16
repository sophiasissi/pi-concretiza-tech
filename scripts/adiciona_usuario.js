// npm install express cors mysql2 bcrypt
// backend/server.js
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const db = require('./db');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Rota para adicionar novo usuário
app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  
  if (!username || !password) {
    return res.status(400).json({ message: 'Usuário e senha são obrigatórios' });
  }

  try {
    // Verifica se usuário já existe
    db.query('SELECT * FROM usuarios WHERE username = ?', [username], async (err, results) => {
      if (results.length > 0) {
        return res.status(409).json({ message: 'Usuário já existe' });
      }

      
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insere novo usuário
      db.query(
        'INSERT INTO usuarios (username, password) VALUES (?, ?)',
        [username, hashedPassword],
        (err, result) => {
          if (err) throw err;
          res.status(201).json({ message: 'Usuário registrado com sucesso' });
        }
      );
    });
  } catch (err) {
    res.status(500).json({ message: 'Erro interno no servidor' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
