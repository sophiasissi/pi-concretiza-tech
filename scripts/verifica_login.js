// npm install express cors mysql2 bcrypt
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const usuario = {
  username: 'admin',
  password: '123456'
};

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (username === usuario.username && password === usuario.password) {
    res.json({ success: true, message: 'Login bem-sucedido!' });
  } else {
    res.status(401).json({ success: false, message: 'Credenciais inválidas' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
