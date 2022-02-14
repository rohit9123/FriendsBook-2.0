const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
//Register
router.post("/register", async (req, res) => {
  try {
    //generating hashed password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    //creating user
    // console.log(hashedPassword);
    const newUser = await new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
    });
    console.log(newUser);
    const user = await newUser.save();
    //saving user
    // user.sa
    //returning user
    res.status(200).send(user);
  } catch (err) {
    console.log(err);
  }
});
//login

router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    !user && res.status(404).send("user not found");
    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    !validPassword && res.status(404).send("Wrong password");
    res.status(200).json(user);
  } catch (err) {
    console.log(err);
  }
});
module.exports = router;
