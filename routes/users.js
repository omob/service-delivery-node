const auth = require("../middleware/auth");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const { Employer, validate } = require("../models/employer"); // Using employer schema in the user route
const express = require("express");
const router = express.Router();

router.get("/me", auth, async (req, res) => {
  const user = await Employer.findById(req.user._id).select("-password");
  res.send(user);
});

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const { firstName, lastName, email, companyName, password } = req.body;

  let user = await Employer.findOne({ email });
  if (user) return res.status(400).send("User already registered.");

  user = new Employer({
    email,
    password,
    companyName,
    name: {
      firstName,
      lastName
    }
  });

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  const result = await user.save();

  const token = user.generateAuthToken();
  res
    .header("x-auth-token", token)
    .header("access-control-expose-headers", "x-auth-token")
    .send(_.pick(user, ["_id", "firstName", "email"]));
});

module.exports = router;
