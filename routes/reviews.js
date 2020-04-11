const express = require("express");
const router = express.Router();
const Mongoose = require("mongoose");
const _ = require("lodash");
const config = require("config");

const auth = require("../middleware/auth");
const { Employee, validate } = require("../models/employee"); // Using employer schema in the user route
const { StaffReport, validateUser } = require("../models/staffReport");

router.get("/:id", async (req, res) => {
  const { reviewId } = req.query;
  const { id } = req.params;

  if (!reviewId || !id)
    return res
      .status(400)
      .send("Incomplete request, review id missing in query");

  const response = JSON.stringify(
    await StaffReport.findById({ _id: req.params.id }).populate({
      path: "staffId",
      model: Employee,
      select: "-_v",
    })
  );

  if (response === "null") return res.status(404).send("Not found");

  const { reports, staffId: staff, _id } = JSON.parse(response);
  const filteredReport = reports.find((data) => data._id === reviewId);

  res.send({
    _id,
    staff: {
      fullname: staff.name.firstName + " " + staff.name.lastName,
      ...staff,
    },
    report: filteredReport,
  });
});

router.put("/:id", async (req, res) => {
  const { reviewId } = req.query;
  const { id } = req.params;
  const { link, ratings } = req.body;

  if (!reviewId || !id)
    return res
      .status(400)
      .send("Incomplete request, review id missing in query");

  try {
    const result = await StaffReport.findById({ _id: req.params.id });
    const reports = JSON.parse(JSON.stringify(result.reports));
    const report = reports.find((report) => report._id === reviewId);

    const index = reports.indexOf(report);

    if (link) report.link = `${config.frontEndUrl}/review/${link}`;

    if (ratings) report.ratings = ratings;

    reports[index] = report;

    result.reports = reports;

    await result.save();
    res.send(report);
  } catch (e) {
    console.log(e.message);
    res.status(400).send("Something went wrong, try again later");
  }
});

module.exports = router;
