var conn = require('../connection.js');
var express = require('express');
var randomstring = require('randomstring');
var path = require('path');
var router = express.Router();

/********************************************************************************************************************
 *                                                                                                            		*
 *                                                 	GET gentare 	       											*
 *                                                                                                         			*
 *******************************************************************************************************************/
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/../public/index.html'));
});

router.post('/', (req, res) => {
    var rstring = genrate_unique_key();
    //  console.log('ef ' + rstring);
    return res.json({ success: 1, message: 'successfully 1' });

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
    var rstring = randomstring.generate(7);
    //  console.log(rstring);
    var returnstring = check_unique_key(rstring);
    console.log('d '+returnstring);
    return returnstring;
}

function check_unique_key(rstring, callback) {
    conn.query('SELECT short_code FROM short_urls WHERE short_code = ?', [rstring], (error, result) => {
        if (error) {
            return res.json({ success: 1, message: 'error in query ' + error });
        } else if (result.length === 0) {
            console.log(rstring);
            return rstring;
        } else {
            genrate_unique_key();
        }
    });
}


module.exports = router;