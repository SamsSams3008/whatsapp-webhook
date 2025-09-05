// Import Express.js y fetch
const express = require('express');
const fetch = require('node-fetch'); // Asegúrate de haber hecho npm install node-fetch

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
    console.log('Webhook no verificado');
    res.status(403).end();
  }
});

// POST para recibir mensajes de WhatsApp
app.post('/', async (req, res) => {
  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
  console.log(`\n\nWebhook received ${timestamp}\n`);
  console.log("JSON recibido de WhatsApp:", JSON.stringify(req.body, null, 2));

  // --- Extraer mensajes correctamente ---
  let messages = [];
  try {
    messages = req.body.entry[0].changes[0].value.messages || [];
  } catch (err) {
    console.warn('No se encontraron mensajes en el body:', err);
  }

  // Importar fetch (si usas Node.js >= 18, fetch ya viene, si no instala node-fetch)
const fetch = require('node-fetch'); // si Node <18

// URL de tu Webhook en n8n
const n8nWebhookURL = 'https://santoro.app.n8n.cloud/webhook-test/whatsapp-receive';

// Crear el body del mensaje
const body = {
  messages: [
    {
      from: "test-user",
      text: { body: "mensaje de prueba" }
    }
  ]
};

// Hacer POST a n8n
fetch(n8nWebhookURL, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body)
})
.then(res => {
  console.log('Status code:', res.status);
  return res.text();
})
.then(data => console.log('Respuesta de n8n:', data))
.catch(err => console.error('Error enviando a n8n:', err));

  res.status(200).end();
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`\nListening on port ${port}\n`);
});
