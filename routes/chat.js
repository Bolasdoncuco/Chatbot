const express = require('express');
const router = express.Router();
const { buscarRespuesta } = require('../processors/nlpProcessor.js');
const { ObjectId } = require('mongodb');

// Enviar mensaje y obtener respuesta del bot
router.post('/', async (req, res) => {
  try {
    const db = req.app.locals.db; // Obtener la conexión a la base de datos desde app.locals
    const collection = db.collection('questions'); // Asegúrate que así se llama tu colección
    const baseDatos = await collection.find().toArray(); // Obtener todas las preguntas y respuestas de la colección

    const { mensaje, chatId, usuarioId } = req.body; // Extraer mensaje, chatId y usuarioId del cuerpo de la solicitud

    if (!mensaje) return res.status(400).json({ error: 'Falta mensaje' });// Validar que se envió un mensaje

    // Buscar respuesta pasando baseDatos
    const respuesta = await buscarRespuesta(mensaje, baseDatos);

    // Si no hay chatId, crear uno nuevo
    let chatObjectId = chatId; // Inicializar chatObjectId con chatId
    if (!chatId) {
      const nuevoChat = {
        usuarioId,
        mensajes: [],
        creadoEn: new Date(),
        actualizadoEn: new Date()
      };  // Estructura del nuevo chat
      // Insertar nuevo chat y obtener su ObjectId
      const result = await db.collection('chats').insertOne(nuevoChat); // Inserta el nuevo chat
      chatObjectId = result.insertedId;// Obtiene el ObjectId del nuevo chat
    } else {
      chatObjectId = new ObjectId(chatId); // Asegura que sea ObjectId para Mongo
    }

    // Guardar ambos mensajes en el historial del chat
    await db.collection('chats').updateOne(
      { _id: chatObjectId },
      {
        $push: {
          mensajes: {
            $each: [
              { de: 'usuario', texto: mensaje, hora: new Date() },
              { de: 'bot', texto: respuesta.contenido || respuesta, hora: new Date() }
            ]
          }
        },
        $set: { actualizadoEn: new Date() }
      }//Estructura de como se guarda el mensaje en la base de datos
    );

    res.json({ respuesta, chatId: chatObjectId });
  } catch (error) {
    console.error('Error en /chat:', error);
    res.status(500).json({ error: 'Error al procesar mensaje' }); // Manejo de errores
  }
});



module.exports = router;
