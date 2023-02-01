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
    );
-- cakes
CREATE TABLE cakes(
    id SERIAL PRIMARY KEY,
    title varchar(100) NOT NULL,
    description varchar(500) NOT NULL,
    price decimal NOT NULL,
    discount decimal DEFAULT 0,
    image_source varchar(200) NOT NULL
);
insert into cakes (title, description, price, image_source)
values (
        'Lemon cake',
        'Introducing our healthy lemon cake, made with whole wheat flour, natural sweeteners and infused with fresh lemon juice. Perfect for any occasion and guilt-free indulgence. Try it now!',
        50.5,
        'https://raw.githubusercontent.com/Chikitonik/healthy_cakes_bot_react/main/src/assets/images/products/1.jpg'
    );
-- ingredients
CREATE TABLE ingredients(
    id SERIAL PRIMARY KEY,
    title varchar(100) NOT NULL
);
insert into ingredients (title)
values ('lemon');
-- consistency
CREATE TABLE cake_ingredients(
    cake_id INTEGER REFERENCES cakes(id) NOT NULL,
    ingredient_id INTEGER REFERENCES ingredients(id) NOT NULL,
    weight_gr INTEGER NOT NULL
);