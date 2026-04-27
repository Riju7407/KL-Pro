const express = require('express');
const router = express.Router();
const { getHomepageCardsPublic } = require('../controllers/homepageCardController');

router.get('/', getHomepageCardsPublic);

module.exports = router;
