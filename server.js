const express = require("express");
const app = express();
const hb = require("express-handlebars");
const db = require("./database.js");
const cookieSession = require("cookie-session");
// get rid of cookieParser !! it is very easy tampering.

app.engine("handlebars", hb());
app.set("view engine", "handlebars");

const COOKIE_SECRET  =
    process.env.COOKIE_SECRET || require("./secrets.json").COOKIE_SECRET;

if (process.env.NODE_ENV == "production") {
    app.use((req, res, next) => {
        if (req.headers["x-forwarded-proto"].startsWith("https")) {
            return next();
        }
        res.redirect(`https://${req.hostname}${req.url}`);
    });
}

app.use(express.static("./public"));
app.use(urlencoded({ extended: false }));

app.use(
    cookieSession({
        secret: COOKIE_SECRET,
        maxAge: 1000 * 60 * 60 * 24 * 14,
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

app.use((req, res, next) => {
    console.log(req.url);
    next();
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

// app.get("/profile", (req, res));

// app.post("/profile");
// const { age, city, url } = req.body;
// const parseAge = Number.parseInt(age);
// if (!url.startsWith("http")) {
//     url = "http://" + url;
// }

app.get("cities", (req, res) => {
    db.getCities().then((cities) => res.render("city-list", { city }));
});

app.listen(8080, () => console.log("Siri is listening..."));

if (condition1 && condition2) {
}

app.post("profile/edit", (req, res) => {
    const { password } = req.body;

    city = city || "Berlin";
});

if (password) {
    db.updateUserWithPassword();
}

password && db.updateUserWithPassword();

const loggedIn = true;

const statusCode = loggedIn ? 200 : 403;

let statusCode;
