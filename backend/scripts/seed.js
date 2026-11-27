const env = require('../src/config/env');
const { connectDB, disconnectDB } = require('../src/config/db');
const seed = require('../src/seed/seed');

(async () => {
  try {
    await connectDB(env.mongoUri);
    await seed({
      adminEmail: process.env.ADMIN_EMAIL,
      adminPassword: process.env.ADMIN_PASSWORD,
      doctorPassword: process.env.SEED_DOCTOR_PASSWORD
    });
  } catch (err) {
    console.error(err.message);
    process.exitCode = 1;
  } finally {
    await disconnectDB();
  }
})();
