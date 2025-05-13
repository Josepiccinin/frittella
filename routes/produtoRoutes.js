const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const produtosPath = path.join(__dirname, '../data/produtos.json');

function getProdutos() {
    if (!fs.existsSync(produtosPath)) fs.writeFileSync(produtosPath, '[]');
    return JSON.parse(fs.readFileSync(produtosPath));
}

function saveProdutos(produtos) {
    fs.writeFileSync(produtosPath, JSON.stringify(produtos, null, 2));
}

router.get('/', (req, res) => {
    const produtos = getProdutos();
    res.render('produtos', { produtos });
});

router.post('/add', (req, res) => {
    const { nome, preco, estoque } = req.body;
    const novoProduto = {
        nome,
        preco: parseFloat(preco),
        estoque: parseInt(estoque)
    };

    const produtos = getProdutos();
    produtos.push(novoProduto);
    saveProdutos(produtos);

    res.redirect('/produtos');
});

router.post('/atualizar', (req, res) => {
    const { nome, novoEstoque } = req.body;

    const produtos = getProdutos();
    const produto = produtos.find(p => p.nome === nome);
    if (produto) {
        produto.estoque = parseInt(novoEstoque);
        saveProdutos(produtos);
    }

    res.redirect('/produtos');
});

module.exports = router;

