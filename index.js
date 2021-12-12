'use strict';

require('dotenv').config()

const jwt = require("jsonwebtoken");
const VerifyToken = require('./VerifyToken');
const VerifyAdmin = require('./VerifyAdmin');
const express = require("express");
const bodyParser = require("body-parser");
const cors = require('cors')
const fs = require("fs");
const path = require('path');
const eventController = require('./eventControllers');
const fileUpload = require('express-fileupload');
const { randomUUID } = require('crypto');
const cookieParser = require("cookie-parser");

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(fileUpload({
    limits: { fileSize: 2 * 1024 * 1024 },
    abortOnLimit: true
}));

app.use(cookieParser());

const socketIo = require("socket.io");

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.use(cors({ origin: '*' }));

const apiRoutes = express.Router();

apiRoutes.get("/", async function (req, res, next) {
    try {
        let verify = await VerifyAdmin(req, res, next)
        res.redirect("/smartsign/api/v1/admin")
    } catch(err) {
        res.render('login')
    }
});

apiRoutes.post("/login", eventController.login)

apiRoutes.post("/logout", VerifyToken, eventController.logout)

apiRoutes.get("/admin", VerifyToken, eventController.readEventsPaginated)

apiRoutes.get("/calendar/events", eventController.readEventsPaginated)

apiRoutes.get("/calendar/published/slideshow", async function (req, res, next) {
    try {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write(`
        <!DOCTYPE html>
        <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
                <title>KTH Library Calendar</title>
                <link rel="shortcut icon" href="favicon.ico">
                <link rel="stylesheet" href="https://apps.lib.kth.se/smartsign/css/bootstrap.min.css">
                <link rel="stylesheet" href="https://apps.lib.kth.se/smartsign/css/smartsign.css?ver=1.10">
                <link rel="stylesheet" type="text/css" href="//fonts.googleapis.com/css?family=Open+Sans">
            </head>
            <style>
                body {
                    height: 1900px;
                    width: 1080px;
                    overflow: hidden;
                }
                .mySlides {display:none;}
                .fadeinKTHB
                {
                    animation: fadeInAnimation ease 3s;
                    animation-iteration-count: 1;
                    animation-fill-mode: forwards;
                }
                
                @keyframes fadeInAnimation {
                    0% {
                        opacity: 0;
                    }
                    100% {
                        opacity: 1;
                    }
                }
            </style>
            <body>
                <div id="slides">`)

        //Läs in alla sidor som är publicerade som html i publishedevents     
        const filenames = fs.readdirSync(path.join(__dirname, "/publishedevents/html"))
        let htmlfiles = filenames.filter( file => file.match(new RegExp(`.*\.(html)`, 'ig')));
        htmlfiles.forEach(file => {
            const content = fs.readFileSync(path.join(__dirname, "/publishedevents/html/" + file))
            res.write('<div class="mySlides fadeinKTHB" style="display: block;">')
            res.write('<div class="App" style="position:relative">')
            res.write(content.toString());
            res.write('</div>')
            res.write('</div>');
        });
        res.write(`
                </div>
                <script>
                var slideIndex = 0;
                carousel();

                function carousel() {
                var i;
                var x = document.getElementsByClassName("mySlides");
                for (i = 0; i < x.length; i++) {
                    x[i].style.display = "none"; 
                }
                slideIndex++;
                if (slideIndex > x.length) {slideIndex = 1} 
                x[slideIndex-1].style.display = "block"; 
                setTimeout(carousel, 10000); 
                }
                </script>
            </body>
            </html>`)
        res.end();
    }
    catch (err) {
        console.log(err)
    }

});

apiRoutes.get("/calendar/published/slideshowimages", async function (req, res, next) {
    try {
        res.writeHead(200, { 'Content-Type': 'text/html' });

        res.write(`
        <!DOCTYPE html>
        <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
                <title>KTH Library Calendar</title>
                <link rel="shortcut icon" href="favicon.ico">
                <link rel="stylesheet" href="https://apps.lib.kth.se/smartsign/css/bootstrap.min.css">
                <link rel="stylesheet" href="https://apps.lib.kth.se/smartsign/css/smartsign.css?ver=1.10">
                <link rel="stylesheet" type="text/css" href="//fonts.googleapis.com/css?family=Open+Sans">
            </head>
            <style>
                body {
                    height: 1900px;
                    width: 1080px;
                    overflow: hidden;
                }
                .mySlides {display:none;}
                .fadeinKTHB
                {
                    animation: fadeInAnimation ease 3s;
                    animation-iteration-count: 1;
                    animation-fill-mode: forwards;
                }
                
                @keyframes fadeInAnimation {
                    0% {
                        opacity: 0;
                    }
                    100% {
                        opacity: 1;
                    }
                }
            </style>
            <body>
                <div id="slides">`)
        //Läs in alla sidor som är publicerade som bilder(jpg's) i publishedevents     
        const filenames = fs.readdirSync(path.join(__dirname, "/publishedevents/images"))
        let jpgfiles = filenames.filter( file => file.match(new RegExp(`.*\.(jpg)`, 'ig')));
        jpgfiles.forEach(file => {

            const content = fs.readFileSync(path.join(__dirname, "/publishedevents/images/" + file))
            res.write('<div class="mySlides fadeinKTHB" style="display: block;"><img src="data:image/jpeg;base64,')
            res.write(Buffer.from(content).toString('base64'));
            res.write('"/></div>');
        });
        res.write(`
                </div>
                <script>
                var slideIndex = 0;
                carousel();

                function carousel() {
                var i;
                var x = document.getElementsByClassName("mySlides");
                for (i = 0; i < x.length; i++) {
                    x[i].style.display = "none"; 
                }
                slideIndex++;
                if (slideIndex > x.length) {slideIndex = 1} 
                x[slideIndex-1].style.display = "block"; 
                setTimeout(carousel, 10000); 
                }
                </script>
            </body>
            </html>`)
        res.end();
    }
    catch (err) {
        console.log(err)
    }
});

apiRoutes.post("/calendar/event", VerifyToken, async function (req, res, next) {
    try {
        let guid = req.query.guid || req.body.guid
        let eventtime = req.query.eventtime || req.body.eventtime
        let create = await eventController.createEvent(guid, eventtime)
        res.send(create)
    } catch(err) {
        res.send(err.message)
    }
});

apiRoutes.put("/calendar/event", VerifyToken, async function (req, res, next) {
    try {
        let guid = req.query.guid || req.body.guid
        let eventtime = req.query.eventtime || req.body.eventtime
        res.send(eventController.updateEvent(guid, eventtime))
    } catch(err) {
        res.send(err.message)
    }
});

apiRoutes.delete("/calendar/event", VerifyToken, async function (req, res, next) {
    try {
        let guid = req.query.guid || req.body.guid
        res.send(eventController.deleteEvent(guid))   
    } catch(err) {
        res.send(err.message)
    } 
});

apiRoutes.post("/calendar/event/publish", VerifyToken, async function (req, res, next) {
    try {
        let events_id = req.query.events_id || req.body.events_id
        let publish = req.query.publish || req.body.publish
        res.send(eventController.updateEventPublish(events_id, publish))
    } catch(err) {
        res.send(err.message)
    }
});

apiRoutes.post("/calendar/event/field", VerifyToken, async function (req, res, next) {
    try {
        let fields_id = req.body.fields_id
        let events_id = req.body.events_id
        res.send(eventController.createEventField(events_id, fields_id))
    } catch(err) {
        res.send(err.message)
    }
});

apiRoutes.delete("/calendar/event/field", VerifyToken, async function (req, res, next) {
    try {
        let fields_id = req.body.fields_id
        let events_id = req.body.events_id
        res.send(eventController.deleteEventField(events_id, fields_id))
    } catch(err) {
        res.send(err.message)
    }
});

apiRoutes.post("/calendar/event/image", VerifyToken, async function (req, res, next) {
    try {
        let images_id = req.body.images_id
        let events_id = req.body.events_id
        res.send(eventController.createEventImage(events_id, images_id))
    } catch(err) {
        res.send(err.message)
    }
});

apiRoutes.delete("/calendar/event/image", VerifyToken, async function (req, res, next) {
    try {
        let images_id = req.body.images_id
        let events_id = req.body.events_id
        res.send(eventController.deleteEventImage(events_id, images_id))
    } catch(err) {
        res.send(err.message)
    }
});

apiRoutes.get("/calendar/event/:id", async function (req, res, next) {
    try {
        if (req.params.id) {
            let page = await eventController.generateCalendarPage(req.params.id);
            res.send(page)
        }
    } catch(err) {
        res.send(err.message)
    }
});

apiRoutes.get("/calendar/event/qrcode/:id", async function (req, res, next) {
    try {
        if (req.params.id) {
            let qrcode = await eventController.generateQrCode(req.params.id);
            res.send(qrcode)
            
        }
    } catch(err) {
        res.send(err.message)
    }
});

apiRoutes.get("/calendar/pdf", async function (req, res, next) {
    try {
        if (req.query.id) {
            let pdf = await eventController.generatePdfPage(req.query.id, 0);
            res.set({ 'Content-Type': 'application/pdf', 'Content-Length': pdf.length })
            res.send(pdf)
        }
        if (req.body.id) {
            let pdf = await eventController.generatePdfPage(req.body.id, 0);
            res.set({ 'Content-Type': 'application/pdf', 'Content-Length': pdf.length })
            res.send(pdf)
        }
    } catch(err) {
        res.send(err.message)
    }
});

apiRoutes.post("/calendar/published/slideshow", VerifyToken, async function (req, res, next) {
    try {
        let slideshow
        if (req.query.type == "html") {
            slideshow = await eventController.generatePublishedPages("html", req)
        }
        if (req.query.type == "images") {
            slideshow = await eventController.generatePublishedPages("images", req)
        }

        if (req.query.type == "all") {
            slideshow = await eventController.generatePublishedPages("all", req)
        }
        res.send(slideshow)
    } catch(err) {
        res.send(err.message)
    }
});

apiRoutes.get("/calendar/images", async function (req, res) {
    try {
        res.write(`<div style="display:flex;flex-direction:column;flex-wrap:wrap" id="images">`)

        //Hämta alla bilder
        let imagebank = await eventController.readImages()

        imagebank.forEach(image => {
            const content = fs.readFileSync(image.fullpath)
            res.write(`<div style="margin-bottom:10px" class="card">
                            <div class="card-body">
                                <div style="display:flex;flex-direction:row;padding-bottom:10px">
                                    <div style="flex:1;display:flex;flex-direction:column">
                                        <label for="imageName_${image.id}">Namn</label>
                                        <input id="imageName_${image.id}" style="margin-bottom:10px" class="form-control" type="text" value="${image.name}"">
                                        <label for="image_${image.id}">Bild</label>
                                        <img id="image_${image.id}" style="flex:2;width:100%" src="data:image/jpeg;base64,`)
                                        res.write(Buffer.from(content).toString('base64'));
                                        res.write('"/>');
                        res.write(`</div>
                                    <div style="flex:1;display:flex;flex-direction:column;justify-content: flex-end;">
                                        <div style="display:flex;justify-content: flex-end;">
                                            <button id="updateImage_${image.id}" onclick="updateImage('${image.id}', 'imageName_${image.id}');" type="button" class="btn btn-primary" style="margin-right:10px">
                                                Spara
                                            </button>
                                            <button id="deleteImage_${image.id}" onclick="deleteImage('${image.id}');" type="button" class="btn btn-primary">
                                                Ta bort
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>`)
        });
        res.write(`</div>`)
        res.end();
    } catch(err) {
        res.send(err.message)
    }
});

apiRoutes.put("/calendar/images/:id", VerifyToken, async function (req, res, next) {
    try {
        res.send(eventController.updateImage(req.params.id, req.body.name ))
    } catch(err) {
        res.send(err.message)
    }
});

apiRoutes.delete("/calendar/images/:id", VerifyToken, async function (req, res, next) {
    try {
        res.send(eventController.deleteImage(req.params.id))
    } catch(err) {
        res.send(err.message)
    }
});

apiRoutes.post("/calendar/uploadfile", async function (req, res) {
    try {
        let targetFile = req.files.imgFile;
        let imagename = req.body.imagename

        var allowedMimes = ['image/jpeg', 'image/png'];
        if (allowedMimes.includes(targetFile.mimetype)) {
        } else {
            return res.status(400).send('File type not allowed');
        }

        let imagePath = path.join(__dirname, 'imagebank/' + randomUUID() + path.extname(targetFile.name))
        targetFile.mv(imagePath, async (err) => {
            if (err)
                return res.status(500).send(err);
            let create = await eventController.createImage(imagePath, imagename, targetFile.size, targetFile.mimetype)
            return res.send({ status: "success", path: imagePath });
        });
    } catch(err) {
        res.send(err.message)
    }
});

app.use('/smartsign/api/v1', apiRoutes);

const server = app.listen(process.env.PORT || 3002, function () {
    const port = server.address().port;
    console.log("App now running on port", port);
});

const io = socketIo(server, {path: "/smartsign/api/v1/socket.io"})

const sockets = {}

io.on("connection", (socket) => {
    socket.on("connectInit", (sessionId) => {
        sockets[sessionId] = socket.id
        app.set("sockets", sockets)
    })
})

app.set("io", io)

