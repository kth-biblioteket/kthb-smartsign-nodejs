## MySQL

CREATE USER 'smartsign'@'localhost' IDENTIFIED BY 'xxxxxxxxxxxxxxx'

CREATE DATABASE smartsign;

GRANT SELECT, UPDATE, INSERT, DELETE ON smartsign.* TO 'smartsign'@'localhost'

USE smartsign;

CREATE TABLE events (
    id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    guid VARCHAR(200) NOT NULL,
    contentid VARCHAR(20) NOT NULL,
    eventtime DATETIME NOT NULL,
    pubstarttime DATETIME NOT NULL,
    pubendtime DATETIME NOT NULL,
    smartsignlink VARCHAR(200) NOT NULL,
    published TINYINT(1) NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT constraint_guid UNIQUE (contentid)
);

CREATE TABLE fields (
    id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    type VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(30) NOT NULL,
    description VARCHAR(200) NULL,
    CONSTRAINT constraint_tyoe UNIQUE (type)
);

CREATE TABLE eventfields (
    id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    events_id INT(6) NOT NULL,
    fields_id INT(6) NOT NULL,
    CONSTRAINT constraint_fields UNIQUE (events_id, fields_id)
);

CREATE TABLE images(
    id INT(6) NOT NULL AUTO_INCREMENT PRIMARY KEY,
    fullpath VARCHAR(300),
    name CHAR(50),
    size CHAR(50),
    type CHAR(50)
);

CREATE TABLE eventimage (
    id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    events_id INT(6) NOT NULL,
    images_id INT(6) NOT NULL,
    CONSTRAINT constraint_fields UNIQUE (events_id)
);

## SQLite

CREATE TABLE events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guid text NOT NULL UNIQUE,
    eventtime text NOT NULL,
    pubstarttime text NOT NULL,
    pubendtime text NOT NULL,
    smartsignlink text NOT NULL,
    published integer NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE fields (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type text NOT NULL UNIQUE,
    name text NOT NULL,
    description text NOT NULL
);

CREATE TABLE eventfields (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    events_id INTEGER NOT NULL,
    fields_id INTEGER NOT NULL,
    UNIQUE(events_id,fields_id)
);

CREATE TABLE eventimage (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    events_id INTEGER NOT NULL,
    images_id INTEGER NOT NULL,
    UNIQUE(events_id,images_id)
);


## SQLite & MySQL
INSERT INTO fields(type, name, description)
VALUES
('title','Titel','Rubriken från kalendern'),
('ingress','Ingress','Ingressen från kalendern'),
('time','Tid','Tiden för händelsen'),
('location','Plats','Platsen för händelsen'),
('language','Språk','Språket för händelsen'),
('lecturer','Föreläsare','Föreläsare för händelsen'),
('image','Bild','Bilden för händelsen(från polopoly)'),
('qrcode','QR-Kod','QR-kod med länk till händelsen');
