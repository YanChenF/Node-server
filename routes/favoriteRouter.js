const express = require('express');
const Router = express.Router();
const User = require('../models/user');
const Favorite = require('../models/favorite');
const authenticate = require('../authenticate');
const bodyParser = require('body-parser');

Router.use(bodyParser.json());

Router.route('/')
.get(authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({user: req.user._id}).populate('user').populate('dishes').exec((err, favorite) => {
        if(err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.json({err: err});
        } else {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json({favorite: favorite});           
        }
    })
})
.post(authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({user: req.user._id})
    .then((favorite) => {
        if(!favorite){
            const user = req.user._id;
            const dishes = req.body._id;
            return Favorite.create({user: user, dishes: dishes});
        } else {
            if(favorite.dishes.indexOf(req.body._id) === -1) {
                favorite.dishes.push(req.body._id);
                return favorite.save();
            } else {
                var error = new Error('Dish already exist!');
                error.status = 401;
                throw error;
            }
        }
    }, (err) => next(err))
    .then(favorite => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({favorite: favorite});        
    }, err => next(err))
    .catch(err => next(err))
})
.delete(authenticate.verifyUser, (req, res, next) => {
    Favorite.findOneAndDelete({user: req.user._id})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});

Router.route('/:dishId')
.post(authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({user: req.user._id})
    .then((favorite) => {
        if(!favorite){
            const user = req.user._id;
            const dishes = req.params.dishId
            return Favorite.create({user: user, dishes: dishes});
        } else {
            if(favorite.dishes.indexOf(req.params.dishId) === -1) {
                favorite.dishes.push(req.params.dishId);
                return favorite.save();
            } else {
                var error = new Error('Dish already exist!');
                error.status = 401;
                throw error;
            }
        }
    }, (err) => next(err))
    .then(favorite => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({favorite: favorite});        
    }, err => next(err))
    .catch(err => next(err))    
})
.delete(authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({user: req.user._id})
    .then((favorite) => {
        console.log(favorite.dishes);
            if(favorite && favorite.dishes.indexOf(req.params.dishId) !== -1) {
                favorite.dishes.splice(favorite.dishes.indexOf(req.params.dishId), 1);
                favorite.save()
                .then((favorite) => {
                    Favorite.findById(favorite._id).populate('dishes', 'user')
                    .then(favorite => {
                        res.statusCode = 200;
                        res.setHeader('Content-type', 'application/json');
                        res.json(favorite);
                    }, (err) => next(err));
                });
            } else if(!favorite) {
                err = new Error('Favorite for user ' + req.user._id + ' not found');
                err.status = 404;
                return next(err);
            } else {
                err = new Error('Dish ' + req.params.dishId + ' not found');
                err.status = 404;
                return next(err);            
            }
    }, (err) => next(err))
    .catch((err) => next(err));
});

module.exports = Router;