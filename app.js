// Import Express.js y fetch
const express = require('express');
const fetch = require('node-fetch'); // Asegúrate de instalar node-fetch

// Crear app de Express
const app = express();

// Middleware para parsear JSON
app.use(express.json());

// Configuración
const port = process.env.PORT || 3000;
const verifyToken = process.env.VERIFY_TOKEN; // el mismo que pondrás en Meta

// GET para verificar webhook con Meta
app.get('/', (req, res) => {
  const { 'hub.mode': mode, 'hub.challenge': challenge, 'hub.verify_token': token } = req.query;

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('WEBHOOK VERIFIED');
    res.status(200).send(challenge);
  } else {
    res.status(403).end();
  }
});

// POST para recibir mensajes de WhatsApp
app.post('/', async (req, res) => {
  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
  console.log(`\n\nWebhook received ${timestamp}\n`);
  console.log(JSON.stringify(req.body, null, 2));

  // --- Enviar mensaje a n8n ---
  try {
    await fetch('https://santoro.app.n8n.cloud/webhook-test/whatsapp-receive', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: req.body.messages // Asegúrate que sea un array con los mensajes
    })
  });
  });
    console.log('Mensaje enviado a n8n');
  } catch (err) {
    console.error('Error enviando a n8n:', err);
  }

  res.status(200).end();
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`\nListening on port ${port}\n`);
});
