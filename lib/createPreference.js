const { INTEGRATOR_ID, EXTERNAL_REFERENCE, PROD_ACCESS_TOKEN, PAYER_EMAIL } = process.env
function getPreference({ req, mercadopago }) {
    mercadopago.configure({
        access_token: PROD_ACCESS_TOKEN,
        integrator_id: INTEGRATOR_ID,
    });
    
    const { title, price, unit, img } = req.query
    const SITE_URL = `${req.protocol}://${req.get('host')}`
    
    let preference = {
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
    return preference
};    

module.exports = {
    getPreference
}