//jshint esversion:6

require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser")
const Appointment = require("./models/appointment");
const Contact = require("./models/contact");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");
const { check, validationResult } = require("express-validator");
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));



const app = express();
const port = process.env.PORT || 3000;
var appointmentAlert = [];
var contactAlert = [];
var newsletterAlert = [];
const d = new Date();
const date = d.toDateString();

app.set("view engine", "ejs");


app.use(bodyParser.urlencoded({ extended: true }));
const urlencodedParser = bodyParser.urlencoded({ extended: true });
app.use(express.static("public"));

app.use(cookieParser("SecretStringForCookies"));
app.use(session({
    secret: "SecretStringForSessions",
    cookie: { maxAge: 4000 },
    resave: true,
    saveUninitialized: true
}));
app.use(flash());


app.get("/", (req, res) => {
    res.render("index", {
        appointmentResult: req.flash("appointmentResult"),
        appoitmentAlert: req.flash("appoitmentAlert"),
        contactResult: req.flash("contactResult"),
        contactAlert: req.flash("contactAlert"),
        newsletterResult: req.flash("newsletterResult"),
        newsletterAlert: req.flash("newsletterAlert")
    })
});

app.post('/appointment', urlencodedParser, [
    check('name', 'Name is not valid.')
        .exists()
        .isLength({ min: 1 }),
    check('email', 'Email is not valid.')
        .isEmail()
        .normalizeEmail(),
    check('phone', 'Phone number is not valid.')
        .isMobilePhone("en-IN"),
    check('date', 'Invalid date')
        .isDate()
        .isAfter(date),
    check("department", "Choose the Department.")
        .not()
        .isEmpty(),
    check("doctor", "Choose the Doctor.")
        .not()
        .isEmpty()
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        appointmentAlert = errors.array();
        req.flash("appoitmentAlert", appointmentAlert)
        res.redirect("/#appointment");
    } else {
        const appointment = new Appointment({
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            date: req.body.date,
            department: req.body.department,
            doctor: req.body.doctor,
            message: req.body.message
        });
        appointment.save()
            .then(() => {
                req.flash("appointmentResult", "Success.. Wait for confirmation.");
                res.redirect("/#appointment");
            })
            .catch(function (err) {
                req.flash("appointmentResult", "Ooops !.. Something went wrong.");
                res.redirect("/#appointment");
            })
    }
});

app.post('/contact', urlencodedParser, [
    check('name', 'Name is not valid.')
        .exists()
        .isLength({ min: 1 }),
    check('email', 'Email is not valid.')
        .isEmail()
        .normalizeEmail(),
    check('subject', 'Subject is not valid.')
        .exists()
        .isLength({ min: 4 }),
    check('message', 'Message is not valid.')
        .exists()
        .isLength({ min: 4 })

], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        contactAlert = errors.array();
        req.flash("contactAlert", contactAlert)
        res.redirect("/#contact-form");
    } else {
        const contact = new Contact({
            name: req.body.name,
            email: req.body.email,
            subject: req.body.subject,
            message: req.body.message
        });
        contact.save()
            .then(() => {
                req.flash("contactResult", "Delivered..");
                res.redirect("/#contact-form");
            })
            .catch(function (err) {
                req.flash("contactResult", "Ooops !..");
                res.redirect("/#contact-form");
            });
    }
});


app.post("/newsletter", urlencodedParser, [

    check('email', 'Email is not valid.')
        .isEmail()
        .normalizeEmail()

], (req, res) => {


    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        newsletterAlert = errors.array();
        req.flash("newsletterAlert", newsletterAlert)
        res.redirect("/#newsletter");
    }

    const email = req.body.email;
    console.log(email);

    const data = {
        members: [
            {
                email_address: email,
                status: "subscribed"
            }
        ]
    };

    const jsonData = JSON.stringify(data);

    fetch("https://us17.api.mailchimp.com/3.0/lists/process.env.LIST_ID", {
        method: 'POST',
        headers: {
            Authorization: 'auth process.env.AUTH_ID'
        },
        body: jsonData
    })
        .then(function () {
            if (res.statusCode === 200) {
                req.flash("newsletterResult", "Subscribed..");
                res.redirect("/#newsletter");
                console.log("success");
            } else {
                req.flash("newsletterResult", "Ooops !..");
                res.redirect("/#newsletter");
                console.log("error");
            }
        })
        .catch(err => console.log(err))
});

app.listen(port, () => {
    console.log("Server is running at port " + port);
});

