const seed = require('../src/seed/seed');
const Specialty = require('../src/models/Specialty');
const User = require('../src/models/User');
const data = require('../src/seed/data');

const opts = { adminEmail: 'admin@meditrack.ma', adminPassword: 'admin-secret-123', log: () => {} };

describe('Script de seed', () => {
  it('crée l’admin, les spécialités et les dentistes', async () => {
    await seed(opts);
    expect(await Specialty.countDocuments()).toBe(data.specialties.length);
    const admin = await User.findOne({ email: 'admin@meditrack.ma' }).select('+password');
    expect(admin.role).toBe('admin');
    expect(await admin.comparePassword('admin-secret-123')).toBe(true);
    const doctors = await User.find({ role: 'dentiste' }).populate('specialty');
    expect(doctors).toHaveLength(data.doctors.length);
    expect(doctors[0].specialty.slug).toBe('dentisterie-generale');
  });

  it('est relançable sans doublons et sans écraser le mot de passe admin', async () => {
    await seed(opts);
    await seed({ ...opts, adminPassword: 'autre-mot-de-passe' });
    expect(await Specialty.countDocuments()).toBe(data.specialties.length);
    expect(await User.countDocuments({ role: 'admin' })).toBe(1);
    expect(await User.countDocuments({ role: 'dentiste' })).toBe(data.doctors.length);
    const admin = await User.findOne({ role: 'admin' }).select('+password');
    expect(await admin.comparePassword('admin-secret-123')).toBe(true);
  });

  it('exige ADMIN_PASSWORD pour créer l’admin', async () => {
    await expect(seed({ adminEmail: 'admin@meditrack.ma', log: () => {} })).rejects.toThrow(/ADMIN_PASSWORD/);
  });
});
