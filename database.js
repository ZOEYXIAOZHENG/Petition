// setup spiced-postgres module
const spicedPg = require("spiced-pg");
const db = spicedPg("postgres:postgres:postgres@localhost:5432/petition");

module.exports.newSignature = function (
    firstName,
    lastName,
    age,
    country,
    signature
) {
    return db
        .query(
            `INSERT INTO signatures (firstName, firstName, age, country, signature) VALUES($1, $2, $3, $4, $5)`,
            [firstName, lastName, age, country, signature]
        )
        .then((result) => {
            console.log(result.rows);
            // you get here when your db query successfully completed!

        })
        .catch((err) => {
            console.log(err);
        });
};
