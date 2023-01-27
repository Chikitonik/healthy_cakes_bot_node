-- https: / / api.elephantsql.com /
-- roles
CREATE TABLE roles(
    id SERIAL PRIMARY KEY,
    role_description varchar(30)
);
insert into roles (role_description)
values ('admin'),
    ('customer'),
    ('courier'),
    ('baker');
-- users
CREATE TABLE users(
    id SERIAL PRIMARY KEY,
    username varchar(100) UNIQUE NOT NULL,
    password varchar(255) NOT NULL,
    email varchar(100) UNIQUE NOT NULL,
    role INTEGER REFERENCES roles(id) NOT NULL,
    first_name varchar(30),
    last_name varchar(30),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);
insert into users (username, password, email, role)
values (
        'chikitonik',
        '4967f9ecfe85c27b89bc459a9a520c5b',
        'chikitonik@gmail.com',
        1
    )