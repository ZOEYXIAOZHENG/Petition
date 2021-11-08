DROP TABLE IF EXISTS signatures;

CREATE TABLE signatures (
    id SERIAL primary key,
    firstName VARCHAR(255) NOT NULL CHECK (firstName != ''),
    lastName VARCHAR(255) NOT NULL CHECK (lastName != ''),
    email VARCHAR(255) NOT NULL CHECK (email != ''),
    password VARCHAR NOT NULL CHECK (password != ''),
    signature VARCHAR NOT NULL CHECK (signature != ''),
    signedat timestamp
);

-- DROP TABLE IF EXISTS users;

--  CREATE TABLE users(
--      id SERIAL PRIMARY KEY,
--      first VARCHAR(255) NOT NULL,
--      last VARCHAR(255) NOT NULL,
--      email VARCHAR(255) NOT NULL UNIQUE,
--      password VARCHAR(255) NOT NULL,
--      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
--  )
