const express = require('express');
const router = express.Router();
const { buscarRespuesta } = require('../processors/nlpProcessor.js');

// Enviar mensaje y obtener respuesta del bot
router.post('/', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { mensaje, chatId, usuarioId } = req.body;

    if (!mensaje) return res.status(400).json({ error: 'Falta mensaje' });

    // Buscar respuesta usando tu función NLP
    const respuesta = await buscarRespuesta(mensaje);

    // Si no hay chatId, crear uno nuevo (chat vacío)
    let chatObjectId = chatId;
    if (!chatId) {
      const nuevoChat = {
        usuarioId,
        mensajes: [],
        creadoEn: new Date(),
        actualizadoEn: new Date()
      };
      const result = await db.collection('chats').insertOne(nuevoChat);
      chatObjectId = result.insertedId;
    }

    // Guardar mensaje usuario y respuesta bot en el chat
    await db.collection('chats').updateOne(
      { _id: chatObjectId },
      {
        $push: {
          mensajes: { de: 'usuario', texto: mensaje, hora: new Date() },
          mensajes: { de: 'bot', texto: respuesta.contenido || respuesta, hora: new Date() },
        },
        $set: { actualizadoEn: new Date() }
      }
    );

    res.json({ respuesta, chatId: chatObjectId });
  } catch (error) {
    res.status(500).json({ error: 'Error al procesar mensaje' });
  }
});

module.exports = router;
