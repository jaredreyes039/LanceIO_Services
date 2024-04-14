const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const initMongoConnection = require('./config/database.config');
const BASIC_GIGS_ROUTER = require('./routes/basicGigs.routes');
const MAIN_GIGS_ROUTER = require('./routes/mainGigs.routes');
const CLIENT_CONTACTS_ROUTER = require('./routes/clientContacts.routes');
const ORDERS_ROUTER = require('./routes/orders.routes');
const INVOICES_ROUTER = require('./routes/invoices.routes')
const cors = require('cors')
const path = require('path');

// Express server init and env access
const app = express();
dotenv.config();

// Middleware init
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json())
app.use(cors())

// Routing
app.use('/api/basic-gigs', BASIC_GIGS_ROUTER)
app.use('/api/gigs', MAIN_GIGS_ROUTER)
app.use('/api/clients', CLIENT_CONTACTS_ROUTER)
app.use('/api/orders', ORDERS_ROUTER)
app.use('/api/invoices', INVOICES_ROUTER)

// Move to ENV
const PORT = 5001
app.listen(process.env.PORT || PORT, () => {
    console.log(`Server is running on port ${PORT}`)
    initMongoConnection(process.env.MONGO_URI)
})
