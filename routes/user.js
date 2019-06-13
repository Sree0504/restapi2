const router = require("express").Router();
const userModule = require('../controllers/user');
const { body } = require('express-validator/check');

const User = require('../models/user');
//const isAuth = require('../middlewares/is_auth');
router.put('/signup',
[
    body('email')
        .isEmail()
        .withMessage('Please enter valid Email!')
        .custom((value, { req }) => {
            return User.findOne({email: value})
                .then(userDoc => {
                    if(userDoc){
                        return Promise.reject('Email is already registered');
                    }
                })
        }).normalizeEmail(),
        body('name').trim().not().isEmpty(),
        body('password').trim().isLength({ min: 5})
], userModule.signUp);

router.post('/login', userModule.login);

module.exports = router;