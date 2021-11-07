// setup spiced-postgres module
const spicedPg = require("spiced-pg");
const db = spicedPg("postgres:postgres:postgres@localhost:5432/zoey");

module.exports.newSignature = function (
    firstName,
    lastName,
    age,
    country,
    signature
) {
    return db.query(
        `INSERT INTO signatures (firstName, lastName, age, country, signature) VALUES($1, $2, $3, $4, $5) RETURNING id`,
        [firstName, lastName, age, country, signature]
    );
};

module.exports.findSignature = function (id) {
    return db.query(`SELECT signature FROM signatures WHERE id = $1`, [id]);
};

module.exports.getAllSigners = function () {
    return db.query("SELECT * FROM signatures");
};

module.exports.getNumberOfSigners = function () {
    return db.query("SELECT COUNT(*) as num FROM signatures");
};
