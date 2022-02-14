const router = require("express").Router();
const { promise } = require("bcrypt/promises");
const Post = require("../models/post");
const User = require("../models/User");

//create a post
router.post("/", async (req, res) => {
  const newPost = new Post(req.body);
  console.log(req.body.img);
  try {
    const savedPost = await newPost.save();
    res.status(200).json(savedPost);
  } catch (err) {
    res.status(500).json(err);
  }
});
//update a post
router.put("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    console.log(post.userId, req.body.userId);
    if (post.userId === req.body.userId) {
      await post.updateOne({ $set: req.body });
      res.status(200).json("post have been updated");
    } else {
      res.status(403).json("you can update only your post");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});
//delete a post
router.delete("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    console.log(post.userId, req.body.userId);
    if (post.userId === req.body.userId) {
      await post.deleteOne();
      res.status(200).json("post have been delete");
    } else {
      res.status(403).json("you can delete only your post");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});
//like a post
router.put("/:id/like", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post.likes.includes(req.body.userId)) {
      await post.updateOne({ $push: { likes: req.body.userId } });
      res.status(200).json("The post has been liked");
    } else {
      await post.updateOne({ $pull: { likes: req.body.userId } });
      res.status(200).json("The post has been disliked");
    }
  } catch (err) {
    req.status(500).json(err);
  }
});
//get a post
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json(err);
  }
});
//get timeline posts
router.get("/timeline/:userId", async (req, res) => {
  try {
    const currentUser = await User.findById(req.params.userId);
    const userPosts = await Post.find({ userId: currentUser._id });
    console.log(currentUser);
    const friendPosts = await Promise.all(
      currentUser.followings.map((friendId) => {
        return Post.find({ userId: friendId });
      })
    );
    console.log(friendPosts);
    res.status(200).send(userPosts.concat(...friendPosts));
  } catch (err) {
    res.status(500).json(err);
  }
});
router.get("/profile/:username", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });

    const post = await Post.find({ userId: user._id });

    res.status(200).json(post);
  } catch (err) {
    res.status(500).json(err);
  }
});
module.exports = router;
