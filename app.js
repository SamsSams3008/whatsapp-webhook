const express = require('express');
const fetch = require('node-fetch');

const app = express();
app.use(express.json());

const port = process.env.PORT || 3000;

// GET para verificar webhook con Meta
app.get('/', (req, res) => {
  const { 'hub.mode': mode, 'hub.challenge': challenge, 'hub.verify_token': token } = req.query;

  if (mode === 'subscribe' && token === process.env.VERIFY_TOKEN) {
    console.log('WEBHOOK VERIFIED');
    res.status(200).send(challenge);
  } else {
    console.log('Webhook no verificado');
    res.status(403).end();
  }
});

// POST para enviar mensaje de prueba a n8n
app.post('/', async (req, res) => {
  console.log("Webhook llamado. Enviando mensaje de prueba a n8n...");

  const n8nWebhookURL = 'https://santoro.app.n8n.cloud/webhook-test/whatsapp-receive';

  const body = {
    messages: [
      {
        from: "test-user",
        text: { body: "mensaje de prueba" }
      }
    ]
  };

  try {
    const response = await fetch(n8nWebhookURL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    console.log('✅ Mensaje de prueba enviado a n8n. Status:', response.status);
  } catch (err) {
    console.error('❌ Error enviando mensaje de prueba a n8n:', err);
  }

  res.status(200).send("Mensaje de prueba procesado.");
});

app.listen(port, () => {
  console.log(`Servidor escuchando en puerto ${port}`);
});
