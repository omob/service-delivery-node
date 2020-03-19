const Mongoose = require("mongoose");
const Joi = require("joi");
const Schema = Mongoose.Schema;

const staffReportSchema = new Schema({
  staffId: {
    type: Schema.Types.ObjectId,
    ref: "Employee"
  },
  reports: {
    type: Array,
    _id: Schema.Types.ObjectId,
    ratings: {
      type: Array,
      ratings: { type: Array },
      review: { type: String, default: "" }
    },
    client: String,
    created: { type: Date, default: Date.now }
  }
});

function validateUser(user) {
  const schema = {
    staffId: Joi.string(),
    client: Joi.string(),
    ratings: Joi.object()
  };

  return Joi.validate(user, schema);
}
const StaffReport = Mongoose.model("StaffReport", staffReportSchema);

module.exports = { StaffReport, validateUser };
