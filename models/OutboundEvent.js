const mongoose = require('mongoose');

const OutboundEventSchema = mongoose.Schema({
  number: String,
  timestamp: Date,
  duration: Number,
  agent: String,
});

module.exports = mongoose.model('outboundEvents', OutboundEventSchema);
