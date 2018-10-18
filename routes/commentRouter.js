const express = require('express');
const Router = express.Router();
const bodyParser = require('body-parser');
const authenticate = require('../authenticate');
const cors = require('./cors');
const Comments = require('../models/comments');

Router.use(bodyParser.json());
Router.use(function(req, res, next) {
    console.log(req.body);
    next();
});

Router.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req, res, next) => {
    Comments.find(req.query).populate('author')
    .then(comments => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(comments);
    }, err => next(err))
    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    if(req.body) { //when will the req.body be null?
        console.log(req.body);
        req.body.author = req.user._id;
        Comments.create(req.body)
        .then(comment => {
            Comments.findById(comment._id).populate('author')
            .then(comment => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(comment);                
            })
        }, err => next(err))
        .catch(err => next(err));
    } else {
        err = new Error('Comment not found in request body');
        err.status = 404;
        return next(err);        
    }
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end('PUT request not supported on /comments/');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Comments.remove({})
    .then(resp => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);         
    }, err => next(err))
    .catch(err => next(err));
});

//comments/commentId routes
Router.route('/:commentId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req, res, next) => {
    Comments.findById(req.params.commentId).populate('author')
    .then(comment => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(comment); 
    }, err => next(err))
    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end(`POST to /comments/${req.params.commentId} is not supported`);
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Comments.findById(req.params.commentId)
    .then(comment => {
        if(comment) {
            if(!comment.author.equals(req.user._id)) {
                var err = new Error('You are not authorized to edit the comment');
                err.status = 403;
                return next(err);
            } else {
                Comments.findByIdAndUpdate(comment._id, {$set: req.body}, {new: true})
                .then(comment => {
                    Comments.findById(comment._id).populate('author')
                    .then(comment => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(comment); 
                    });
                }); 
            }
        } else {
            var err = new Error('Comment not found!');
            err.status = 404;
            return next(err);
        }
    }, err => next(err))
    .catch(err => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Comments.findById(req.params.commentId)
    .then(comment => {
        if(comment) {
            if(!comment.author.equals(req.user._id)) {
                var err = new Error('You are not authorized to edit the comment');
                err.status = 403;
                return next(err);
            } else {
                Comments.findByIdAndDelete(comment._id)
                .then(resp => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(resp);                     
                }, err => next(err))
                .catch(err => next(err)); 
            }
        } else {
            var err = new Error('Comment not found!');
            err.status = 404;
            return next(err);
        }
    }, err => next(err))
    .catch(err => next(err));    
    Dishes.findById(req.params.dishId)
    .then((dish) => {
        if(dish.comments.id(req.params.commentId).author._id.equals(req.user._id)) {
            if(dish && dish.comments.id(req.params.commentId)) {
                dish.comments.id(req.params.commentId).remove();
                dish.save()
                .then((dish) => {
                    Dishes.findById(dish._id).populate('comments.author')
                    .then(dish => {
                        res.statusCode = 200;
                        res.setHeader('Content-type', 'application/json');
                        res.json(dish);
                    }, (err) => next(err));
                });
            } else if(!dish) {
                err = new Error('Dish ' + req.params.dishId + ' not found');
                err.status = 404;
                return next(err);
            } else {
                err = new Error('Comment ' + req.params.commentId + ' not found');
                err.status = 404;
                return next(err);            
            }
        } else {
            err = new Error('You are not the author');
            err.status = 403;
            return next(err);            
        }

    }, (err) => next(err))
    .catch((err) => next(err));
});

module.exports = Router;