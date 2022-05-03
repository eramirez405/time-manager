const mongoose = require("mongoose");

const LocationSchema = new mongoose.Schema({
  latitude: {
    type: String,
  },
  longitude: {
    type: String,
  },
  accuracy: {
    type: String,
  },
});

const TimeLogSchema = mongoose.Schema({
  user: {
    type: String,
  },
  activity: {
    type: String,
  },
  timestamp: {
    type: Date,
  },
  location: {
    type: LocationSchema,
  },
  ip: {
    type: String,
  },
});

module.exports = mongoose.model("timelog", TimeLogSchema);
