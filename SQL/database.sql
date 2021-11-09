DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS signatures;
DROP TABLE IF EXISTS profiles;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    firstName VARCHAR(255) NOT NULL CHECK (firstName != ''),
    lastName VARCHAR(255) NOT NULL CHECK (lastName != ''),
    email VARCHAR(255) NOT NULL CHECK (email != ''),
    password VARCHAR NOT NULL CHECK (password != ''),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  
);


CREATE TABLE signatures(
     id SERIAL PRIMARY KEY,
     signature VARCHAR NOT NULL CHECK (signature != ''),
     user_id INTEGER NOT NULL UNIQUE REFERENCES users(id),
     signedat timestamp DEFAULT CURRENT_TIMESTAMP 
);


CREATE TABLE profiles(
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id),
    age INTEGER CONSTRAINT valid_age CHECK(age BETWEEN 3 AND 100),
    city VARCHAR(250),
    user_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);