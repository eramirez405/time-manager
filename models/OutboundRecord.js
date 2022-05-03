const mongoose = require('mongoose');

const OutboundRecordSchema = mongoose.Schema({
  number: String,
  count: Number,
  date: Date,
  dateNotAllowed: Date,
  available: Boolean,
});

module.exports = mongoose.model('outboundRecords', OutboundRecordSchema);
