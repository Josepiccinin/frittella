
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const produtoRoutes = require('./routes/produtoRoutes');
const vendaRoutes = require('./routes/vendaRoutes');
const relatorioRoutes = require('./routes/relatorioRoutes');

const gastoRoutes = require('./routes/gastoRoutes');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use('/produtos', produtoRoutes);
app.use('/vendas', vendaRoutes);
app.use('/relatorio', relatorioRoutes);
app.use('/gastos', gastoRoutes);


app.get('/', (req, res) => {
  res.render('index');
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
