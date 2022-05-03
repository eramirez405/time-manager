const mongoose = require("mongoose");



const CallbackSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  callerID: {
    type: String,
  },
  requestTime: {
    type: Date,
    require: false, 
    default: new Date() 
  },
  assignationTime: {
    type: String,
  },
  tag: {
    type: String,
  },
  assignedTo: {
    type: String,
  },

});

module.exports = mongoose.model("CallBack", CallbackSchema);