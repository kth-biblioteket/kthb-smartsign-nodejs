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
    published_as_image TINYINT(1) NOT NULL,
    lang VARCHAR(10) NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT constraint_guid UNIQUE (contentid)
);

-- ALTER TABLE events ADD published_as_image TINYINT(1) NOT NULL AFTER published;

CREATE TABLE fields (
    id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    type VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(30) NOT NULL,
    description VARCHAR(200) NULL,
    CONSTRAINT constraint_type UNIQUE (type)
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

CREATE TABLE qrcodetracking (
    id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    events_id int(6) NOT NULL,
    url VARCHAR(200) NOT NULL,
    browser VARCHAR(500) NOT NULL,
    scantime TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE qrcodegeneral (
    id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    url VARCHAR(200) NOT NULL
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
('title','Titel','Rubriken fr??n kalendern'),
('ingress','Ingress','Ingressen fr??n kalendern'),
('time','Tid','Tiden f??r h??ndelsen'),
('location','Plats','Platsen f??r h??ndelsen'),
('language','Spr??k','Spr??ket f??r h??ndelsen'),
('lecturer','F??rel??sare','F??rel??sare f??r h??ndelsen'),
('image','Bild','Bilden f??r h??ndelsen(fr??n polopoly)'),
('qrcode','QR-Kod','QR-kod med l??nk till h??ndelsen'),
('typeofevent','Typ av event','Vad ??r det f??r typ av event');
