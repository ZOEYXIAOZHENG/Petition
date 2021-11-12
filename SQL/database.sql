DROP TABLE IF EXISTS signatures;
DROP TABLE IF EXISTS profiles;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL CHECK (first_name != ''),
    last_name VARCHAR(255) NOT NULL CHECK (last_name  != ''),
    email VARCHAR(255) NOT NULL UNIQUE CHECK (email != ''),
    password VARCHAR NOT NULL CHECK (password != ''),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  
);

CREATE TABLE signatures(
     id SERIAL PRIMARY KEY,
     signature VARCHAR NOT NULL CHECK (signature != ''),
     user_id INTEGER NOT NULL UNIQUE REFERENCES users(id),
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
);

CREATE TABLE profiles(
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id),
    age INTEGER,
    city VARCHAR(255),
    facebook_link TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
