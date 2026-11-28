const crypto = require('crypto');
const Specialty = require('../models/Specialty');
const User = require('../models/User');
const data = require('./data');

/**
 * Remplit la base sans créer de doublons : on peut relancer le script autant de fois
 * que voulu. Les mots de passe existants ne sont jamais écrasés.
 */
async function seed({ adminEmail, adminPassword, doctorPassword, log = console.log } = {}) {
  const report = { specialties: 0, admin: 'inchangé', doctors: [] };

  for (const s of data.specialties) {
    const res = await Specialty.updateOne({ slug: s.slug }, { $set: s }, { upsert: true });
    if (res.upsertedCount) report.specialties += 1;
  }

  if (adminEmail) {
    const existing = await User.findOne({ email: adminEmail.toLowerCase() });
    if (!existing) {
      if (!adminPassword || adminPassword.length < 8) {
        throw new Error('ADMIN_PASSWORD manquant ou trop court (8 caractères minimum) dans .env');
      }
      await User.create({ firstName: 'Admin', lastName: 'MediTrack', email: adminEmail, password: adminPassword, role: 'admin' });
      report.admin = 'créé';
    }
  }

  const bySlug = Object.fromEntries((await Specialty.find()).map((s) => [s.slug, s._id]));
  for (const d of data.doctors) {
    if (await User.exists({ email: d.email })) continue;
    const password = doctorPassword || crypto.randomBytes(9).toString('base64url');
    await User.create({ ...d, specialty: bySlug[d.specialty], role: 'dentiste', password });
    report.doctors.push({ email: d.email, password: doctorPassword ? '(SEED_DOCTOR_PASSWORD)' : password });
  }

  log(`Spécialités ajoutées : ${report.specialties} (total ${data.specialties.length})`);
  log(`Admin : ${report.admin}`);
  report.doctors.forEach((d) => log(`Dentiste créé : ${d.email} / mot de passe : ${d.password}`));
  return report;
}

module.exports = seed;
