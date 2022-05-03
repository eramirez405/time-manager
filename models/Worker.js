const mongoose = require('mongoose');

const WorkerSchema = mongoose.Schema({
  sid: {
    type: String,
    required: true,
    unique: true,
  },
  friendlyName: {
    type: String,
  },
  dateStatusChanged: {
    type: Date,
  },
  dateCreated: {
    type: Date,
  },
  available: {
    type: Boolean,
  },
  attributes: {
    type: String,
  },
  activityName: {
    type: String,
  },
  timeouts: [
    {
      Timestamp: {
        type: Date,
      },
      TaskChannelUniqueName: {
        type: String,
      },
      TaskQueueName: {
        type: String,
      },
      WorkerActivityName: {
        type: String,
      },
      ResourceSid: {
        type: String,
      },
    },
  ],
  rejections: [
    {
      Timestamp: {
        type: Date,
      },
      TaskChannelUniqueName: {
        type: String,
      },
      TaskQueueName: {
        type: String,
      },
      WorkerActivityName: {
        type: String,
      },
      ResourceSid: {
        type: String,
      },
    },
  ],
  currentCall: {},
  lastCall: {},
  statusChangeInfo: {
    type: Object,
  },
});

module.exports = mongoose.model('workers', WorkerSchema);
