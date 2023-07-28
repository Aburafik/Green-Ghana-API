const mongoose = require("mongoose");

const tressSchema = mongoose.Schema({
  treeName: {
    type: String,
    required: true,
  },

  treeHeight: {
    type: Number,
    required: true,
  },
  locationPlanted: {
    type: String,
    required: true,
  },
  datePlanted: {
    type: String,
    required: true,
  },

  status: {
    type: String,
    default: "active",
  },

  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

module.exports = mongoose.model("Trees", tressSchema);
