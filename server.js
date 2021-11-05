const express = require("express");
const app = express();
const hb = require("express-handlebars");
const db = require("./database.js");
const cookieSession = require("cookie-session");
// get rid of cookieParser !! it is very easy to tamper.

// setup handlebars Middleware
app.engine("handlebars", hb());
app.set("view engine", "handlebars");

// setup middleware express.static to serve .css from directory
app.use(express.static("./public"));
app.use(require("body-parser").urlencoded({ extended: false }));

// setup cookie-session middleware(take boilerplate and get it to work)
app.use(
    cookieSession({
        secret: `You are so beautiful!`,
        maxAge: 1000 * 60 * 60 * 24 * 14, // validity of cookie for 2 weeks 
        sameSite:true // to prevent CSRF **  WEBSITE SECURITY  **
    })
);
/*****************************  WEBSITE SECURITY  *****************************/

// to prevent Clickjacking
app.use((req, res, next) => {
    res.setHeader("x-frame-options", "deny");
    next();
});

/*********************************   Route   **********************************/

app.use(express.static("./public"));


app.get("/", (req, res) => {
    res.render("home", {
        layout: "main", 
    });
});

app.get("/home", (req, res) => res.sendStatus(200));


app.get("/test", (req, res) => {
    console.log("*************** IN /test route ***************");
    req.session.sigId = 10;
    console.log("req.session in /test BEFORE i redirect", req.session);
    console.log("*********************************************");
    res.redirect("/");
});

// add this logout route to delete cookies
app.get("/logout",(req,res) => {
    req.session = null;
    res.redirect("/home");
});

app.get("/thanks",(req,res) => {
    // you should log the cookie!!!
    console.log(req.session);
    // you should have access to your sigID here
});

app.use(function logUrl(req, res, next) {
    console.log(req.url);
    next();
});


app.get("/sign", (req, res) => {
    res.render("sign", {
        layout: "main",
    });
});

app.post("/sign", (req, res) => {
    let { firstName, lastName, age, country, signature } = req.body;
    // CALL FUNCTION TO INSERT SIGNER INTO DB HERE
    database.newSignature(firstName, lastName, age, country, signature);
    res.render("/thanks",{
        layout: "main"
    });
    
});


app.listen(8080, () => console.log("Siri is listening..."));


