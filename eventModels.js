const database = require('./db');

//Hämta alla Events
const readEvents = () => {
    return new Promise(function (resolve, reject) {
        const sql = `SELECT * FROM events
                    WHERE eventtime > now()`;
        database.db.query(database.mysql.format(sql,[]),(err, result) => {
            if(err) {
                console.error(err);
                reject(err.message)
            }
            resolve(result);
        });

        /*
        const sql = `SELECT * FROM events`;
        database.db.all(sql, [], (error, rows) => {
            if (error) {
                reject(error.message)
            } else {
                resolve(rows);
            }
        });
        */
    })
};

//Hämta alla Events med paginering
const readEventsPaginated = (page, limit) => {
    return new Promise(function (resolve, reject) {
        limit = parseInt(limit)
        let offset = (limit * page) - limit;
        const sql = `SELECT * FROM events
                    WHERE eventtime > now()
                    LIMIT ? OFFSET ?`;
        database.db.query(database.mysql.format(sql,[limit, offset]),(err, result) => {
            if(err) {
                console.error(err);
                reject(err.message)
            }
            resolve(result);
        });
    })
};

//Hämta alla som är publicerade med datum > nu 
const readAllPublished = () => {
    return new Promise(function (resolve, reject) {
        const sql = `SELECT * FROM events 
                    WHERE published = 1 AND eventtime > now()`;
        database.db.query(database.mysql.format(sql,[]),(err, result) => {
            if(err) {
                console.error(err);
                reject(err.message)
            }
            resolve(result);
        });

        /*
        const sql = `SELECT * FROM events 
                WHERE published = 1`;
        database.db.all(sql, [], (error, rows) => {
            if (error) {
                reject(error.message)
            } else {
                resolve(rows);
            }
        });
        */
    })
};

//Hämta ett event GUID
const readEventGuid = (guid) => {
    return new Promise(function (resolve, reject) {
        const sql = `SELECT * FROM events 
                WHERE guid = ?`;
        database.db.query(database.mysql.format(sql,[guid]),(err, result) => {
            if(err) {
                console.error(err);
                reject(err.message)
            }
            resolve(result);
        });

        /*
        const sql = `SELECT * FROM events 
                WHERE guid = ?`;
        database.db.get(sql, [guid], (error, row) => {
            if (error) {
                reject(error.message)
            } else {
                resolve(row);
            }
        });
        */
    })

};

//Hämta ett event GUID
const readEventContentid = (contentid) => {
    return new Promise(function (resolve, reject) {
        const sql = `SELECT * FROM events 
                WHERE contentid = ?`;
        database.db.query(database.mysql.format(sql,[contentid]),(err, result) => {
            if(err) {
                console.error(err);
                reject(err.message)
            }
            resolve(result);
        });
    })

};

//Hämta ett event ID
const readEventId = (id) => {
    return new Promise(function (resolve, reject) {
        const sql = `SELECT * FROM events 
                    WHERE id = ?`;
        database.db.query(database.mysql.format(sql,[id]),(err, result) => {
            if(err) {
                console.error(err);
                reject(err.message)
            }
            resolve(result);
        });

    /*
        const sql = `SELECT * FROM events 
                WHERE id = ?`;
        database.db.get(sql, [id], (error, row) => {
            if (error) {
                reject(error.message)
            } else {
                resolve(row);
            }
        });
    */
    })
};

//Skapa ett event
const createEvent = (guid, contentid, eventtime, pubstarttime, pubendtime, smartsignlink, published, lang) => {
    return new Promise(function (resolve, reject) {

        const sql = `INSERT INTO events(guid, contentid, eventtime, pubstarttime, pubendtime, smartsignlink, published, lang)
                VALUES(?, ?, ?, ?, ?, ?, ?, ?)`;
        database.db.query(database.mysql.format(sql,[guid, contentid, eventtime, pubstarttime, pubendtime, smartsignlink, published, lang]), async function(err, result) {
            if(err) {
                console.error(err);
                reject(err.message)
            } else {
                //Lägg till fält
                //Skriv om detta!!
                if(result.insertId != 0) {
                    await createEventField(result.insertId, 1)
                    await createEventField(result.insertId, 2)
                    await createEventField(result.insertId, 3)
                    await createEventField(result.insertId, 4)
                    await createEventField(result.insertId, 5)
                    await createEventField(result.insertId, 6)
                    await createEventField(result.insertId, 7)
                    await createEventField(result.insertId, 8)
                }

                const successMessage = "The event was entered successfully."
                resolve(result.insertId);
            }
        });
    })
};

//Uppdatera ett event
const updateEvent = (guid, contentid, eventtime, pubstarttime, pubendtime, smartsignlink, published, lang, id) => {
    return new Promise(function (resolve, reject) {

        const sql = `UPDATE events 
                SET guid = ?, contentid = ?, eventtime = ?, pubstarttime = ?, pubendtime = ?, smartsignlink = ?, published = ?, lang= ? 
                WHERE id = ?`;
        database.db.query(database.mysql.format(sql,[guid, contentid, eventtime, pubstarttime, pubendtime, smartsignlink, published, lang, id]),(err, result) => {
            if(err) {
                console.error(err);
                reject(err.message)
            }
            const successMessage = "The event was successfully updated."
            resolve(successMessage);
        });

        /*
        const sql = `UPDATE events 
                SET guid = ?, eventtime = ?, pubstarttime = ?, pubendtime = ?, smartsignlink = ?, published = ? 
                WHERE id = ?`;
        database.db.run(sql, [guid, eventtime, pubstarttime, pubendtime, smartsignlink, published, id], (error) => {
            if (error) {
                reject(error.message)
            } else {
                const successMessage = "The event was successfully updated."
                resolve(successMessage);
            }
        });
        */
    })
};

//Radera ett event.
const deleteEvent = (guid) => {
    return new Promise(function (resolve, reject) {

        const sql = `DELETE FROM events 
                WHERE guid = ?`;
        database.db.query(database.mysql.format(sql,[guid]),(err, result) => {
            if(err) {
                console.error(err);
                reject(err.message)
            }
            const successMessage = "The event was successfully deleted."
            resolve(successMessage);
        });

        /*
        const sql = `DELETE FROM events 
                WHERE guid = ?`;
        database.db.run(sql, [guid], (error) => {
            if (error) {
                reject(error.message)
            } else {
                const successMessage = "The event was successfully deleted."
                resolve(successMessage);
            }
        });
        */
    })
};

const updateEventLang = (lang, id) => {
    return new Promise(function (resolve, reject) {
        const sql = `UPDATE events 
                SET lang= ? 
                WHERE id = ?`;
        database.db.query(database.mysql.format(sql,[lang, id]),(err, result) => {
            if(err) {
                console.error(err);
                reject(err.message)
            }
            const successMessage = "The event was successfully updated."
            resolve(successMessage);
        });
    })
};

//Uppdatera ett event
const updateEventPublish = (id, published) => {
    return new Promise(function (resolve, reject) {
        const sql = `UPDATE events 
                SET published = ? 
                WHERE id = ?`;
        database.db.query(database.mysql.format(sql,[published, id]),(err, result) => {
            if(err) {
                console.error(err);
                reject(err.message)
            }
            const successMessage = "The event was successfully updated."
            resolve(successMessage);
        });

        /*

        const sql = `UPDATE events 
                SET published = ? 
                WHERE id = ?`;
        database.db.run(sql, [published, id], (error) => {
            if (error) {
                console.log(error.message)
                reject(error.message)
            } else {
                const successMessage = "The event was successfully updated."
                resolve(successMessage);
            }
        });
        */
    })
};

//Hämta fält för ett event
const readEventFields = (events_id) => {
    return new Promise(function (resolve, reject) {

        const sql = `SELECT fields.id, eventfields.events_id, fields.type, fields.name, fields.description FROM fields
        LEFT JOIN eventfields ON eventfields.fields_id = fields.id
        AND eventfields.events_id = ?`;
        database.db.query(database.mysql.format(sql,[events_id]),(err, result) => {
            if(err) {
                console.error(err);
                reject(err.message)
            }
            resolve(result);
        });

        /*
        const sql = `SELECT fields.id, eventfields.events_id, fields.type, fields.name, fields.description FROM fields
        LEFT JOIN eventfields ON eventfields.fields_id = fields.id
        AND eventfields.events_id = ?`;
        database.db.all(sql, [events_id], (error, rows) => {
            if (error) {
                reject(error.message)
            } else {
                resolve(rows);
            }
        });
        */
    })

};

//Lägg till ett events fält
const createEventField = (event_id, field_id) => {
    return new Promise(function (resolve, reject) {
        const sql = `INSERT INTO eventfields(events_id, fields_id)
                VALUES(?, ?)`;
        database.db.query(database.mysql.format(sql,[event_id, field_id]),(err, result) => {
            if(err) {
                console.error(err);
                reject(err.message)
            }
            const successMessage = "The field was successfully created."
            resolve(successMessage);
        });
    })
};

//Ta bort ett events fält
const deleteEventField = (event_id, field_id) => {
    return new Promise(function (resolve, reject) {
        const sql = `DELETE FROM eventfields
                    WHERE events_id = ? AND fields_id = ?`;
        database.db.query(database.mysql.format(sql,[event_id, field_id]),(err, result) => {
            if(err) {
                console.error(err);
                reject(err.message)
            }
            const successMessage = "The field was successfully deleted."
            resolve(successMessage);
        });

        /*
        const sql = `DELETE FROM eventfields
                    WHERE events_id = ? AND fields_id = ?`;
        database.db.run(sql, [event_id, field_id], (error) => {
            if (error) {
                reject(error.message)
            } else {
                const successMessage = "The field was successfully deleted."
                resolve(successMessage);
            }
        });
        */
    })
};

//Hämta bild för event
const readEventImage = (events_id) => {
    return new Promise(function (resolve, reject) {

        const sql = `SELECT images.id, eventimage.events_id, images.type, images.name, images.size, images.fullpath
                    FROM eventimage
                    JOIN images ON eventimage.images_id = images.id
                    AND eventimage.events_id = ?`;
        database.db.query(database.mysql.format(sql,[events_id]),(err, result) => {
            if(err) {
                console.error(err);
                reject(err.message)
            }
            resolve(result);
        });
    })

};

//Lägg till ett events bild
const createEventImage = (event_id, image_id) => {
    return new Promise(function (resolve, reject) {
        const sql = `INSERT INTO eventimage(events_id, images_id)
                VALUES(?, ?)`;
        database.db.query(database.mysql.format(sql,[event_id, image_id]),(err, result) => {
            if(err) {
                console.error(err);
                reject(err.message)
            }
            const successMessage = "The image was successfully created."
            resolve(successMessage);
        });
    })
};

//Ta bort ett events fält
const deleteEventImage = (event_id) => {
    return new Promise(function (resolve, reject) {
        const sql = `DELETE FROM eventimage
                    WHERE events_id = ?`;
        database.db.query(database.mysql.format(sql,[event_id]),(err, result) => {
            if(err) {
                console.error(err);
                reject(err.message)
            }
            const successMessage = "The image was successfully deleted."
            resolve(successMessage);
        });
    })
};

//Hämta alla bilder i bildbanken
const readImages = () => {
    return new Promise(function (resolve, reject) {
        const sql = `SELECT * FROM images`;
        database.db.query(database.mysql.format(sql,[]),(err, result) => {
            if(err) {
                console.error(err);
                reject(err.message)
            }
            resolve(result);
        });
    })
};

//Hämta en bild från bildbanken
const readImage = (id) => {
    return new Promise(function (resolve, reject) {
        const sql = `SELECT * FROM images 
                    WHERE id = ?`;
        database.db.query(database.mysql.format(sql,[id]),(err, result) => {
            if(err) {
                console.error(err);
                reject(err.message)
            }
            resolve(result);
        });
    })
};

//Lägg till en bild i bildbanken
const createImage = (fullpath, name, size, type) => {
    return new Promise(function (resolve, reject) {
        const sql = `INSERT INTO images(fullpath, name, size, type)
                VALUES(?, ?, ?, ?)`;
        database.db.query(database.mysql.format(sql,[fullpath, name, size, type]),(err, result) => {
            if(err) {
                console.error(err);
                reject(err.message)
            }
            const successMessage = "The image was successfully created."
            resolve(successMessage);
        });
    })
};

//Uppdatera bild i bildbanken
const updateImage = (id, name) => {
    return new Promise(function (resolve, reject) {
        const sql = `UPDATE images
                    SET name = ?
                    WHERE id = ?`;
        database.db.query(database.mysql.format(sql,[name, id]),(err, result) => {
            if(err) {
                console.error(err);
                reject(err.message)
            }
            const successMessage = "The image was successfully updated."
            resolve(successMessage);
        });
    })
};

//Ta bort en bild ur bildbanken
const deleteImage = (id) => {
    return new Promise(function (resolve, reject) {
        const sql = `DELETE FROM images
                    WHERE id = ?`;
        database.db.query(database.mysql.format(sql,[id]),(err, result) => {
            if(err) {
                console.error(err);
                reject(err.message)
            }
            const successMessage = "The image was successfully deleted."
            resolve(successMessage);
        });
    })
};


module.exports = {
    readEvents,
    readEventsPaginated,
    readAllPublished,
    readEventGuid,
    readEventContentid,
    readEventId,
    createEvent,
    updateEvent,
    deleteEvent,
    updateEventLang,
    updateEventPublish,
    readEventFields,
    createEventField,
    deleteEventField,
    readEventImage,
    createEventImage,
    deleteEventImage,
    readImages,
    readImage,
    createImage,
    updateImage,
    deleteImage
};