const EXPRESS = require('express');
const BODYPARSER = require('body-parser');
const DOTENV = require('dotenv');
const initMongoConnection = require('./config/database.config');
const BASIC_GIGS_ROUTER = require('./routes/basicGigs.routes');
const MAIN_GIGS_ROUTER = require('./routes/mainGigs.routes');
const CLIENT_CONTACTS_ROUTER = require('./routes/clientContacts.routes');
const ORDERS_ROUTER = require('./routes/orders.routes');
const INVOICES_ROUTER = require('./routes/invoices.routes')
const CORS = require('cors')
const PATH = require('path');
const MORGAN = require('morgan')

// Express server init and env access
const APP = EXPRESS();
DOTENV.config();

// Middleware init
APP.use(EXPRESS.static(PATH.join(__dirname, 'public')));
APP.use(BODYPARSER.json())
APP.use(CORS())

// Use azure app insights for production instead
if (process.env.NODE_ENV == "development") {
    APP.use(MORGAN('tiny'))
}

// Routing
APP.use('/api/basic-gigs', BASIC_GIGS_ROUTER)
APP.use('/api/gigs', MAIN_GIGS_ROUTER)
APP.use('/api/clients', CLIENT_CONTACTS_ROUTER)
APP.use('/api/orders', ORDERS_ROUTER)
APP.use('/api/invoices', INVOICES_ROUTER)

// Move to ENV
const PORT = 5001
const SERVER = APP.listen(process.env.PORT || PORT, () => {
    initMongoConnection(process.env.MONGO_URI)
})

