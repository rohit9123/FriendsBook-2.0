const router = require("express").Router();
const Conversation = require("../models/Conversation");

//mew conv
router.post("/", async (req, res) => {
  const newConversation = new Conversation({
    members: [req.body.senderId, req.body.reciverId],
  });
  try {
    const savedConversation = await newConversation.save();
    res.status(200).json(savedConversation);
  } catch (err) {
    res.status(500).json(err);
  }
});

//get conv of user
router.get("/:userId", async (req, res) => {
  try {
    const conversation = await Conversation.find({
      members: { $in: [req.params.userId] },
    });
    res.status(200).json(conversation);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

//get  conv includes two userID;

router.get("/find/:first/:second", async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      members: { $all: [req.params.first, req.params.second] },
    });
    res.status(200).json(conversation);
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
