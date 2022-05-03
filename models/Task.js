const mongoose = require("mongoose");

const ConversationSchema = new mongoose.Schema({
  segment_link: {
    type: String,
  },
  conversation_id: {
    type: String,
  },
});

const AttributeSchema = new mongoose.Schema({
  from: {
    type: String,
  },
  outbound_to: {
    type: String,
  },
  direction: {
    type: String,
  },
  channelSid: {
    type: String,
  },
  number: {
    type: String,
  },
  name: {
    type: String,
  },
  transferTargetType: {
    type: String,
  },
  channelType: {
    type: String,
  },
  origen: {
    type: String,
  },
  contacted: {
    type: Boolean
  },
  Link: {
    type: String,
  },
  id: {
    type: String,
  },
  isNewClient: {
    type: String,
  },
  request: {
    type: String,
  },
  ignoreAgent: {
    type: String,
  },
  language: {
    type: String,
  },
  conversations: {
    type: ConversationSchema,
  },
});

const TaskSchema = mongoose.Schema({
  sid: {
    type: String,
    required: true,
    unique: true,
  },
  age: {
    type: Number,
  },
  assignmentStatus: {
    type: String,
  },
  attributes: {
    type: AttributeSchema,
  },
  dateCreated: {
    type: Date,
  },
  dateUpdated: {
    type: Date,
  },
  taskQueueEnteredDate: {
    type: String,
  },
  priority: {
    type: Number,
  },
  reason: {
    type: String,
  },
  taskQueueSid: {
    type: String,
  },
  taskQueueFriendlyName: {
    type: String,
  },
  taskChannelSid: {
    type: String,
  },
  taskChannelUniqueName: {
    type: String,
  },
  timeout: {
    type: String,
  },
  workflowSid: {
    type: String,
  },
  workflowFriendlyName: {
    type: String,
  },
  workerName: {
    type: String,
  },
  callReason: {
    type: String,
  },
  hangUp: {
    type: Boolean,
  },
  reservations: [
    {
      sid: {
        type: String,
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
      age: {
        type: Number,
      },
    },
  ],
});

module.exports = mongoose.model("tasks", TaskSchema);
