const User = require("../models/users-model");
const bcrypt = require("bcrypt");
const express = require("express");
const jwt = require("jsonwebtoken");
// const app= express();
const authRouter = express.Router();

const verifyToken = (req, res, next) => {
          const token = req.headers.authorization?.split(" ")[1];
          if (!token) {
            return res.status(401).json({ error: "Unauthorized" });
          }
          jwt.verify(token, "secret-key", (err, decodedToken) => {
            if (err) {
              return res.status(401).json({ error: "Unauthorized" });
            }
            req.userId = decodedToken.userId;
            next();
          });
        };
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
      accountType: accountType,
      institutionName: defaultinstitutionName,
      contact,
      institutionId: defaultinstitutionId,
    });
    await user.save();
    ///Issue token upon successful signup
    const token = jwt.sign({ userId: user._id }, "secret-key", {
      expiresIn: "356d",
    });
    const userAddress = {
      _id: user._id,
      name: user.name,
      email: user.email,
      location: user.location,
      digitalAddress: user.digitalAddress,
      accountType: user.accountType,
      institutionId: user.institutionId,
      institutionName:user.institutionName,
      contact: user.contact
    };
    res
      .status(201)
      .json({ message: "User Created successfully", userAddress,userToken: token,});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { accountType, email, contact, password, institutionName } = req.body;

    // Check if accountType is "institution" and use institutionName for authentication
    if (accountType === "institution") {
      if (!institutionName || !password) {
        return res
          .status(400)
          .json({ error: "Institution Name and password are required" });
      }

      const user = await User.findOne({ institutionName });
      if (!user) {
        return res
          .status(401)
          .json({ error: "The institution name provided does not exist" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Password not correct" });
      }

      const token = jwt.sign({ userId: user._id }, "secret-key", {
        expiresIn: "365d",
      });
      const userAddress = {
          _id: user._id,
          name: user.name,
          email: user.email,
          location: user.location,
          digitalAddress: user.digitalAddress,
          accountType: user.accountType,
          institutionId: user.institutionId,
          institutionName:user.institutionName,
          contact: user.contact
        };
      return res
        .status(200)
        .json({  message: "User Loggin successfully", userAddress,userToken: token,});
    }

    // If accountType is not "admin", use contact for authentication
    if (!contact || !password) {
      return res
        .status(400)
        .json({
          error: "PhoneNumber and password are required for individual login",
        });
    }

    const user = await User.findOne({ contact });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id }, "secret-key", {
      expiresIn: "365d",
    });
    const userAddress = {
          _id: user._id,
          name: user.name,
          email: user.email,
          location: user.location,
          digitalAddress: user.digitalAddress,
          accountType: user.accountType,
          institutionId: user.institutionId,
          institutionName:user.institutionName
        };
    res.status(200).json({ message: "User Loggin successfully", userAddress,"userToken": token,});
  } catch (error) {
    res.status(500).json({ error: "Error logging in" });
  }
});




///Get User Profile

authRouter.get('/user/:id',verifyToken, async(req,res)=>{

        try {
          const userID=req.params.id;

          const user = await User.findById(userID);

          
                    res.status(200).json({message:"User profile retrieved successfully", user})

        } catch (error) {
          res.status(500).json({error:"Error getting user"})
        }
})


module.exports = authRouter;
