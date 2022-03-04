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

apiRoutes.get('/public/style.css', function(req, res) {
    res.sendFile(__dirname + "/public/css/" + "styles.css");
});

apiRoutes.get('/public/TheSans-Plain-kthb.ttf', function(req, res) {
    fs.readFile(__dirname + "/public/fonts/" + "TheSans-Plain-kthb.ttf", function(error, content) {
        if (error) {
            if(error.code == 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end("error", 'utf-8');
            }
            else {
                res.writeHead(500);
                res.end('Font saknas: '+error.code+' ..\n');
            }
        }
        else {
            res.writeHead(200, { 'Content-Type': 'application/font-ttf' });
            res.end(content, 'utf-8');
        }
    });  
});

apiRoutes.get('/public/FarnhamDisplay-RegularOSF.ttf', function(req, res) {
    fs.readFile(__dirname + "/public/fonts/" + "FarnhamDisplay-RegularOSF.ttf", function(error, content) {
        if (error) {
            if(error.code == 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end("error", 'utf-8');
            }
            else {
                res.writeHead(500);
                res.end('Font saknas: '+error.code+' ..\n');
            }
        }
        else {
            res.writeHead(200, { 'Content-Type': 'application/font-ttf' });
            res.end(content, 'utf-8');
        }
    });
});

apiRoutes.post("/login", eventController.login)

apiRoutes.post("/logout", VerifyToken, eventController.logout)

apiRoutes.get("/admin", VerifyToken, eventController.readEventsPaginated)

apiRoutes.get("/calendar/published/slideshow", eventController.slideshow) 

apiRoutes.get("/calendar/published/slideshowimages", eventController.slideshowimages)

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

apiRoutes.put("/calendar/eventlang/:id", VerifyToken, eventController.updateEventLang)

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
        let html_template = req.query.template || 'templates/smartsign_template.html'
        if (req.params.id) {
            let page = await eventController.generateCalendarPage(req.params.id, html_template);
            res.send(page)
        }
    } catch(err) {
        res.send(err.message)
    }
});

apiRoutes.get("/calendar/event/image/:id", eventController.getPublishedPageAsImage)

apiRoutes.post("/calendar/event/:id", VerifyToken, eventController.generatePublishedPageAsImage)

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

apiRoutes.get("/calendar/pdf/:id", async function (req, res, next) {
    try {
        if (req.params.id) {
            let pdf = await eventController.generatePdfPage(req.params.id, req.query.type);
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
        res.write(err.message + `</div>`)
        res.end();
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

apiRoutes.get("/qrcode/:eventid", async function (req, res) {
    try {
        if (req.params.eventid) {
            //Hämta event
            let event = await eventController.readEventId(req.params.eventid)

            //Spara info
            eventController.createQrcodetracking(req.params.eventid, event[0].guid, req.headers["user-agent"]);

            //Skicka vidare
            res.redirect(event[0].guid);
        }
    } catch(err) {
        res.send(err.message)
    }
});

//Hämta inlagda generella QR-Koder
apiRoutes.get("/qrcodes/general", async function (req, res) {
    try {
        res.write(`<div style="display:flex;flex-direction:column;flex-wrap:wrap" id="qrcodes">`)

        //Hämta alla qrkoder
        let qrcodes_general = await eventController.readQrCodesGeneral()

        for (i=0;i<qrcodes_general.length;i++) {
            const QrCodeGeneralImage  =  await eventController.generateQrCodeGeneral(qrcodes_general[i].id)
            res.write(`<div style="margin-bottom:10px" class="card">
                            <div class="card-body">
                                <div style="display:flex;flex-direction:row;padding-bottom:10px">
                                    <div style="flex:1;display:flex;flex-direction:row">
                                        <div style="flex:3">
                                            <label for="QrCodeGeneralUrl_${qrcodes_general[i].id}">Url</label>
                                            <input id="QrCodeGeneralUrl_${qrcodes_general[i].id}" style="margin-bottom:10px" class="form-control" type="text" value="${qrcodes_general[i].url}"">
                                        </div>
                                        <div style="flex:1;text-align: center">
                                            <label for="QrCodeGeneral_${qrcodes_general[i].id}">QR Kod</label>
                                            <img id="QrCodeGeneralImg_${qrcodes_general[i].id}" style="margin:auto;display:block;width:38px" src="`)
                                        res.write(QrCodeGeneralImage);
                                res.write(`"/><a download="qrcode.png" href="`); res.write(QrCodeGeneralImage); res.write(`">Download</a>
                                        </div>`);
                        res.write(`     <div style="flex:1;display:flex">
                                            <button id="updateQrCodeGeneral_${qrcodes_general[i].id}" onclick="updateQrCodeGeneral('${qrcodes_general[i].id}', 'QrCodeGeneralUrl_${qrcodes_general[i].id}');" type="button" class="btn btn-primary" style="margin-right:10px">
                                                Spara
                                            </button>
                                            <button id="deleteQrCodeGeneral_${qrcodes_general[i].id}" onclick="deleteQrCodeGeneral('${qrcodes_general[i].id}');" type="button" class="btn btn-primary">
                                                Ta bort
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>`)
        };
        res.write(`</div>`)
        res.end();
    } catch(err) {
        res.write(err.message + `</div>`)
        res.end();
    }
});

//Skapa QR-code generell
apiRoutes.post("/qrcode/general", async function (req, res, next) {
    try {
        
        if (req.body.url) {
            //Lägg till URL i DB (tabell: qrcodegeneral)
            let created_id = await eventController.createQrCodeGeneral(req.body.url);
            res.send(created_id.toString())
            
        } else {
            res.status(400).send("url missing")
        }
    } catch(err) {
        res.send(err.message)
    }
});

//Uppdatera QR-code generell
apiRoutes.put("/qrcode/general", async function (req, res, next) {
    try {
        
        if (req.body.id && req.body.url) {
            let result = await eventController.updateQrCodeGeneral(req.body.id, req.body.url);
            res.send(result)
            
        } else {
            res.status(400).send("parameters missing")
        }
    } catch(err) {
        res.send(err.message)
    }
});

//Ta bort QR-code generell
apiRoutes.delete("/qrcode/general", async function (req, res, next) {
    try {
        
        if (req.body.id) {
            //Lägg till URL i DB (tabell: qrcodegeneral)
            let result = await eventController.deleteQrCodeGeneral(req.body.id);
            res.send(result)
            
        } else {
            res.status(400).send("id missing")
        }
    } catch(err) {
        res.send(err.message)
    }
});

//Generera QR-code generell
apiRoutes.get("/qrcode/general/generate/:id", async function (req, res, next) {
    try {
        if (req.params.id) {
            let qrcode = await eventController.generateQrCodeGeneral(req.params.id);
            res.send(qrcode)
            
        }
    } catch(err) {
        res.send(err.message)
    }
});

//Skicka vidare till rätt url från en QRCode-scanning och spara statistik
apiRoutes.get("/qrcode/general/:id", async function (req, res) {
    try {
        if (req.params.id) {
            //Hämta url
            let qrcode = await eventController.readQrCodeGeneral(req.params.id);

            //Spara info
            eventController.createQrcodetracking(0, qrcode[0].url, req.headers["user-agent"]);

            //Skicka vidare
            res.redirect(url);
        }
    } catch(err) {
        res.send(err.message)
    }
});

apiRoutes.get("/qrcodetracking", async function (req, res) {
    try {
        res.write(`<div style="display:flex;flex-direction:column;flex-wrap:wrap" id="qrtrackingstats">`)

        //Hämta qrtrackingstatistik och presentera i en Data Table
        let qrtracking = await eventController.readQrcodetracking()  
        let html = `<div style="margin-bottom:10px" class="card">
                        <div class="card-body">
                            <table id="qrtrackingtable" class="table table-striped" style="width:100%">
                                <thead>
                                    <tr>
                                        <th>Eventid</th>
                                        <th>Url</th>
                                        <th>Nr of Scans</th>
                                    </tr>
                                </thead>
                                <tbody>`
                                qrtracking.forEach(row => {
                                //for(let i=0 ; i < 25 ; i++) {
                                    html += 
                                    `<tr>
                                        <td>${row.events_id}</td>
                                        <td>${row.url}</td>
                                        <td>${row.nrofscans}</td>
                                    </tr>`
                                });
                                html +=  
                                `</tbody>
                                <tfoot>
                                    <tr>
                                        <th>Eventid</th>
                                        <th>Url</th>
                                        <th>Nr of Scans</th>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>`
        res.write(html);
        res.write(`</div>`);
        res.end();
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

