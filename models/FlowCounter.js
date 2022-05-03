const mongoose = require("mongoose");

const FlowCounterSchema = mongoose.Schema({
  flowNumber: {
    type: Number,
  },
});

module.exports = mongoose.model("flowcounters", FlowCounterSchema);
