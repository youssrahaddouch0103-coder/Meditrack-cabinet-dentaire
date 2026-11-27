const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 3000,
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/meditrack',
  jwtSecret: process.env.JWT_SECRET || '',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:4200',
  authRateLimit: Number(process.env.AUTH_RATE_LIMIT) || 10,
  twoFactorEnabled: process.env.TWO_FACTOR_ENABLED !== 'false',
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: Number(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.MAIL_FROM || 'MediTrack <no-reply@meditrack.ma>'
  },
  authRateWindowMs: Number(process.env.AUTH_RATE_WINDOW_MS) || 15 * 60 * 1000
};

env.isTest = env.nodeEnv === 'test';

if (env.isTest && !env.jwtSecret) env.jwtSecret = 'test-secret-test-secret-test-secret';

/** JWT_SECRET est obligatoire : pas de valeur par défaut en dehors des tests. */
function assertSecrets() {
  if (!env.jwtSecret || env.jwtSecret.length < 32) {
    throw new Error('JWT_SECRET manquant ou trop court (32 caractères minimum). Générez-en un avec : node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'hex\'))"');
  }
}

module.exports = env;
module.exports.assertSecrets = assertSecrets;
