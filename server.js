require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 4000;

// Importa rutas
const chatbotRoutes = require('./routes/chat');
const chatsRoutes = require('./routes/chats');

app.use(cors());
app.use(express.json());

const client = new MongoClient(process.env.MONGO_URI);

async function main() {
  try {
    await client.connect();
    console.log('✅ Conectado a MongoDB');

    const db = client.db('chatbot');
    app.locals.db = db;

    // Define rutas
    app.use('/api/chat', chatbotRoutes);   // Preguntar al bot
    app.use('/api/chats', chatsRoutes);    // Historial de chats

    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error);
  }
}

main();
