const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const gastosPath = path.join(__dirname, '../data/gastos.json');

function getGastos() {
  if (!fs.existsSync(gastosPath)) fs.writeFileSync(gastosPath, '[]');
  return JSON.parse(fs.readFileSync(gastosPath));
}

function saveGastos(gastos) {
  fs.writeFileSync(gastosPath, JSON.stringify(gastos, null, 2));
}

router.get('/', (req, res) => {
  const gastos = getGastos();
  res.render('gastos', { gastos });
});

router.post('/add', (req, res) => {
  const { descricao, valor, dataHora } = req.body;
  const gastos = getGastos();

  gastos.push({
    descricao,
    valor: parseFloat(valor),
    dataHora
  });

  saveGastos(gastos);
  res.redirect('/gastos');
});

module.exports = router;
