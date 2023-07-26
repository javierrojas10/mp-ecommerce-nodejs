require('dotenv').config()
var express = require('express');
var exphbs = require('express-handlebars');
const { getPreference } = require('./lib/createPreference');
const { APP_PUBLIC_KEY, PORT, LOCALE, INTEGRATOR_ID } = process.env
const mercadopago = require('mercadopago');
var port = PORT || 3000

var app = express();

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

app.use(express.static('assets'));

app.use('/assets', express.static(__dirname + '/assets'));

app.get('/', function (_, res) {
    res.render('home', { view: 'home' });
});

app.get('/detail', function (req, res) {
    
    
   const preference = getPreference({
    req,
    mercadopago,
   })
    mercadopago.preferences.create(preference)
        .then(function (response) {
            let init_point = response.body.init_point;
            res.render('detail', { ...req.query, 
                APP_PUBLIC_KEY,
                LOCALE,
                INTEGRATOR_ID,
                init_point, 
                preferenceId: response.body.id, 
                view: 'item', 
            });
        }).catch(function (error) {
            console.log(error);
            res.render('failure', {...req.query, view: 'failure'});
        });
});
app.get('/success', function (req, res) {
    res.render('success', {...req.query, view: 'success'});
});
app.get('/pending', function (req, res) {
    res.render('pending', {...req.query, view: 'pending'});
});
app.get('/failure', function (req, res) {
    res.render('failure', {...req.query, view: 'failure'});
});

app.post('/webhook', function (req, res) {
    const { type, ...data } = req.query

    console.log('webhook', { type, data })

    res.status(200);
});

app.listen(port);