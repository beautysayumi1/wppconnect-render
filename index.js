const express = require('express');
const wppconnect = require('@wppconnect-team/wppconnect');

const app = express();
app.use(express.json());

let client;
let lastQr = null;

// Inicia o WPPConnect
wppconnect
  .create({
    session: 'render-session',
    headless: true,
    disableWelcome: true,
    catchQR: (base64Qr, asciiQR) => {
      lastQr = base64Qr;         // guardamos o QR para exibir em /qr
      console.log(asciiQR);      // também mostra o QR em ASCII no log do Render
    },
    browserArgs: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-extensions',
      '--disable-gpu',
      '--disable-sync'
    ]
  })
  .then((c) => {
    client = c;
    console.log('✅ WPPConnect conectado. Abra /qr para escanear.');
  })
  .catch((e) => console.error('Erro ao iniciar WPPConnect:', e));

// Helper: garante o sufixo correto para números
function toNumberId(to) {
  if (/@(c|g)\.us$/.test(to)) return to;
  return `${String(to).replace(/\D/g, '')}@c.us`;
}

// Rota simples
app.get('/', (_req, res) => res.send('WPPConnect online ✅'));

// Ver o QR num <img> (mais fácil que só no log)
app.get('/qr', (_req, res) => {
  if (!lastQr) return res.status(404).send('QR ainda não gerado. Aguarde o boot.');
  res.setHeader('Content-Type', 'text/html');
  res.end(
    `<html><body style="font-family:sans-serif">
      <h3>Escaneie o QR</h3>
      <img style="width:320px" src="data:image/png;base64,${lastQr}"/>
      <p>WhatsApp ➜ Aparelhos conectados ➜ Conectar aparelho.</p>
    </body></html>`
  );
});

// Enviar para número
app.post('/send', async (req, res) => {
  if (!client) return res.status(503).json({ error: 'Cliente ainda iniciando' });
  const { to, message } = req.body || {};
  if (!to || !message) return res.status(400).json({ error: 'to e message são obrigatórios' });
  try {
    await client.sendText(toNumberId(to), message);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// Enviar para GRUPO (precisa do groupId terminando com @g.us)
app.post('/send-group', async (req, res) => {
  if (!client) return res.status(503).json({ error: 'Cliente ainda iniciando' });
  const { groupId, message } = req.body || {};
  if (!groupId || !message) return res.status(400).json({ error: 'groupId e message são obrigatórios' });
  try {
    await client.sendText(groupId, message);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 API escutando na porta ${PORT}`));
