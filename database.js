const spicedPg = require("spiced-pg");
const db = spicedPg(
    process.env.DATABASE_URL || "postgres:postgres:postgres@localhost/zoey"
);
const bcrypt = require("bcryptjs");

exports.addnewUser = function (firstName, lastName, email, password) {
    return db
        .query(
            `INSERT INTO users (first_name, last_name, email, password) VALUES($1, $2, $3, $4) RETURNING id`,
            [firstName, lastName, email, password]
        )
        .then((results) => {
            return results.rows[0].id;
        })
        .catch((err) => {
            throw err;
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

exports.getSignature = function (sigId) {
    return db.query(`SELECT signature FROM signatures WHERE id = $1`, [sigId]);
};

exports.getUser = function (userId) {
    return db
        .query(
            `
            SELECT u.*, signature, p.* 
            FROM users u 
            LEFT JOIN signatures s ON u.id = s.user_id 
            LEFT JOIN profiles p on u.id = p.user_id
            WHERE u.id = $1
            `,
            [userId]
        )
        .then((results) => {
            return results.rows[0];
        })
        .catch((err) => {
            console.log(err);
        });
};

exports.getAllSigners = function () {
    return db.query(
        `
        SELECT u.*, signature, p.*
        FROM users u 
        LEFT JOIN signatures s ON u.id = s.user_id 
        LEFT JOIN profiles p on u.id = p.user_id
        WHERE s.id IS NOT NULL
        `
    );
};

exports.getNumberOfSigners = function () {
    return db.query(
        `
        SELECT COUNT(*) 
        FROM users u 
        LEFT JOIN signatures s ON u.id = s.user_id 
        WHERE s.id IS NOT NULL
        `
    );
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

exports.checkForSig = function (userId) {
    return db.query(`SELECT id FROM signatures WHERE user_id = $1`, [userId]);
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

exports.getSignersByCity = function (city) {
    return db
        .query(
            `
            SELECT u.*, signature, p.*
            FROM users u
            LEFT JOIN profiles p
                ON u.id = p.user_id
            LEFT JOIN signatures s
                ON u.id = s.user_id
            WHERE LOWER(city) = LOWER($1)
                AND s.id IS NOT NULL;
            `,
            [city]
        )
        .then(function (results) {
            return results.rows;
        })
        .catch(function (err) {
            console.log(err);
        });
};

exports.addUserProfile = function (user_id, age, city, facebookLink) {
    return db.query(
        `INSERT INTO profiles (user_id, age, city, facebook_link) VALUES ($1, $2, $3, $4)`,
        [user_id || null, age || null, city || null, facebookLink || null]
    );
};

exports.updateUserWithPassword = function (
    userId,
    firstName,
    lastName,
    email,
    password
) {
    return db.query(
        `
        UPDATE users 
        SET first_name = $2,
            last_name = $3,
            email = $4,
            password = $5
        WHERE id = $1`,
        [userId, firstName, lastName, email, password]
    );
};

exports.updateUser = function (userId, firstName, lastName, email) {
    return db.query(
        `
        UPDATE users 
        SET first_name = $2,
            last_name = $3,
            email = $4
        WHERE id = $1`,
        [userId, firstName, lastName, email]
    );
};

exports.upsertProfile = function (userId, age, city, facebookLink) {
    db.query(
        `
        INSERT INTO profiles (user_id, age, city, facebook_link) VALUES ($1, $2, $3, $4)
        ON CONFLICT (user_id) DO UPDATE SET age=$2, city=$3, facebook_link=$4`,
        [userId || null, age || null, city || null, facebookLink || null]
    );
};

exports.removeUserSig = function (id) {
    return db.query(`DELETE FROM signatures WHERE user_id = $1;`, [id || null]);
};

exports.removeUserFromDB = function (id) {
    return db.query(`DELETE FROM users WHERE id = $1;`, [id || null]);
};
