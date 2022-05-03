const mongoose = require("mongoose");

const AuthUserSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now(),
  },
  role: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: "Active",
  },
  backofficeId: {
    type: String,
  },
  department: {
    type: String,
  },
  onVacation: {
    type: Boolean,
  },
  vacationStart: {
    type: Date,
  },
  vacationEnd: {
    type: Date,
  },
  licenseStart: {
    type: Date,
  },
  licenseEnd: {
    type: Date,
  },
  licenseReason: {
    type: String,
  },
  dailyNotes: [
    {
      note: String,
      poster: String,
      timestamp: Date,
    },
  ],
  sisNotes: [
    {
      noteSis: String,
      startSis: String,
      endSis: String,
      posterSis: String,
      timestampSis: Date,
    },
  ],
  timeManage: {
    type: Boolean,
  },
  schedule: {
    type: Object,
  },
});

module.exports = mongoose.model("authUsers", AuthUserSchema);
