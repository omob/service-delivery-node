const config = require("config");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const mongoose = require("mongoose");

const employerSchema = new mongoose.Schema({
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
  email: {
    type: String,
    required: true,
    minlength: 5,
    email: true,
    maxlength: 255,
    unique: true
  },
  password: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 1024
  },
  isAdmin: Boolean,
  employees: {
    type: Array,
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" }
  }
});

employerSchema.methods.generateAuthToken = function() {
  const token = jwt.sign(
    {
      _id: this._id,
      firstName: this.firstName,
      lastName: this.firstName,
      email: this.email,
      isAdmin: this.isAdmin
    },
    config.get("jwtPrivateKey")
  );
  return token;
};

const Employer = mongoose.model("Employer", employerSchema);

function validateUser(user) {
  const schema = {
    email: Joi.string()
      .min(5)
      .max(255)
      .required()
      .email(),
    password: Joi.string()
      .min(5)
      .max(255)
      .required(),
    firstName: Joi.string(),
    lastName: Joi.string(),
    companyName: Joi.string()
  };

  return Joi.validate(user, schema);
}

exports.Employer = Employer;
exports.validate = validateUser;
