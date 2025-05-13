
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const moment = require('moment');

const produtosPath = path.join(__dirname, '../data/produtos.json');
const vendasPath = path.join(__dirname, '../data/vendas.json');

function getProdutos() {
  return JSON.parse(fs.readFileSync(produtosPath));
}

function getVendas() {
  return JSON.parse(fs.readFileSync(vendasPath));
}

function saveVendas(vendas) {
  fs.writeFileSync(vendasPath, JSON.stringify(vendas, null, 2));
}

function saveProdutos(produtos) {
  fs.writeFileSync(produtosPath, JSON.stringify(produtos, null, 2));
}

router.get('/', (req, res) => {
  const produtos = getProdutos();
  const vendas = getVendas(); // se quiser exibir histórico no EJS
  res.render('vendas', { produtos, vendas }); // incluir vendas se quiser exibir
});

router.post('/add', (req, res) => {
  const vendas = getVendas();
  const produtos = getProdutos();
  const { produto, quantidade, dataHora } = req.body;

  // Usa dataHora do formulário, ou pega o horário atual
  let dataFormatada;
  if (!dataHora) {
    dataFormatada = moment().format('YYYY-MM-DD HH:mm:ss');
  } else {
    dataFormatada = moment(dataHora).format('YYYY-MM-DD HH:mm:ss');
  }

  let itens = [];
  let total = 0;

  for (let i = 0; i < produto.length; i++) {
    const nome = produto[i];
    const qtd = parseInt(quantidade[i]);
    const p = produtos.find(prod => prod.nome === nome);

    if (p && p.estoque >= qtd) {
      p.estoque -= qtd;
      const valor = p.preco * qtd;
      total += valor;
      itens.push({ produto: nome, quantidade: qtd, valor });
    }
  }

  if (itens.length > 0) {
    vendas.push({ dataHora: dataFormatada, itens, total });
    saveProdutos(produtos);
    saveVendas(vendas);
  }

  res.redirect('/vendas');
});

module.exports = router;
