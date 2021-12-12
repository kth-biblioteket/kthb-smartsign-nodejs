const jwt = require("jsonwebtoken");
var jwkToPem = require('jwk-to-pem');

function verifyToken(req, res, next) {
    let token = req.body.apikey
        || req.query.apikey
        || req.headers['x-access-token']
        || req.headers['authorization']
        || req.headers['kth-ug-token']
        || req.cookies.jwt

    if (!token)
        return res.status(403).send({ auth: false, message: 'No token provided.' });

    if (req.headers['x-access-token'] || req.cookies.jwt) {
        jwt.verify(token, process.env.SECRET, function (err, decoded) {
            if (err)
                return res.status(401).send({ auth: false, message: 'Failed to authenticate token, ' + err.message });
            req.userprincipalname = decoded.id;
            req.token = jwt.sign({ id: req.userprincipalname }, process.env.SECRET, {
                expiresIn: "7d"
            });
            next();
        });
    } else {

        if (req.headers['kth-ug-token']) {
            //public key: https://login.ref.ug.kth.se/adfs/discovery/keys
            var keys = {kty:"RSA",use:"sig",alg:"RS256",kid:"lxiNqR7Muv6dbY7WAgq-m1BE09w",x5t:"lxiNqR7Muv6dbY7WAgq-m1BE09w",n:"vGV1umdrKoOHimCSO9aAfAy2ri_4FNU4bodC_dHvJZSbb6CwiQGAJ5LDh3UUcjiG5S6R-Tz_Qz4f3wx5p1nX9yXA6KilJy4XPzXfdGX3I6ad_B3hQYUDVtKC0Ng73eeinaSsz80BVik3bOEbkh4coa2tt9QQJYe_dVPv25XDgu33BEQTdThhcgUcqJexmVbmC0x1KnrhLMvcgPahnRXEi4BUFg1Y_vPfN7A3QHasOQQP3UNsqxpyZ8JFlu29NBPTruSpRr_2ad_giCttIS-HBO7Lc1aknucFzsvO6PPModlvZxDYA198RNaW6QPs-M5xcfvxl6zf2sPHk4eM3IHU-Q",e:"AQAB",x5c:["MIIC6jCCAdKgAwIBAgIQQDWQJHmY84BMdFTka2bHAjANBgkqhkiG9w0BAQsFADAxMS8wLQYDVQQDEyZBREZTIFNpZ25pbmcgLSBmZWQtcmVmLTEucmVmLnVnLmt0aC5zZTAeFw0xOTA0MDkyMDUxMTdaFw0yOTA0MDYyMDUxMTdaMDExLzAtBgNVBAMTJkFERlMgU2lnbmluZyAtIGZlZC1yZWYtMS5yZWYudWcua3RoLnNlMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAvGV1umdrKoOHimCSO9aAfAy2ri\/4FNU4bodC\/dHvJZSbb6CwiQGAJ5LDh3UUcjiG5S6R+Tz\/Qz4f3wx5p1nX9yXA6KilJy4XPzXfdGX3I6ad\/B3hQYUDVtKC0Ng73eeinaSsz80BVik3bOEbkh4coa2tt9QQJYe\/dVPv25XDgu33BEQTdThhcgUcqJexmVbmC0x1KnrhLMvcgPahnRXEi4BUFg1Y\/vPfN7A3QHasOQQP3UNsqxpyZ8JFlu29NBPTruSpRr\/2ad\/giCttIS+HBO7Lc1aknucFzsvO6PPModlvZxDYA198RNaW6QPs+M5xcfvxl6zf2sPHk4eM3IHU+QIDAQABMA0GCSqGSIb3DQEBCwUAA4IBAQB8osWRvmcAfAafy5U55SZNKHCEQgjbAo35\/HVmdM1vbTboO7Bpf5PltK4r5h6UBNU0eqkl5M7ie6IvQbE\/XrwjurXnkdMUJtaG3HhRScj\/DAdP\/gQSyfX2150premDrv+\/L0PPAaskPtp8SbbzsFSvU+9THslhiPdbZmGfhBBLaShGdCeORy3ctYbCfvpqzvwgjYst2K2uJpl7mjhg4RPhKMK87Kz3jIrglso1UJCItlUy4ysUPnO+jVs\/6YfDNq65ryNjMUqjQEtRGxY257+ZlWuOPqdJdH28XBwPSLS\/3+ElWPryKy3CPTgS9ntnUBcXo3TfRa3KR7fWD1d1zuAQ"]}
            pem = jwkToPem(keys);
            jwt.verify(req.headers['kth-ug-token'], pem, function (err, decoded) {
                if (err)
                    return res.status(401).send({ auth: false, message: 'Failed to authenticate token, ' + err.message });
                req.kthid = decoded.kthid;
                next();
            });

        } else {
            if (token != process.env.APIKEY) {
                return res.json({ success: false, message: 'Failed to authenticate token.' });
            } else {
                next();
            }
        }
    }
}

module.exports = verifyToken;