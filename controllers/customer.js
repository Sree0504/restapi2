const { validationResult }  = require("express-validator/check");

const fs = require('fs');
const path = require('path');

const createPost = require('../models/post');
const user = require('../models/user');
 
exports.createPost = (req, res, next) => {
    const error = validationResult(req);
    
    if (!error.isEmpty()) {
        const error = new Error('Validation failed, entered data is incorrect.');
        error.statusCode = 422;
        throw error;
    }
    //file upload
    if(!req.file){
        const error = new Error();
        error.statusCode = 422;
        throw error;
    }


  const title = req.body.title;
  const content = req.body.content;
  const imgUrl = req.file.path;
  let creator;
  console.log('sreenivas debug', req.userId);
  const post = new createPost({
    title: title,
    content: content,
    imgUrl: imgUrl,
    createdAt: new Date().toISOString(),
    creator: req.userId
  });
  post.save()
    .then(result => {
        return user.findById(req.userId)
    })
    .then(user => {
        creator = user;
        user.posts.push(post);
        return user.save();
    })
    .then(result => {
            res.status(201).json({
                message: 'Post created successfully!',
                post: post,
                creator: {_id: creator._id, name: creator.name}
        });
      })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.getPosts = (req, res, next) => {
    const currentPage = req.query.page || 1;
    const perPage = 2;
    let totalItems;
    createPost.find()
        .countDocuments()
        .then(count => {
            totalItems = count;
            return createPost.find()
                             .skip((currentPage-1) * perPage)
                             .limit(perPage); 
        })
        .then(posts => {
            res
            .status(201)
            .json({
                message: "you are receaved all the posts",
                posts: posts, 
                totalItems :  totalItems
            })
        }).catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });  
}


exports.getPost = (req, res, next) => {
    var postId = req.params.postId
    createPost.findById(postId)
    .then(post => {
            if(!post){
                const error = new Error('post is not available');
                error.statusCode = 404;
                throw error;
            }
            res.status(200).json({
                message:"post details",
                post: post
            });

    }).catch(err => {
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    })
};

exports.updatePost = (req, res, next) => {
    const postId = req.params.postId;
    const error = validationResult(req);    
    if (!error.isEmpty()) {
        const error = new Error('Validation failed, entered data is incorrect.');
        error.statusCode = 422;
        throw error;
    }
   
    const title = req.body.title;
    const content = req.body.content;
    let imgUrl = req.body.image;

    if(req.file){
        imgUrl = req.file.path;
    } 
    if(!imgUrl){
        const error = new Error("No file pick.");
        error.statusCode = 422;
        throw error;
    }
    createPost.findById(postId)
    .then(
        post => {
            if(!post){
                const error = new Error('post is not available');
                error.statusCode = 404;
                throw error;
            }
            if(post.creator.toString() !== req.userId){
                const error = new Error("Not Authorised!");
                error.statusCode = 403; //used for authorization access
                throw error;
            }
            if(!imgUrl !== post.imgUrl){
                clearImage(post.imgUrl);
            }
           post.title = title;
           post.imgUrl = imgUrl;
           post.content = content;
           return post.save();
            })
            .then(result => {
                res.status(201).json({
                    message: "post Updated successFully",
                    post: result
                });
            })
    .catch(err => {
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);})
}

exports.removePost = (req, res, next) => {
    const postId = req.params.postId;
    createPost.findById(postId)
        .then(post => {
            if(!post){
                const error = new Error('post is not available');
                error.statusCode = 404;
                throw error;
            }
            if(post.creator.toString() !== req.userId){
                const error = new Error("Not Authorised!");
                error.statusCode = 403; //used for authorization access
                throw error;
            }
            clearImage(post.imgUrl)
            return createPost.findByIdAndRemove(postId);
        })
        .then(result => {
            return user.findById(postId);
            })
        .then(result => {
            user.posts.pull(postId);
            return user.save();
            })
        .then(result => {
            res.json(200).json({message: 'Deleted Post.'})
        })
        .catch( err => {
            if(!err.statusCode){
                err.statusCode = 500;
            }
            next(err);
        })
}

const clearImage = filePath =>  {
    filePath =  path.join(__dirname, '..', filePath);
    fs.unlink(filePath,error => console.log(error));
}   