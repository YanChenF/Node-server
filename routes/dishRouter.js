const express = require('express');
const dishRouter = express.Router();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');

const Dishes = require('../models/dishes');

dishRouter.use(bodyParser.json());

// dishes routes
dishRouter.route('/')
.get((req, res, next) => {
    Dishes.find({}).populate('comments.author')
    .then((dishes) => {
        res.statusCode = 200;
        res.setHeader('Content-type', 'application/json');
        res.json(dishes);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => { //why not use populate here? cause this is the place to create a dish, and there is no comment yet
    Dishes.create(req.body)
    .then((dish) => {
        console.log('Created: ', dish);
        res.statusCode = 200;
        res.setHeader('Content-type', 'application/json');
        res.json(dish);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT request not supported on /dishes');
})
.delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Dishes.remove({})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});

//dishes/dishId routes
dishRouter.route('/:dishId')
.get((req, res, next) => {
    Dishes.findById(req.params.dishId).populate('comments.author')
    .then((dish) => {
        res.statusCode = 200;
        res.setHeader('Content-type', 'application/json');
        res.json(dish);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end(`POST to ${req.params.dishId} is not supported`);
})
.put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Dishes.findByIdAndUpdate(req.params.dishId, {$set: req.body}, { new: true})
    .then((dish) => {
        res.statusCode = 200;
        res.setHeader('Content-type', 'application/json');
        res.json(dish);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Dishes.findByIdAndRemove(req.params.dishId)
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});

//dish/dishId/comments routes
dishRouter.route('/:dishId/comments')
.get((req, res, next) => {
    Dishes.findById(req.params.dishId).populate('comments.author')
    .then((dish) => {
        if(dish) {
            res.statusCode = 200;
            res.setHeader('Content-type', 'application/json');
            res.json(dish.comments);
        } else {
            err = new Error('Dish ' + req.params.dishId + ' not found');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(authenticate.verifyUser, (req, res, next) => {
    Dishes.findById(req.params.dishId)
    .then((dish) => {
        if(dish) {
            req.body.author = req.user._id;
            dish.comments.push(req.body);
            dish.save()
            .then(dish => {
                Dishes.findById(dish._id).populate('comments.author')
                .then(dish => {
                    res.statusCode = 200;
                    res.setHeader('Content-type', 'application/json');
                    res.json(dish);
                }, (err) => next(err));
            });
                
        } else {
            err = new Error('Dish ' + req.params.dishId + ' not found');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT request not supported on /dishes/' + req.params.dishId + '/comments');
})
.delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Dishes.findById(req.params.dishId)
    .then((dish) => {
        if(dish) {
            for(var i = dish.comments.length - 1; i >= 0; i--) {
                dish.comments.id(dish.comments[i]._id).remove();
            }
            dish.save()
            .then((dish) => {
                res.statusCode = 200;
                res.setHeader('Content-type', 'application/json');
                res.json(dish);
            }, (err) => next(err));
        } else {
            err = new Error('Dish ' + req.params.dishId + ' not found');
            err.status = 404;
            return next(err);
        }
    }, (err) => next(err))
    .catch((err) => next(err));
});

//dishes/disheId/comments/commentId routes
dishRouter.route('/:dishId/comments/:commentId')
.get((req, res, next) => {
    Dishes.findById(req.params.dishId).populate('comments.author')
    .then((dish) => {
        if(dish && dish.comments.id(req.params.commentId)) {
            res.statusCode = 200;
            res.setHeader('Content-type', 'application/json');
            res.json(dish.comments.id(req.params.commentId));
        } else if(!dish) {
            err = new Error('Dish ' + req.params.dishId + ' not found');
            err.status = 404;
            return next(err);
        } else {
            err = new Error('Comment ' + req.params.commentId + ' not found');
            err.status = 404;
            return next(err);            
        }
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end(`POST to /${req.params.dishId}/comments/${req.params.commentId} is not supported`);
})
.put(authenticate.verifyUser, (req, res, next) => {
    Dishes.findById(req.params.dishId)
    .then((dish) => {
        if(dish.comments.id(req.params.commentId).author._id.equals(req.user._id)) {
            if(dish && dish.comments.id(req.params.commentId)) {
                if(req.body.rating) {
                    dish.comments.id(req.params.commentId).rating = req.body.rating;
                } 
                if(req.body.comment) {
                    dish.comments.id(req.params.commentId).comment = req.body.comment;
                }
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
})
.delete(authenticate.verifyUser, (req, res, next) => {
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
module.exports = dishRouter;