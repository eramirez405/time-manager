const mongoose = require('mongoose');

const CallsSchema = mongoose.Schema({
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
  parentCallSid: {
    type: String,
  },
  accountSid: {
    type: String,
  },
  to: {
    type: String,
  },
  toFormatted: {
    type: String,
  },
  from: {
    type: String,
  },
  fromFormatted: {
    type: String,
  },
  phoneNumberSid: {
    type: String,
  },
  status: {
    type: String,
  },
  startTime: {
    type: String,
  },
  endTime: {
    type: String,
  },
  duration: {
    type: String,
  },
  price: {
    type: String,
  },
  priceUnit: {
    type: String,
  },
  direction: {
    type: String,
  },
  answeredBy: {
    type: String,
  },
  annotation: {
    type: String,
  },
  apiVersion: {
    type: String,
  },
  forwardedFrom: {
    type: String,
  },
  groupSid: {
    type: String,
  },
  callerName: {
    type: String,
  },
  queueTime: {
    type: String,
  },
  trunkSid: {
    type: String,
  },
  uri: {
    type: String,
  },
});

module.exports = mongoose.model('calls', CallsSchema);
