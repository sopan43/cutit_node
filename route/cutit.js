const conn = require('../connection.js');
const express = require('express');
const randomstring = require('randomstring');
const bodyParser = require('body-parser');
const path = require('path');
// const sgMail = require('@sendgrid/mail');
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
        
    } else {
        genrate_unique_key().then((rstring) => {
            url = req.headers.host + '/' + rstring;
            var upload_object = {
                long_url: req.body.original_url,
                short_code: rstring
            };
            conn.execute('INSERT INTO short_urls (long_url, short_code) VALUES (?, ?)', [req.body.original_url, rstring])
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


// app.post('/feedback', (req, res) => {
//     var text = req.body.feedback;
//     var name = req.body.name;
//     var email = req.body.email;
//     if (name === '') {
//         name = 'No name'
//     }
//     sgMail.setApiKey(process.env.SENDGRID_API_KEY);
//     const msg = {
//         to: 'developer.cutit@gmail.com',
//         from: 'sopanmittal43@gmail.com',
//         subject: 'Feedback by ' + name,
//         text: text
//     };
//     sgMail.send(msg);


//     if (email !== '') {
//         sgMail.setApiKey(process.env.SENDGRID_API_KEY);
//         console.log(email);
//         const msg2 = {
//             to: email,
//             from: 'info.cutit@gmail.com',
//             subject: 'Thanks',
//             text: 'text'
//         };
//         sgMail.send(msg2);

//     }
//     res.send('DONE');
// });


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
            console.log(result);
            if (result[0].length === 0) {
                resolve(rstring);
            } else {
                // console.log('===========');
                genrate_unique_key();
            }

        }).catch(error => {
            reject('error in query ' + error);
        });
    });
}


module.exports = app;