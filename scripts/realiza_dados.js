// backend/server.js
const express = require('express');
const cors = require('cors');
const db = require('./db'); // conexão com MySQL
const app = express();

app.use(cors());
app.use(express.json());

app.get('/equipamentos/por-estacao', (req, res) => {
  const { estacao } = req.query;

  const query = `
    SELECT MONTH(data_registro) AS mes, COUNT(*) AS quantidade
    FROM equipamentos
    WHERE estacao = ?
    GROUP BY MONTH(data_registro)
    ORDER BY mes;
  `;

  db.query(query, [estacao], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.listen(3001, () => {
  console.log('Servidor rodando na porta 3001');
});
