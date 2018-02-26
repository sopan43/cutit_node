var conn = require('../connection.js');
var express = require('express');
var randomstring = require('randomstring');
var formidable = require('formidable');
var bodyParser = require('body-parser');
var path = require('path');
var router = express.Router();
var app = express();

app.use(bodyParser.json());
app.use(express.static(__dirname));
/********************************************************************************************************************
 *                                          `                                                                       *
 *                                                  GET gentare                                                     *
 *                                                                                                                  *
 *******************************************************************************************************************/
console.log('Mittal');
router.get('/', (req, res) => {
    console.log(req.headers.host);
    res.sendFile(path.join(__dirname + '/templates/index.html'));
});

router.post('/', (req, res) => {
    console.log('fwjf');
    genrate_unique_key().then((rstring) => {
        console.log(req.headers.host + '/' + rstring);

        var fields = [];
        var form = new formidable.IncomingForm();

        form.on('field', function(field, value) {
            fields[field] = value;
        });

        form.on('end', function() {
            var upload_object = {
                long_url: fields.original_url,
                short_code: rstring
            };
            conn.query('INSERT INTO short_urls SET ?', [upload_object], (error, response) => {
                if (error) {
                    return res.json({ success: 0, message: 'successfully 1' });
                } else {
                    res.sendFile((path.join(__dirname + '/templates/shorturl.html')));
                }
            })
        });
        form.parse(req);

    }, (error) => {
        return res.json({ success: 0, message: 'Error ' + error });
    });
});


router.get('/:cut', (req, res) => {
    console.log(req.params.cut);
    conn.query('SELECT long_url FROM short_urls WHERE short_code = ?', [req.params.cut], (error, long_url) => {
        if (error) {

        } else {
            console.log(long_url[0].long_url);
            res.statusCode = 302;
            res.setHeader('Location', long_url[0].long_url);
            res.end('Redirecting to ' + long_url[0].long_url);
        }
    });
});



function genrate_unique_key() {
    return new Promise((resolve, reject) => {
        var rstring = randomstring.generate(7);
        check_unique_key(rstring).then((value) => {
            resolve(value);
        }, (error) => {
            reject(error);
        });
    });
    // console.log('fe ' + returnstring);
}

function check_unique_key(rstring, callback) {
    return new Promise((resolve, reject) => {
        conn.query('SELECT short_code FROM short_urls WHERE short_code = ?', [rstring], (error, result) => {
            if (error) {
                reject('error in query ' + error);
            } else if (result.length === 0) {
                resolve(rstring);
            } else {
                genrate_unique_key();
            }
        });
    });
}


module.exports = router;