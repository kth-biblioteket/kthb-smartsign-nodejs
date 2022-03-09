const jwt = require("jsonwebtoken");
var jwkToPem = require('jwk-to-pem');
const axios = require('axios')

function verifyToken(req, res, next) {
    let token = req.body.apikey
        || req.query.apikey
        || req.headers['x-access-token']
        || req.headers['authorization']
        || req.headers['kth-ug-token']
        || req.cookies.jwt

    if (!token)
        return res.render('login',{logindata: {"status":"ok", "message":"No token"}})

    if (req.headers['x-access-token'] || req.cookies.jwt) {
        jwt.verify(token, process.env.SECRET, async function (err, decoded) {
            if (err) {
                res.clearCookie("jwt")
                res.status(401).send({ auth: false, message: 'Failed to authenticate token, ' + err.message });
            }

            //Hämta kthuguser-data och kontrollera grupptillhörighet
            req.userprincipalname = decoded.id;
            kthaccount= req.userprincipalname.split('@')[0];
            let response
            try {
                response = await axios.get('https://lib.kth.se/ldap/api/v1/account/' + kthaccount + '?token=' + process.env.LDAPAPIKEYREAD, req.body)
            } catch(err) {
                res.status(400).send({ auth: false, message: 'General error' + err.message });
            }
            if (response.data.ugusers) {
                if (response.data.ugusers.kthPAGroupMembership) {
                    if (response.data.ugusers.kthPAGroupMembership.indexOf(process.env.AUTHORIZEDGROUPS) !== -1) {
                        req.token = jwt.sign({ id: req.userprincipalname }, process.env.SECRET, {
                            expiresIn: "7d"
                        });
                        next();
                    } else {
                        res.clearCookie("jwt")
                        res.render('login',{logindata: {"status":"error", "message":"Not authorized"}})
                    }
    
                } else {
                    res.clearCookie("jwt")
                    res.render('login',{logindata: {"status":"error", "message":"No groups in UG"}})
                }
            } else {
                res.clearCookie("jwt")
                res.render('login',{logindata: {"status":"error", "message":"No user found"}})
            }
        });
    } else {
        if (token != process.env.APIKEY) {
            res.clearCookie("jwt")
            res.json({ success: false, message: 'Failed to authenticate token.' });
        } else {
            next();
        }
    }
}

module.exports = verifyToken;