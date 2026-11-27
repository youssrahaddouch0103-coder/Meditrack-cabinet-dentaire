const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const ROLES = ['patient', 'medecin', 'infirmier', 'pharmacien', 'admin'];
const SALT_ROUNDS = 12;

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: [true, 'Le prénom est obligatoire'], trim: true, maxlength: 60 },
    lastName: { type: String, required: [true, 'Le nom est obligatoire'], trim: true, maxlength: 60 },
    email: {
      type: String,
      required: [true, "L'email est obligatoire"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Email invalide']
    },
    phone: { type: String, trim: true, maxlength: 20 },
    password: { type: String, required: true, minlength: 8, select: false },
    role: { type: String, enum: ROLES, default: 'patient' },
    active: { type: Boolean, default: true },
    lastLoginAt: Date
  },
  { timestamps: true }
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
  return next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.set('toJSON', {
  versionKey: false,
  transform: (doc, ret) => {
    delete ret.password;
    return ret;
  }
});

const User = mongoose.model('User', userSchema);
User.ROLES = ROLES;

module.exports = User;
