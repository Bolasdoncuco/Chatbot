const express = require('express');
const router = express.Router();

// Crear nuevo chat para usuario
router.post('/', async (req, res) => {
  const { usuarioId } = req.body;
  if (!usuarioId) return res.status(400).json({ error: 'Falta usuarioId' });

  const db = req.app.locals.db;
  try {
    const resultado = await db.collection('chats').insertOne({
      usuarioId,
      mensajes: [],
      creadoEn: new Date(),
      actualizadoEn: new Date(),
    });
    res.status(201).json({ chatId: resultado.insertedId });
  } catch (error) {
    res.status(500).json({ error: 'Error creando chat' });
  }
});

// Obtener todos los chats de un usuario
router.get('/:usuarioId', async (req, res) => {
  const { usuarioId } = req.params;
  const db = req.app.locals.db;
  try {
    const chats = await db.collection('chats').find({ usuarioId }).toArray();
    res.json(chats);
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo chats' });
  }
});

// Agregar mensaje a chat
router.post('/:chatId/mensajes', async (req, res) => {
  const { chatId } = req.params;
  const { de, texto } = req.body;
  if (!de || !texto) return res.status(400).json({ error: 'Faltan datos de mensaje' });

  const db = req.app.locals.db;
  try {
    await db.collection('chats').updateOne(
      { _id: new require('mongodb').ObjectId(chatId) },
      {
        $push: { mensajes: { de, texto, hora: new Date() } },
        $set: { actualizadoEn: new Date() },
      }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error agregando mensaje' });
  }
});

module.exports = router;
