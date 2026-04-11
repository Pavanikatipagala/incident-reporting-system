/**
 * Application user: citizen, admin, or department staff.
 * Password is hashed with bcrypt before save.
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const ROLES = ['citizen', 'admin', 'department'];

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 6, select: false },
    role: {
      type: String,
      enum: ROLES,
      default: 'citizen',
    },
    /** Set when role is 'department' — links staff to their department */
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
    },
  },
  { timestamps: true }
);

// Hash password before storing
userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.statics.ROLES = ROLES;

module.exports = mongoose.model('User', userSchema);
