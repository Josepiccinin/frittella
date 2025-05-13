const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const vendasPath = path.join(__dirname, '../data/vendas.json');
const gastosPath = path.join(__dirname, '../data/gastos.json');

function getVendas() {
  return JSON.parse(fs.readFileSync(vendasPath));
}

function getGastos() {
  if (!fs.existsSync(gastosPath)) fs.writeFileSync(gastosPath, '[]');
  return JSON.parse(fs.readFileSync(gastosPath));
}

// Rota para gerar PDF com resumo final
router.get('/pdf', (req, res) => {
  const vendas = getVendas();
  const gastos = getGastos();

  const resumo = {};
  let totalVendas = 0;
  let totalGastos = 0;

  vendas.forEach(venda => {
    if (venda && typeof venda.dataHora === 'string') {
      const data = venda.dataHora.split(' ')[0];
      if (!resumo[data]) resumo[data] = { vendas: 0, gastos: 0 };
      resumo[data].vendas += venda.total || 0;
      totalVendas += venda.total || 0;
    }
  });

  gastos.forEach(gasto => {
    if (gasto && typeof gasto.dataHora === 'string') {
      const data = gasto.dataHora.split('T')[0];
      if (!resumo[data]) resumo[data] = { vendas: 0, gastos: 0 };
      resumo[data].gastos += gasto.valor || 0;
      totalGastos += gasto.valor || 0;
    }
  });

  const totalLucro = totalVendas - totalGastos;

  // Criar documento PDF
  const doc = new PDFDocument({ margin: 50 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=relatorio.pdf');
  doc.pipe(res);

  // Cabeçalho
  doc
    .fontSize(20)
    .font('Helvetica-Bold')
    .text('Relatório Financeiro - Frittella', { align: 'center' })
    .moveDown(1.5);

  // Títulos da Tabela
  doc
    .fontSize(12)
    .font('Helvetica-Bold')
    .text('Data', 60)
    .text('Vendas (R$)', 160)
    .text('Gastos (R$)', 280)
    .text('Lucro (R$)', 400);

  doc
    .moveTo(50, doc.y + 5)
    .lineTo(550, doc.y + 5)
    .stroke();

  doc.moveDown(0.8);
  doc.font('Helvetica');

  // Dados
  const startX = 60;
let startY = doc.y;

Object.keys(resumo).sort().forEach(data => {
  const v = resumo[data].vendas.toFixed(2);
  const g = resumo[data].gastos.toFixed(2);
  const l = (resumo[data].vendas - resumo[data].gastos).toFixed(2);

  doc.text(data, startX, startY, { width: 80, align: 'left' });
  doc.text(v, startX + 100, startY, { width: 80, align: 'right' });
  doc.text(g, startX + 200, startY, { width: 80, align: 'right' });
  doc.text(l, startX + 300, startY, { width: 80, align: 'right' });

  startY += 20;

  // Quebra de página se passar da margem inferior
  if (startY > 720) {
    doc.addPage();
    startY = 50;
  }
});

  // Resumo Geral
  doc.moveDown(1.5);
  doc
    .font('Helvetica-Bold')
    .fontSize(14)
    .text('Resumo Geral', { underline: true })
    .moveDown(0.5)
    .fontSize(12)
    .text(`Total de Vendas: R$ ${totalVendas.toFixed(2)}`)
    .text(`Total de Gastos: R$ ${totalGastos.toFixed(2)}`)
    .text(`Lucro Líquido:   R$ ${totalLucro.toFixed(2)}`);

  doc.end();
});

// Rota principal para visualização HTML
router.get('/', (req, res) => {
  const vendas = getVendas();
  const gastos = getGastos();

  const resumo = {};

  vendas.forEach(venda => {
    if (venda && typeof venda.dataHora === 'string') {
      const data = venda.dataHora.split(' ')[0];
      if (!resumo[data]) resumo[data] = { vendas: 0, gastos: 0 };
      resumo[data].vendas += venda.total || 0;
    }
  });

  gastos.forEach(gasto => {
    if (gasto && typeof gasto.dataHora === 'string') {
      const data = gasto.dataHora.split('T')[0];
      if (!resumo[data]) resumo[data] = { vendas: 0, gastos: 0 };
      resumo[data].gastos += gasto.valor || 0;
    }
  });

  res.render('relatorio', { resumo });
});

module.exports = router;
