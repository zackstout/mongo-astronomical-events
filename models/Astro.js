
var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var AstroSchema = new Schema({
  date: String,
  type: String,
  desc: String,
  year: Number,
  month: Number,
  day: Number,
  timestamp: Number,
  remind: Boolean,
});

module.exports = mongoose.model("Astro", AstroSchema);
