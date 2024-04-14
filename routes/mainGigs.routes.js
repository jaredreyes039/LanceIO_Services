const express = require('express');
const ROUTER = express.Router();
const MAIN_GIGS_CONTROLLER = require('../controllers/mainGigs.controller');

ROUTER.get('/:user_id/:token', MAIN_GIGS_CONTROLLER.getGigsByUserId)

module.exports = ROUTER;