const mongoose = require('mongoose');

const ReservationSchema = mongoose.Schema({
  sid: {
    type: String,
    required: true,
    unique: true,
  },
  dateCreated: {
    type: Date,
  },
  dateUpdated: {
    type: Date,
  },
  reservationStatus: {
    type: String,
  },
  taskSid: {
    type: String,
  },
  workerName: {
    type: String,
  },
  workerSid: {
    type: String,
  },
});

module.exports = mongoose.model('reservations', ReservationSchema);
