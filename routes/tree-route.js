const Tree = require("../models/Trees");
const express = require("express");
const jwt = require("jsonwebtoken");
// const app= express();
const treeRouter = express.Router();

///Middleware to verify token
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
///Register a new Tree
treeRouter.post("/register/tree", verifyToken, async (req, res) => {
  try {
    const { treeName, treeHeight, locationPlanted, datePlanted } = req.body;
    const owner = req.userId;
    const tree = await Tree({
      treeName:treeName[0].toUpperCase()+treeName.slice(1),
      treeHeight,
      locationPlanted,
      datePlanted,
      owner,
    });
    await tree.save();
    res.status(201).json({ message: "Tree registered successfully", tree });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// View all trees
treeRouter.get("/trees", verifyToken, async (req, res) => {
  try {
    const trees = await Tree.find({}).populate("owner", "name");
    res.status(200).json(trees);
  } catch (error) {
    res.status(500).json({ error: "Error fetching trees" });
  }
});

// Filter trees by
treeRouter.get("/trees/:ownerId", verifyToken, async (req, res) => {
  try {
    const { ownerId } = req.params;
    const trees = await Tree.find({ owner: ownerId }).populate("owner", "name");
    res.status(200).json(trees);
  } catch (error) {
    res.status(500).json({ error: "Error filtering trees"});
  }
});

treeRouter.get("/filter/:search", verifyToken, async (req, res) => {
  try {
    const filter = await Tree.find({ treeName: { $regex: req.params.search[0].toUpperCase()+ req.params.search.slice(1)} });
    res.status(200).json(filter);
  } catch (error) {
    res.status(500).json({ error: "Error filtering tree by name" });
  }
});

module.exports = treeRouter;
