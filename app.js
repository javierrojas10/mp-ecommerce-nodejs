require('dotenv').config()
var express = require('express');
var exphbs = require('express-handlebars');
var mercadopago = require('mercadopago');
const { PROD_ACCESS_TOKEN, PAYER_EMAIL, INTEGRATOR_ID, APP_PUBLIC_KEY, PORT, EXTERNAL_REFERENCE, LOCALE } = process.env
var port = PORT || 3000

var app = express();

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

app.use(express.static('assets'));

app.use('/assets', express.static(__dirname + '/assets'));

app.get('/', function (req, res) {
    res.render('home', { view: 'home' });
});

app.get('/detail', function (req, res) {
    mercadopago.configure({
        access_token: PROD_ACCESS_TOKEN
    });
    const { title, price, unit, img } = req.query
    const SITE_URL = `${req.protocol}://${req.get('host')}`
    let preference = {
        integrator_id: INTEGRATOR_ID,
        auto_return: "approved",
        payer: {
            name: "Lalo",
            surname: "Landa",
            email: PAYER_EMAIL,
            phone: {
                area_code: "52",
                number: 5549737300
            },
            identification: {
                type: "other",
                number: "123456789"
            },
            address: {
                street_name: "calle falsa",
                street_number: 123,
                zip_code: "03940"
            },
        },
        notification_url: `${SITE_URL}/webhook`,
        external_reference: EXTERNAL_REFERENCE,
        items: [
            {
                id: 1234,
                title,
                description: "“​Dispositivo móvil de Tienda e-commerce​”",
                picture_url: `${SITE_URL}${img.replace('.', '')}`,
                unit_price: parseInt(price),
                quantity: parseInt(unit),
            }
        ],
        back_urls: {
            success: `${SITE_URL}/success`,
            failure: `${SITE_URL}/failure`,
            pending: `${SITE_URL}/pending`,
        },
        payment_methods: {
            excluded_payment_methods: [
                {
                    id: "visa"
                }
            ],
            installments: 6
        }
    };
    mercadopago.preferences.create(preference)
        .then(function (response) {
            console.info(response.body.id)
            let init_point = response.body.init_point;
            res.render('detail', { ...req.query, 
                init_point, 
                preferenceId: response.body.id, 
                view: 'detail', 
                APP_PUBLIC_KEY,
                LOCALE });
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

app.get('/webhook', function (req, res) {
    console.log(req.query, req.body);
    res.status(200).send('OK');
});

app.listen(port);