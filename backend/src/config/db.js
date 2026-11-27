const mongoose = require('mongoose');

mongoose.set('strictQuery', true);

async function connectDB(uri) {
  if (!uri) throw new Error('MONGO_URI manquant dans .env');
  await mongoose.connect(uri);
  console.log(`MongoDB connecté (${mongoose.connection.name})`);
}

async function disconnectDB() {
  await mongoose.disconnect();
}

module.exports = { connectDB, disconnectDB };
