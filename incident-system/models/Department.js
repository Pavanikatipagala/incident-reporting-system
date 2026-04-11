/**
 * Government department (Road, Water, Electricity, Sanitation).
 * Department staff users reference this document.
 */
const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    /** Short code used in APIs and filters: ROAD, WATER, ELECTRICITY, SANITATION */
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Department', departmentSchema);
