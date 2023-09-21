const express = require("express");
const User = require("../models/User");
const router = express.Router();
const { validationResult, body } = require("express-validator");
const bcrypt = require("bcryptjs");
const { setDriver } = require("mongoose");
const jwt = require("jsonwebtoken");
const fetchuser = require('../middleware/fetchuser')

const jwt_secret = `${process.env.REACT_APP_JWTTOKEN}`;

// Route 1: Create a user using : POST "/api/auth/createuser". no login required
router.post(
  "/createuser",
  [
    body("name").isLength({ min: 3 }),
    body("email").isEmail(),
    body("password","Password have at list 5 characters").isLength({ min: 5 }),
  ],
  async (req, res) => {
    // If there are errors, return Bad request and the errors
    let Success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({Success, errors: errors.array() });
    }

    // check whether the user with this email exists already
    try {
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res
          .status(400)
          .json({Success:"false", error: "Sorry a user with this email already exists" });
      }

      // secure password with bcrypt salt
      const salt = await bcrypt.genSalt(10);
      const secpass = await bcrypt.hash(req.body.password, salt);

      // create new user data
      user = await User.create({
        name: req.body.name,
        password: secpass,
        email: req.body.email,
      });

      const data = {
        user: {
          id: user.id,
        },
      };
      let Success = true;
      const Token = jwt.sign(data, jwt_secret);
      res.json({Success, Token });
    } catch (error) {
      console.error(error);
      res.status(500).send("Enternal Server Error");
    }
  }
);

// Route 2: Authenticate a user using : POST "/api/auth/login". no login required
router.post(
  "/login",
  [
    body("email", "Enter valid email").isEmail(),
    body("password", "password cannot be empty").exists(),
  ],
  async (req, res) => {
    // If there are errors, return Bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // destructure the userdata
    const { email, password } = req.body;

    try {
      // find user data
      const user = await User.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .json({ error: "Please enter valid credentials" });
      }

      // compare user entered password from database passwoed
      const userPassword = await bcrypt.compare(password, user.password);
      if (!userPassword) {
        const Success = false;
        return res
          .status(400)
          .json({Success, error: "Please enter valid credentials" });
      }

      const data = {
        user: {
          id: user.id,
        },
      };
      
      const Token = jwt.sign(data, jwt_secret);
      const Success = true;
      res.json({ Success , Token });
    } catch (error) {
      console.error(error);
      res.status(500).send("Enternal Server Error");
    }
  }
);

// Route 3: get user details using : POST "/api/auth/getuser". Login required
router.post("/getuser", fetchuser ,async (req, res) => {

  // If there are errors, return Bad request and the errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const userid = req.user.id;
    const user = await User.findById(userid).select("-password");
    res.send(user);
  } catch (error) {
    console.error(error);
    res.status(500).send("Enternal Server Error");
  }
});

module.exports = router;
