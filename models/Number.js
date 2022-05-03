const mongoose = require('mongoose');

const EventSchema = mongoose.Schema({
  _id: {
    type: Number,
  },
  order: {
    type: Number,
  },
  count: {
    type: Number,
  },
  available: {
    type: Boolean,
  },
  timestamp: {
    type: Date,
  },
});

module.exports = mongoose.model('numbers', EventSchema);
