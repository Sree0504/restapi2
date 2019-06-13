const router = require("express").Router();
const { body } = require('express-validator/check');
const post = require('../controllers/customer');
const isAuth = require('../middlewares/is_auth');

router.post('/createPost',
    [
        body('title')
            .trim()
            .isLength({ min: 4 }),
        body('content')
            .trim()
            .isLength({ min: 15 })
    ],isAuth,
    post.createPost);

router.get('/getPosts', isAuth, post.getPosts);

router.get('/getPost/:postId',isAuth, post.getPost);

router.put('/updatePost/:postId', [
    body('title')
        .trim()
        .isLength({ min: 4 }),
    body('content')
        .trim()
        .isLength({ min: 15 })
],  isAuth,

    post.updatePost);

router.delete('/removePost/:postId', isAuth, post.removePost);

module.exports = router;