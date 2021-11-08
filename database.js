// setup spiced-postgres module
const spicedPg = require("spiced-pg");
const db = spicedPg("postgres:postgres:postgres@localhost:5432/zoey");
const bcrypt = require("bcryptjs");

exports.newSignature = function (
    firstName,
    lastName,
    email,
    password,
    signature
) {
    return db.query(
        `INSERT INTO signatures (firstName, lastName, email, password, signature, signedat) VALUES($1, $2, $3, $4, $5, $6) RETURNING id`,
        [
            firstName,
            lastName,
            email,
            password,
            signature,
            new Date().toLocaleString(),
        ]
    );
};
exports.findSignature = function (id) {
    return db.query(`SELECT signature FROM signatures WHERE id = $1`, [id]);
};

exports.getAllSigners = function () {
    return db.query("SELECT * FROM signatures");
};

exports.getNumberOfSigners = function () {
    return db.query("SELECT COUNT(*) as num FROM signatures");
};

exports.getLoginId = function (email) {
    return db
        .query(`SELECT id FROM signatures WHERE email = $1`, [email])
        .then(function (result) {
            return result.rows[0].id;
        })
        .catch((err) => {
            console.log(err);
        });
};

exports.checkForSig = function (id) {
    return db
        .query(`SELECT id FROM signatures WHERE id = $1`, [id])
        .then(function (results) {
            return results.rows[0].id;
        });
};

exports.hashPassword = function (plainTextPassword) {
    return new Promise(function (resolve, reject) {
        bcrypt.genSalt(function (err, salt) {
            if (err) {
                return reject(err);
            }
            bcrypt.hash(plainTextPassword, salt, function (err, hash) {
                if (err) {
                    return reject(err);
                }
                resolve(hash);
            });
        });
    });
};

exports.checkPassword = function (
    textEnteredInLoginForm,
    hashedPasswordFromDatabase
) {
    return new Promise(function (resolve, reject) {
        bcrypt.compare(
            textEnteredInLoginForm,
            hashedPasswordFromDatabase,
            function (err, doesMatch) {
                if (err) {
                    reject(err);
                } else {
                    resolve(doesMatch);
                }
            }
        );
    });
};

exports.showHashPw = function (email) {
    return db
        .query(`SELECT password FROM signatures WHERE email = $1`, [email])
        .then(function (result) {
            return result.rows[0] && result.rows[0].password;
        })
        .catch(function (err) {
            console.log(err);
        });
};

// this function is being exported only to be used in POST /login
// exports.compare = compare;

// compare will compare what the user just typed in
// with our hashed password in the database
// takes 2 arguments

// compare(arg1, arg2)
// arg1 - the password the user just sent from the client
// arg2 - hashed password stored in the databse for that user (we can get this hashedpassword b/c we have the user's email - waht is the hashed password associated with this email?? )

// compare will hash the plainTxtpswd you just entered
// if it matches - it returns a boolean of TRUE
// if it doesn't - it returns a boolean of FALSE
