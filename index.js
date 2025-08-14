const wppconnect = require('wppconnect');
const express = require('express');
const app = express();

const PORT = process.env.PORT || 10000;

app.get('/', (req, res) => {
  res.send('Servidor WPPConnect rodando com Chromium no Render 🚀');
});

app.listen(PORT, () => {
  console.log(`✅ API escutando na porta ${PORT}`);
});

wppconnect.create({
  session: 'sessionName',
  headless: true,
  useChrome: true,
  executablePath: require('puppeteer').executablePath(), // usa o Chromium do puppeteer
  browserArgs: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-accelerated-2d-canvas',
    '--no-first-run',
    '--no-zygote',
    '--disable-gpu'
  ]
}).then((client) => {
  console.log("🤖 WPPConnect iniciado com sucesso!");
}).catch((err) => {
  console.error("❌ Erro ao iniciar WPPConnect:", err);
});
