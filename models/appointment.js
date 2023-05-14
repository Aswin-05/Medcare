// jshint esversion: 6

const mongoose = require("mongoose");



mongoose.connect("mongodb://0.0.0.0:27017/hospitalDB", { useNewUrlParser: true });
console.log("db connected");

const appointmentSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: String,
    date:Date,
    department: String,
    doctor: String,
    message: String
})

const Appointment = mongoose.model("Appointment", appointmentSchema);

module.exports = Appointment;




