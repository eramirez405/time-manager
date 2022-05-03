const mongoose = require('mongoose');

const WorkerActivityEventSchema = mongoose.Schema({
  Sid: {
    type: String,
    required: true,
    unique: true,
  },
  EventType: {
    type: String,
  },
  ResourceType: {
    type: String,
  },
  ResourceSid: {
    type: String,
  },
  Timestamp: {
    type: String,
  },
  WorkerName: {
    type: String,
  },
  WorkflowName: {
    type: String,
  },
  WorkerSid: {
    type: String,
  },
  TaskChannelUniqueName: {
    type: String,
  },
  TaskQueueName: {
    type: String,
  },
  EventDescription: {
    type: String,
  },
  WorkerActivityName: {
    type: String,
  },
  WorkerTimeInPreviousActivity: {
    type: String,
  },
  WorkerPreviousActivityName: {
    type: String,
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model(
  'worker_activity_event',
  WorkerActivityEventSchema
);
