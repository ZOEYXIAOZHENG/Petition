const express = require("express");
const app = express();
const hb = require("express-handlebars");
const db = require("./database.js");
// import * as modules from "./database.js"; --- another way to import mudules
const cookieSession = require("cookie-session");
const { response } = require("express");
// const supertest = require("supertest");
// get rid of cookieParser !! it is very easy tampering.

app.engine("handlebars", hb());
app.set("view engine", "handlebars");

const COOKIE_SECRET =
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
app.use(require("body-parser").urlencoded({ extended: false }));

app.use(
    cookieSession({
        secret: COOKIE_SECRET,
        maxAge: 1000 * 60 * 60 * 24 * 14,
        sameSite: true, // to against CSRF
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
    console.log(req.session);
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
                .addnewUser(
                    req.body.firstName,
                    req.body.lastName,
                    req.body.email,
                    hashPw
                )
                .then((result) => {
                    req.session.userId = result;
                    res.redirect("/sign");
                });
        })
        .catch((err) => {
            var errorMessage = "";
            if (err.message.includes("unique constraint")) {
                errorMessage = " this email address was registered.";
            } else {
                errorMessage = " ⛔️ please input data completely!";
            }
            res.render("registration", {
                layout: "main",
                class: "show",
                errorMessage,
            });
        });
});

app.get("/login", (req, res) => {
    res.render("login", {
        layout: "main",
        class: "hide",
    });
});

app.post("/login", (req, res) => {
    db.showHashPw(req.body.email)
        .then((userPw) => {
            if (!userPw) {
                res.redirect("/registration");
            } else {
                return db.checkPassword(req.body.password, userPw);
            }
        })
        .then((doesMatch) => {
            if (doesMatch) {
                db.getLoginId(req.body.email).then((userId) => {
                    req.session.userId = userId;
                    console.log(userId);
                    return db.checkForSig(userId).then((result) => {
                        console.log(result);
                        if (result.rows.length > 0) {
                            req.session.sigId = result.rows[0].id;
                            res.redirect("/thanks");
                        } else {
                            res.redirect("/sign");
                        }
                    });
                });
            } else {
                res.render("login", {
                    layout: "main",
                    class: "show",
                });
            }
        })
        .catch((err) => {
            console.log(err);
        });
});

app.get("/sign", (req, res) => {
    res.render("sign", { layout: "main" });
});

app.post("/sign", (req, res) => {
    Promise.resolve(
        db
            .addSignature(req.session.userId, req.body.signature)
            .then((sigId) => {
                console.log("asdfsa", sigId);
                req.session.sigId = sigId;
                res.redirect("/thanks");
            })
    );
});

app.post("/sign/delete", (req, res) => {
    Promise.resolve(
        db.removeUserSig(req.session.userId).then((r) => {
            req.session.sigId = null;
            res.redirect("/sign");
        })
    );
});

app.get("/thanks", (req, res) => {
    if (req.session.sigId) {
        Promise.all([
            db.getSignature(req.session.sigId),
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

app.get("/list/:city", (req, res) => {
    const city = req.params.city;
    db.getSignersByCity(city).then((signers) => {
        res.render("city-list", {
            layout: "main",
            city,
            signers,
        });
    });
});

app.get("/profile", (req, res) => {
    if (!req.session.userId) {
        res.redirect("/registration");
    }
    if (!req.session.sigId) {
        res.redirect("/sign");
    }
    Promise.resolve(db.getUser(req.session.userId)).then((users) => {
        res.render("profile", {
            layout: "main",
            users,
        });
    });
});

app.get("/profile/edit", (req, res) => {
    Promise.resolve(db.getUser(req.session.userId)).then((users) => {
        res.render("profile-edit", {
            layout: "main",
            users,
        });
    });
});

app.post("/profile/edit", (req, res) => {
    const { firstName, lastName, email, password, age, city, facebookLink } =
        req.body;
    const userId = req.session.userId;
    let userUpdatePromise;

    if (password) {
        db.hashPassword(password).then(async (passwordHash) => {
            awaituserUpdatePromise = await db.updateUserWithPassword(
                userId,
                firstName,
                lastName,
                email,
                passwordHash
            );
        });
    } else {
        db.updateUser(userId, firstName, lastName, email).then(
            async (result) => {
                awaituserUpdatePromise = await db.updateUser(
                    userId,
                    firstName,
                    lastName,
                    email
                );
            }
        );
        // Save the resulting promise to userUpdatePromise
    }

    Promise.all([
        userUpdatePromise,
        db.upsertProfile(userId, age, city, facebookLink),
    ])
        .then(res.redirect("/thanks"))
        .catch(function (err) {
            console.log(err);
        });
});

//add this logout route to delete cookies
app.get("/logout", (req, res) => {
    req.session = null;
    res.redirect("/");
});

app.listen(8080, () => console.log("Siri is listening..."));
