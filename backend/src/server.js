const env = require('./config/env');
const app = require('./app');
const { connectDB } = require('./config/db');

connectDB(env.mongoUri)
  .then(() => {
    app.listen(env.port, () => console.log(`API MediTrack sur http://localhost:${env.port}`));
  })
  .catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
