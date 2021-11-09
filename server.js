const express = require("express");
const app = express();
const hb = require("express-handlebars");
const db = require("./database.js");
const cookieSession = require("cookie-session");
const { hash } = require("bcryptjs");
// get rid of cookieParser !! it is very easy to tamper.

app.engine("handlebars", hb());
app.set("view engine", "handlebars");

app.use(express.static("./public"));
app.use(require("body-parser").urlencoded({ extended: false }));

/***************************   COOKIE-session middleware   ********************/

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

// ----------------------------   Authentication  ---------------------------------

app.get("/registration", (req, res) => {
    res.render("registration", {
        layout: "main",
        class: "hide",
    });
});

app.post("/registration", (req, res) => {
    db.hashPassword(req.body.password)
        .then((hashPw) => {
            return db
                .newUser(
                    req.body.firstName,
                    req.body.lastName,
                    req.body.email,
                    hashPw
                )
                .then((userId) => {
                    return db
                        .addSignature(userId, req.body.signature)
                        .then((sigid) => {
                            req.session.sigId = sigid;
                            res.redirect("/thanks");
                        });
                });
        })
        .catch((err) => {
            console.log(err);
            res.render("registration", {
                layout: "main",
                class: "show",
            });
        });
});

app.get("/login", (req, res) => {
    res.render("login", {
        layout: "main",
    });
});

app.post("/login", (req, res) => {
    db.showHashPw(req.body.email)
        .then((userPw) => {
            if (!userPw) {
                res.redirect("/registration");
            } else {
                console.log(123);
                console.log(req.body.password);
                console.log(userPw);
                return db.checkPassword(req.body.password, userPw);
            }
        })
        .then((doesMatch) => {
            if (doesMatch) {
                db.getLoginId(req.body.email).then((id) => {
                    req.session.sigId = id;
                    return db.checkForSig(id).then((sigId) => {
                        if (sigId) {
                            req.session.sigId = sigId;
                            res.redirect("/thanks");
                        } else {
                            res.redirect("/login");
                        }
                    });
                });
            } else {
                res.redirect("/registration");
            }
        })
        .catch((err) => {
            console.log(err);
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
        res.redirect("/registration");
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

//add this logout route to delete cookies
app.get("/logout", (req, res) => {
    req.session = null;
    res.redirect("/");
});

app.use(function logUrl(req, res, next) {
    console.log(req.url);
    next();
});

// app.get("/profile", (req, res));

// app.post("/profile");
// const { age, city, url } = req.body;
// const parseAge = Number.parseInt(age);
// if (!url.startsWith("http")) {
//     url = "http://" + url;
// }

app.listen(8080, () => console.log("Siri is listening..."));
