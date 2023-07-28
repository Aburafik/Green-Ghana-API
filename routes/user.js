const User = require("../models/users-model");
const bcrypt = require("bcrypt");
const express = require("express");
const jwt = require("jsonwebtoken");
// const app= express();
const authRouter = express.Router();

authRouter.post("/signup", async (req, res) => {
  try {
    const {
      name,
      email,
      location,
      digitalAddress,
      contact,
      accountType,
      institutionName,
      institutionId,
      password,
    } = req.body;

    const defaultinstitutionName =
      accountType === "individual" ? "null" : institutionName;
    const defaultinstitutionId =
      accountType === "individual" ? "null" : institutionId;

    //check if user exist
    const oldUser = await User.findOne({ email });
    if (oldUser) {
      return res
        .status(409)
        .json({ message: "User already exist, Please login" });
    }
    const hashPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      location,
      digitalAddress,
      password: hashPassword,
      accountType,
      institutionName: defaultinstitutionName,
      contact,
      institutionId: defaultinstitutionId,
    });
    await user.save();
    ///Issue token upon successful signup
    const token = jwt.sign({ userId: user._id }, "secret-key", {
      expiresIn: "7d",
    });
    res
      .status(201)
      .json({ message: "User Created successfully", userToken: token, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


authRouter.post("/login", async (req, res) => {
  try {
    const { accountType, email, contact, password , institutionName} = req.body;

    // Check if accountType is "institution" and use institutionName for authentication
    if (accountType === "institution") {

      if (!institutionName || !password) {
        return res
          .status(400)
          .json({ error: "Institution Name and password are required" });
      }

      const user = await User.findOne({institutionName});
      if (!user) {
        return res.status(401).json({ error: "The institution name provided does not exist" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Password not correct" });
      }

      const token = jwt.sign({ userId: user._id }, "secret-key", {
        expiresIn: "7d",
      });
      return res.status(200).json({message:"User Login Successfully", user, token });
    }

    // If accountType is not "admin", use contact for authentication
    if (!contact || !password) {
      return res
        .status(400)
        .json({ error: "PhoneNumber and password are required for individual login" });
    }

    const user = await User.findOne({contact});
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id }, "secret-key", {
      expiresIn: "1h",
    });
    res.status(200).json({ user, token });
  } catch (error) {
    res.status(500).json({ error: "Error logging in" });
  }
});

module.exports = authRouter;
