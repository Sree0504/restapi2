const express = require('express');
const router = express.Router();
const post = require('../routes/customer');
const user = require('../routes/user')

router.use('/post', post);
router.use('/user', user);

module.exports = router;