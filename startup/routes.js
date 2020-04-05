const express = require("express");
const users = require("../routes/users");
const staffs = require("../routes/staffs");
const reviews = require("../routes/reviews");

const auth = require("../routes/auth");
const error = require("../middleware/error");

module.exports = function(app) {
  app.use(express.json());
  app.use("/api/users", users);
  app.use("/api/staffs", staffs);
  app.use("/api/reviews", reviews);
  app.use("/api/auth", auth);

  app.use(error);
};
