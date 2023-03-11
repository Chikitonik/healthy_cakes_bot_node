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
ALTER TABLE cakes
ADD COLUMN is_new BOOLEAN DEFAULT FALSE NOT NULL,
    ADD COLUMN is_active BOOLEAN DEFAULT TRUE NOT NULL;
insert into cakes (title, price, image_source)
values (
        'Berry cakes',
        30.5,
        'https://raw.githubusercontent.com/Chikitonik/healthy_cakes_bot_react/main/src/assets/images/products/3.png'
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
-- carts
CREATE TABLE carts(
    id SERIAL PRIMARY KEY,
    username varchar(100) REFERENCES users(username) NOT NULL,
    cake_id INTEGER REFERENCES cakes(id) NOT NULL,
    price_with_discount decimal NOT NULL,
    amount INTEGER
);
-- customer_address
CREATE TABLE customer_address(
    id SERIAL PRIMARY KEY,
    username varchar(100) REFERENCES users(username) NOT NULL,
    city varchar(100),
    street varchar(100),
    home INTEGER,
    flat INTEGER
);
-- order_header
CREATE TABLE orders_header(
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP DEFAULT NOW(),
    username varchar(100) REFERENCES users(username) NOT NULL,
    address_id INTEGER REFERENCES customer_address(id) NOT NULL,
    sum decimal NOT NULL,
    is_ready BOOLEAN DEFAULT FALSE,
    is_delivering BOOLEAN DEFAULT FALSE,
    is_delivered BOOLEAN DEFAULT FALSE
);
--
insert into orders_header (username, address_id, sum)
values (
        'chikitonik',
        2,
        100
    );
-- orders_position
CREATE TABLE orders_position(
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders_header(id) NOT NULL,
    cake_id INTEGER REFERENCES cakes(id) NOT NULL,
    price_with_discount decimal NOT NULL,
    amount INTEGER
);
--
insert into orders_position (order_id, cake_id, price_with_discount, amount)
values (
        2,
        2,
        100,
        1
    );