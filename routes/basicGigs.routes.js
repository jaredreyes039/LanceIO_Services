const express = require('express');
const ROUTER = express.Router();
const BASIC_GIGS_CONTROLLER = require('../controllers/basicGigs.controller');

ROUTER.post('/create', BASIC_GIGS_CONTROLLER.createBasicGig)
ROUTER.get('/clear/dev', BASIC_GIGS_CONTROLLER.clearGigsDev)
ROUTER.post('/update', BASIC_GIGS_CONTROLLER.updateBasicGig)

module.exports = ROUTER;