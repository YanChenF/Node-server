const express = require('express');
const Router = express.Router();
const Favorite = require('../models/favorite');
const authenticate = require('../authenticate');
const bodyParser = require('body-parser');
const cors = require('./cors');

Router.use(bodyParser.json());

Router.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({user: req.user._id}).populate('user').populate('dishes').exec((err, favorites) => {
        if(err) {
            return next(err);
        } else {
            if(!favorites) {
                Favorite.create({user: req.user._id})
                .then(favorites => {
                    Favorite.findById(favorites._id).populate('user')
                    .then(favorites => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorites);                                  
                    })
                }, err => next(err))
                .catch(err => next(err));
            } else {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorites);  
            }         
        }
    })
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({user: req.user._id})
    .then((favorite) => {
        if(!favorite){
            const user = req.user._id;
            console.log(req.body);
            const dishes = req.body;
            Favorite.create({user: user, dishes: dishes})
            .then(favorite => {
                Favorite.findById(favorite._id).populate('user').populate('dishes')
                .then(favorites => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorites); 
                });
            }).catch(err => next(err));
        } else {
            if(favorite.dishes.indexOf(req.body._id) === -1) {
                favorite.dishes.push(req.body._id);
            }
            favorite.save()
            .then(favorite => {
                Favorite.findById(favorite._id).populate('user').populate('dishes')
                .then(favorites => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorites); 
                });
            })
            .catch(err => next(err));

        }
    }, (err) => next(err))
    .catch(err => next(err))
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOneAndDelete({user: req.user._id})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});

Router.route('/:dishId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, authenticate.verifyUser, (req, res, next) => { //check if the specific dishId exists in the favorites
    Favorites.findOne({user: req.user._id})
    .then((favorites) => {
        if (!favorites) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            return res.json({"exists": false, "favorites": favorites});
        }
        else {
            if (favorites.dishes.indexOf(req.params.dishId) < 0) {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                return res.json({"exists": false, "favorites": favorites});
            }
            else {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                return res.json({"exists": true, "favorites": favorites});
            }
        }

    }, (err) => next(err))
    .catch((err) => next(err))
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({user: req.user._id})
    .then((favorite) => {
        if(!favorite){
            const user = req.user._id;
            const dishes = req.params.dishId;
            Favorite.create({user: user, dishes: dishes})
            .then(favorite => {
                Favorite.findById(favorite._id).populate('user').populate('dishes')
                .then(favorites => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorites); 
                });
            }).catch(err => next(err));
        } else {
            if(favorite.dishes.indexOf(req.params.dishId) === -1) {
                favorite.dishes.push(req.params.dishId);
            }
            favorite.save()
            .then(favorite => {
                Favorite.findById(favorite._id).populate('user').populate('dishes')
                .then(favorites => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorites); 
                });
            })
            .catch(err => next(err));

        }
    }, (err) => next(err))
    .catch(err => next(err))
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({user: req.user._id})
    .then((favorite) => {
        console.log(favorite.dishes);
            if(favorite && favorite.dishes.indexOf(req.params.dishId) !== -1) {
                favorite.dishes.splice(favorite.dishes.indexOf(req.params.dishId), 1);
                favorite.save()
                .then((favorite) => {
                    Favorite.findById(favorite._id).populate('dishes').populate('user')
                    .then(favorites => {
                        res.statusCode = 200;
                        res.setHeader('Content-type', 'application/json');
                        res.json(favorites);
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