const Joi = require("joi");
const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema({
  name: {
    firstName: { type: String, default: "" },
    lastName: { type: String, default: "" }
  },
  companyName: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 50
  },
  role: { type: String, default: "" },
  imageUrl: { type: String, default: "" },
  outings: { type: Number, default: 0 },
  reports: {
    type: Array,
    report: { type: mongoose.Schema.Types.ObjectId, ref: "StaffReport" }
  }
});

const Employee = mongoose.model("Employee", employeeSchema);

function validateUser(user) {
  const schema = {
    companyName: Joi.string(),
    role: Joi.string(),
    firstName: Joi.string(),
    lastName: Joi.string()
  };

  return Joi.validate(user, schema);
}

exports.Employee = Employee;
exports.validate = validateUser;
