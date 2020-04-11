const express = require("express");
const router = express.Router();
const Mongoose = require("mongoose");
const _ = require("lodash");
const auth = require("../middleware/auth");
const { Employee, validate } = require("../models/employee"); // Using employer schema in the user route
const { Employer } = require("../models/employer");
const { StaffReport, validateUser } = require("../models/staffReport");

router.post("/", auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const { firstName, lastName, role, image } = req.body;

  let employer = await Employer.findOne({ _id: req.user._id });
  if (!employer) return res.status(404).send("User not found. Cannot post");

  const newStaff = new Employee({
    name: {
      firstName,
      lastName,
    },
    role,
    image,
    companyName: employer.companyName,
  });

  const result = await newStaff.save();
  employer.employees.push(result._id);

  await employer.save();

  res.send(_.pick(result, ["companyName", "name", "_id", "role", "imageUrl"]));
});

router.get("/", auth, async (req, res) => {
  const { employees } = await Employer.findOne({ _id: req.user._id }).populate({
    path: "employees",
    model: Employee,
    select: "-_v",
  });
  res.send(employees);
});

router.get("/:id", auth, async (req, res) => {
  const staff = await Employee.findById({ _id: req.params.id }).populate({
    path: "reports",
    model: StaffReport,
    select: "-v",
  });

  res.send(staff);
});

router.post("/reviews", auth, async (req, res) => {
  const { error } = validateUser(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const { staffId, client, ratings } = req.body;

  const employee = await Employee.findById({ _id: staffId });
  // check if staffId exists
  const staff = await StaffReport.findOne({ staffId });
  if (!staff) {
    //create new staff
    const newStaffReport = new StaffReport({
      staffId,
      reports: {
        client,
        ratings: {
          rating: ratings,
          review: "",
        },
        _id: Mongoose.Types.ObjectId(),
        created: new Date(),
      },
    });

    const { _id, reports } = await newStaffReport.save();
    employee.reports.push(_id);
    await employee.save();
    return res.send({ _id, report: _.head(reports), link: "" });
  }

  //populate existing staff
  staff.reports.push({
    client,
    _id: Mongoose.Types.ObjectId(),
    created: new Date(),
    ratings: {
      rating: ratings,
      review: "",
    },
  });

  const { _id, reports } = await staff.save();
  // employee.reports.push(_id);
  // await employee.save();

  return res.send({ _id, report: _.last(reports) });
});
module.exports = router;
