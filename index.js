import express from 'express';
import mongoose from 'mongoose';
import link from './data.js';

const app = express();
app.use(express.json());

const users = [];

app.get('/users', (req, res) => {
  res.status(200).json(users);
});


app.post('/users', (req, res) => {
  const { name, age, nickName } = req.body;

  users.push({ name, age, nickName });

  res.status(201).json({ ok: true });
});


mongoose.connect(link)
  .then(() => console.log('Conectado ao banco de dados!'))
  .catch(() => console.log('Erro ao conectar ao banco de dados!'));

app.listen(3000)
