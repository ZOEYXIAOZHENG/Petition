// setup spiced-postgres module
const spicedPg = require("spiced-pg");
const db = spicedPg("postgres:postgres:postgres@localhost:5432/zoey");
const bcrypt = require("bcryptjs");

exports.newUser = function (firstName, lastName, email, password) {
    return db
        .query(
            `INSERT INTO users (firstName, lastName, email, password) VALUES($1, $2, $3, $4) RETURNING id`,
            [firstName, lastName, email, password]
        )
        .then((results) => {
            return results.rows[0].id;
        })
        .catch((err) => {
            console.log(err);
        });
};

exports.addSignature = (userId, signature) => {
    return db
        .query(
            `INSERT INTO signatures (user_id, signature)
                VALUES($1, $2)
                RETURNING id`,
            [userId, signature]
        )
        .then((results) => {
            return results.rows[0].id;
        })
        .catch((err) => {
            console.log(err);
        });
};

exports.findSignature = function (id) {
    return db.query(`SELECT signature FROM signatures WHERE user_id = $1`, [
        id,
    ]);
};

exports.getAllSigners = function () {
    return db.query(
        "SELECT u.*, s.signedat  FROM users u LEFT JOIN signatures s on u.id = s.user_id"
    );
};

exports.getNumberOfSigners = function () {
    return db.query("SELECT COUNT(*) as num FROM users");
};

exports.getLoginId = function (email) {
    return db
        .query(`SELECT id FROM users WHERE email = $1`, [email])
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
        .query(`SELECT password FROM users WHERE email = $1`, [email])
        .then(function (result) {
            return result.rows[0] && result.rows[0].password;
        })
        .catch(function (err) {
            console.log(err);
        });
};

// exports.addProfile = (userId,age,city,url) => {
//     return db.query(`$1, $2`, [userId])

// };
