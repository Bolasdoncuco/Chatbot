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

router.delete('/usuario/:usuarioId', async (req, res) => {
  try {
    const db = req.app.locals.db; // Obtener la conexión a la base de datos desde app.locals
    const usuarioId = req.params.usuarioId; // Obtener usuarioId de los parámetros de la solicitud

    console.log('Borrando historial de:', usuarioId);

    const resultado = await db.collection('chats').deleteMany({ usuarioId }); // Eliminar todos los chats del usuario

    console.log('Eliminados:', resultado.deletedCount);

    res.json({ mensaje: 'Historial eliminado con éxito' }); // Respuesta exitosa
  } catch (error) {
    console.error('Error al borrar historial:', error);
    res.status(500).json({ error: 'Error al borrar historial' });
  }
});

// Obtener todos los chats de un usuario
router.get('/:usuarioId', async (req, res) => {
  const { usuarioId } = req.params; // Obtener usuarioId de los parámetros de la solicitud
  const db = req.app.locals.db; // Obtener la conexión a la base de datos desde app.locals
  try {
    const chats = await db.collection('chats').find({ usuarioId }).toArray(); // Buscar todos los chats del usuario
    res.json(chats); // Enviar los chats encontrados como respuesta
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo chats' }); // Manejo de errores
  }
});

// Agregar mensaje a chat
router.post('/:chatId/mensajes', async (req, res) => {
  const { chatId } = req.params; // Obtener chatId de los parámetros de la solicitud
  const { de, texto } = req.body; // Extraer 'de' y 'texto' del cuerpo de la solicitud
  if (!de || !texto) return res.status(400).json({ error: 'Faltan datos de mensaje' }); // Validar que se envíen ambos campos

  const db = req.app.locals.db; // Obtener la conexión a la base de datos desde app.locals
  try {
    await db.collection('chats').updateOne(
      { _id: new require('mongodb').ObjectId(chatId) }, // Asegurar que chatId sea un ObjectId
      {
        $push: { mensajes: { de, texto, hora: new Date() } }, // Agregar mensaje al array de mensajes
        $set: { actualizadoEn: new Date() },  // Actualizar la fecha de actualización del chat
      }
    );
    res.json({ success: true }); // Respuesta exitosa
  } catch (error) {
    res.status(500).json({ error: 'Error agregando mensaje' }); // Manejo de errores
  }
});

module.exports = router;
