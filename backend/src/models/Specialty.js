const mongoose = require('mongoose');

const specialtySchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    icon: { type: String, trim: true },
    description: { type: String, trim: true, maxlength: 500 },
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

specialtySchema.set('toJSON', { versionKey: false });

module.exports = mongoose.model('Specialty', specialtySchema);
