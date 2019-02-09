const conn = require('../connection.js');
const express = require('express');
const randomstring = require('randomstring');
const bodyParser = require('body-parser');
const path = require('path');
const sgMail = require('@sendgrid/mail');
const router = express.Router();
const app = express();

let url;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('css'));
app.set('view engine', 'ejs');
/********************************************************************************************************************
 *                                          `                                                                       *
 *                                                  GET gentare                                                     *
 *                                                                                                                  *
 *******************************************************************************************************************/
app.get('/', (req, res) => {
    res.render('index');
});

app.post('/short', (req, res) => {
    if (req.body.original_url === '') {
        console.log(req.body.custom_url);
        res.redirect('/');
    } else if (req.body.custom_url !== '') {
        conn.query('SELECT * FROM short_urls WHERE short_code = ?', [req.body.custom_url], (error, data) => {
            if (error) {
                return res.json({ success: 0, message: 'error' });
            } else if (data.length === 0) {
                var upload_object = {
                    long_url: req.body.original_url,
                    short_code: req.body.custom_url
                };
                url = req.headers.host + '/' + upload_object.short_code;
                conn.query('INSERT INTO short_urls SET ?', [upload_object], (error, response) => {
                    if (error) {
                        return res.json({ success: 0, message: 'error' });
                    } else {
                        res.redirect('/short/url');
                    }
                });
            } else {
                console.log(data);
                genrate_unique_key().then((rstring) => {
                    url = req.headers.host + '/' + rstring;
                    var upload_object = {
                        long_url: req.body.original_url,
                        short_code: rstring
                    };
                    conn.query('INSERT INTO short_urls SET ?', [upload_object], (error, response) => {
                        if (error) {
                            return res.json({ success: 0, message: 'error' });
                        } else {
                            res.redirect('/short/url');
                        }
                    });

                }, (error) => {
                    return res.json({ success: 0, message: 'Error ' + error });
                });
            }
        });
    } else {
        genrate_unique_key().then((rstring) => {
            url = req.headers.host + '/' + rstring;
            var upload_object = {
                long_url: req.body.original_url,
                short_code: rstring
            };
            conn.query('INSERT INTO short_urls SET ?', [upload_object], (error, response) => {
                if (error) {
                    return res.json({ success: 0, message: 'error' });
                } else {
                    res.redirect('/short/url');
                }
            });

        }, (error) => {
            return res.json({ success: 0, message: 'Error ' + error });
        });
    }
});

app.get('/short/url', (req, res) => {
    if (url == undefined) {
        res.redirect('/');
    } else {
        res.render('shorturl', { url: url });
    }
});


app.post('/feedback', (req, res) => {
    var text = req.body.feedback;
    var name = req.body.name;
    var email = req.body.email;
    if (name === '') {
        name = 'No name'
    }
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const msg = {
        to: 'developer.cutit@gmail.com',
        from: 'sopanmittal43@gmail.com',
        subject: 'Feedback by ' + name,
        text: text
    };
    sgMail.send(msg);

    
    if (email !== '') {
            sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        console.log(email);
        const msg2 = {
            to: email,
            from: 'info.cutit@gmail.com',
            subject: 'Thanks',
            text: 'text'
        };
        sgMail.send(msg2);

    }
    res.send('DONE');
});


app.get('s/:cut', (req, res) => {
    conn.query('SELECT long_url FROM short_urls WHERE short_code = ?', [req.params.cut], (error, long_url) => {
        if (error) {
            console.log(error);
        } else {
            console.log('b => ' + long_url[0]);
            res.statusCode = 302;
            res.redirect(long_url[0].long_url);
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
}

function check_unique_key(rstring, callback) {
    return new Promise((resolve, reject) => {
        conn.query('SELECT short_code FROM short_urls WHERE short_code = ?', [rstring], (error, result) => {
            if (error) {
                reject('error in query ' + error);
            } else if (result.length === 0) {
                resolve(rstring);
            } else {
                console.log('===========');
                genrate_unique_key();
            }
        });
    });
}

app.post('/feedback')


module.exports = app;