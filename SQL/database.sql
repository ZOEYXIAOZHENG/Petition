DROP TABLE IF EXISTS signatures;

CREATE TABLE signatures (
    id SERIAL primary key,
    firstName VARCHAR(255) NOT NULL CHECK (firstName != ''),
    lastName VARCHAR(255) NOT NULL CHECK (lastName != ''),
    age INT,
    country VARCHAR(255),
    signature VARCHAR NOT NULL CHECK (signature != '')
);