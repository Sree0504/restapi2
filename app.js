const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const multer = require('multer');

const routes = require("./routes/index");


// upload images using multer

const fileUpload = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'assets');
    },
    filename: (req, file, cb)=>{
        cb(null, new Date().toISOString() + '_' + file.originalname)
    }
});

const filterFile = (req, file, cb) => {
    if(
        file.mimetype === 'image/png' ||
        file.mimetype === 'image.jpg' ||
        file.mimetype  === 'image/jpeg'
    ){
        cb(null, true);
    }
    else{
        cb(null, false);
    }
}

app.use(
    multer({ storage: fileUpload, fileFilter: filterFile }).single('image')
    );

//bodyparser allows dataformat supporting functionalities like json, formurl etc..
app.use(bodyParser.json() || bodyParser.urlencoded() || bodyParser.text() || bodyParser.raw()); //it allows json data from client 

app.use('/assets', express.static(path.join(__dirname, 'assets')))

// bodyParser.urlencoded(); // this allows url based data like form data
// bodyParser.text();// plain text
// bodyParser.raw()// raw data --> any kind of data it allows

app.use((req, res, next) => {
    res.setHeader("access-control-allow-origin", "*");
    res.setHeader("access-control-allow-methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
    res.setHeader("access-control-allow-headers", "Content-Type, Authorization");
    next();
})

//mongodb connnection

mongoose.connect('mongodb://127.0.0.1:27017/messages', { useNewUrlParser: true}) 
    .then(result => {
     result
    }).then(err => err);


app.use('/api', routes);

app.use((error, req, res, next) => {
    console.log(error);
    const status = req.statusCode;
    const message = req.message;
    res.status(status).json({
        message: message
    })
})

app.listen(4500);