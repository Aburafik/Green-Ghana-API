const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    default: null,
  },
  contact: {
    type: String,
    required: true,
  },

  location: {
    type: String,
    required: true,
  },
  accountType: {
          type: String,
          default:"individual",
        },

  institutionName: {
    type: String,
    required: true,
//     required: accountType === "individual" ? true : false,
  },
  institutionId: {
    type: String,
    default: null,
  },
  email: {
    type: String,
    required: true,
  },
  digitalAddress: {
    type: String,
    required: true,
  },

  password: {
    type: String,
    default: null,
//     required: accountType === "individual" ? true : false,
  },
});

// const User = mongoose.model("User", userSchema);

module.exports = mongoose.model("User", userSchema);
