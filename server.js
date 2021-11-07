const express = require("express");
const app = express();
const hb = require("express-handlebars");
const db = require("./database.js");
const cookieSession = require("cookie-session");
// get rid of cookieParser !! it is very easy to tamper.

app.engine("handlebars", hb());
app.set("view engine", "handlebars");

app.use(express.static("./public"));
app.use(require("body-parser").urlencoded({ extended: false }));

//setup cookie-session middleware(take boilerplate and get it to work)
app.use(
    cookieSession({
        secret: `You are so beautiful!`,
        maxAge: 1000 * 60 * 60 * 24 * 14, // validity of cookie for 2 weeks
        sameSite: true, // to prevent CSRF **  WEBSITE SECURITY  **
    })
);
/*****************************  WEBSITE SECURITY  *****************************/

// to prevent Clickjacking
app.use((req, res, next) => {
    res.setHeader("x-frame-options", "deny");
    next();
});

/*********************************   Route   **********************************/
app.get("/", (req, res) => {
    res.render("home", {
        layout: "main",
    });
});

app.get("/sign", (req, res) => {
    res.render("sign", {
        layout: "main",
        class: "hide",
    });
});

app.post("/sign", (req, res) => {
    let { firstName, lastName, age, country, signature } = req.body;
    // CALL FUNCTION TO INSERT SIGNER INTO DB HERE
    db.newSignature(firstName, lastName, age, country, signature)
        .then((result) => {
            req.session.sigId = result.rows[0].id;
            res.redirect("/thanks");
        })
        .catch((e) => {
            console.log(e);
            res.render("sign", {
                layout: "main",
                class: "show",
            });
        });
});

app.get("/thanks", (req, res) => {
    if (req.session.sigId) {
        Promise.all([
            db.findSignature(req.session.sigId),
            db.getNumberOfSigners(),
        ])
            .then((result) => {
                const [signature, number] = result;
                res.render("thanks", {
                    layout: "main",
                    signature: signature.rows[0].signature,
                    num: number.rows[0].num,
                });
            })
            .catch((err) => {
                res.sendStatus(500);
            });
    } else {
        res.redirect("/sign");
    }
});

app.get("/list", (req, res) => {
    Promise.resolve(db.getAllSigners()).then((result) => {
        res.render("list", {
            layout: "main",
            signers: result.rows,
        });
    });
});

// app.get("/test", (req, res) => {
//     console.log("*************** IN /test route ***************");
//     req.session.sigId = 100;
//     console.log("req.session in /test BEFORE i redirect", req.session);
//     console.log("*********************************************");
//     res.redirect("/");
// });

//add this logout route to delete cookies
app.get("/logout", (req, res) => {
    req.session = null;
    res.redirect("/home");
});

app.use(function logUrl(req, res, next) {
    console.log(req.url);
    next();
});

app.listen(8080, () => console.log("Siri is listening..."));
