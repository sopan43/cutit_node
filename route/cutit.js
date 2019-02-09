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
        conn.query('SELECT * FROM short_urls WHERE short_code = ?', [req.body.custom_url])
            .then((data) => {
                if (data[0].length === 0) {
                    url = req.headers.host + '/' + req.body.custom_url;
                    conn.query('INSERT INTO short_urls (long_url, short_code) VALUES (?, ?)', [req.body.original_url, req.body.custom_url])
                        .then(() => {
                            res.redirect('/short/url');
                        })
                        .catch((error) => {
                            console.log(error);
                            return res.json({ success: 0, message: 'error' });
                        });

                } else {
                    console.log(data);
                    genrate_unique_key().then((rstring) => {
                        url = req.headers.host + '/' + rstring;
                        conn.query('INSERT INTO short_urls (long_url, short_code) VALUES (?, ?)', [req.body.original_url, rstring])
                            .then(() => {
                                res.redirect('/short/url');
                            })
                            .catch((error) => {
                                console.log(error);
                                return res.json({ success: 0, message: 'error' });

                            });
                    });
                }
            })
            .catch((error) => {
                console.log(error);
                return res.send({ success: 0, message: 'error' });
            });

    } else {
        genrate_unique_key().then((rstring) => {
            url = req.headers.host + '/' + rstring;
            conn.execute('INSERT INTO short_urls (long_url, short_code) VALUES (?,?)', [req.body.original_url, rstring])
                .then(() => {
                    res.redirect('/short/url');
                }).catch((error) => {
                    return res.json({ success: 0, message: 'error' });
                });
        }).catch((error) => {
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
        to: process.env.DEVELOPER_EMAIL,
        from: process.env.INFO_EMAIL,
        subject: 'Feedback by ' + name,
        text: text
    };
    sgMail.send(msg);


    if (email !== '') {
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        console.log(email);
        const msg2 = {
            to: email,
            from: process.env.INFO_EMAIL,
            subject: process.env.EMAIL_SUBJECT,
            text: process.env.EMAIL_BODY
        };
        sgMail.send(msg2);

    }
    res.send('DONE');
});


app.get('/:cut', (req, res) => {
    console.log(req.params.cut);
    conn.query('SELECT * FROM short_urls WHERE short_code = ?', [req.params.cut])
        .then(([long_url]) => {
            console.log('b => ' + long_url[0]);
            res.statusCode = 302;
            res.redirect(long_url[0].long_url);
            res.end('Redirecting to ' + long_url[0].long_url);
        })
        .catch((error) => {
            console.log(error);
            return res.json({ success: 0, message: 'error' });
        });
});



function genrate_unique_key() {
    return new Promise((resolve, reject) => {
        var rstring = randomstring.generate(7);
        check_unique_key(rstring).then(value => {
            resolve(value);
        }).catch(error => {
            reject(error);
        });
    });
}

function check_unique_key(rstring, callback) {
    return new Promise((resolve, reject) => {
        conn.execute('SELECT short_code FROM short_urls WHERE short_code = ?', [rstring]).
        then(result => {
            if (result[0].length === 0) {
                resolve(rstring);
            } else {
                genrate_unique_key();
            }

        }).catch(error => {
            reject('error in query ' + error);
        });
    });
}


module.exports = app;