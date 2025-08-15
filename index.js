const express = require('express');
const wppconnect = require('@wppconnect-team/wppconnect');
const puppeteer = require('puppeteer');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Inicializa WPPConnect com Chromium do Puppeteer
wppconnect.create({
  headless: true,
  browserArgs: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-accelerated-2d-canvas',
    '--no-first-run',
    '--no-zygote',
    '--disable-gpu'
  ],
  executablePath: process.env.CHROME_PATH || puppeteer.executablePath()
}).then(client => start(client))
  .catch(err => console.error('Erro ao iniciar WPPConnect', err));

// Função exemplo para enviar mensagem
function start(client) {
  app.post('/send', async (req, res) => {
    const { number, message } = req.body;
    try {
      await client.sendText(number, message);
      res.json({ status: 'Mensagem enviada com sucesso!' });
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      res.status(500).json({ error: 'Falha ao enviar mensagem' });
    }
  });
}

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
