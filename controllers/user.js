const { validationResult }  = require("express-validator/check");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

exports.signUp = (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const error = new Error("Entered data is invalid kindly validate it!");
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    
    bcrypt.hash(password, 12)
        .then(hashedPswd => {
            const user = new User({
                name: name,
                email: email,
                password: hashedPswd
            });
            return user.save()
        })
        .then(user => {
                res.status(201).json({
                    message: "user created successfully",
                    user: user._id
                })
            })
        .catch(error => {
            if(!error.statusCode){
                error.statusCode = 500;
                throw error;
            }
            next(error);
        })
    
}

exports.login = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    let loadedUser;
    User.findOne({email:email})   
        .then(
            user => {
                if(!user) {
                    const error = new Error('A user with this moduleis not required');
                    error.statusCode = 422;
                    throw error;
                }
                loadedUser = user
                return bcrypt.compare(password, user.password)
            })
        .then(isEqual => {
            if(!isEqual){
                const error = new Error('entered password is incorrect kindly enter correct password');
                error.statusCode = 401;
                throw error;
            }
            const token = jwt.sign(
                {
                    email: loadedUser.email,
                    userId: loadedUser._id.toString()

                }, "sreenivas secret code",
                    {expiresIn: '1h'}
            )
            res.status(200).json({
                 token: token, userId: loadedUser._id.toString()
            });
        })
        .catch(err =>{
            if(!err.statusCode){
                err.statusCode = 500;
            }
            next(err);
        })     
}