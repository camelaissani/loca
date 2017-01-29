const express = require('express');
const render = require('../render');
//const rs = require('./requeststrategy');


const router = express.Router();
//router.use(rs.mustSessionLessArea);

router.get('/', (req, res) => render('website', req, res));

module.exports = router;
