const express = require('express');
const dishRouter = express.Router();
const bodyParser = require('body-parser');
const authenticate = require('../authenticate');
const cors = require('./cors');

const Dishes = require('../models/dishes');

dishRouter.use(bodyParser.json());

// dishes routes
dishRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req, res, next) => {
    Dishes.find(req.query).populate('comments.author')
    .then((dishes) => {
        res.statusCode = 200;
        res.setHeader('Content-type', 'application/json');
        res.json(dishes);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => { //why not use populate here? cause this is the place to create a dish, and there is no comment yet
    Dishes.create(req.body)
    .then((dish) => {
        console.log('Created: ', dish);
        res.statusCode = 200;
        res.setHeader('Content-type', 'application/json');
        res.json(dish);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT request not supported on /dishes');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
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
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, (req, res, next) => {
    Dishes.findById(req.params.dishId).populate('comments.author')
    .then((dish) => {
        res.statusCode = 200;
        res.setHeader('Content-type', 'application/json');
        res.json(dish);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end(`POST to ${req.params.dishId} is not supported`);
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Dishes.findByIdAndUpdate(req.params.dishId, {$set: req.body}, { new: true})
    .then((dish) => {
        res.statusCode = 200;
        res.setHeader('Content-type', 'application/json');
        res.json(dish);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Dishes.findByIdAndRemove(req.params.dishId)
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});

module.exports = dishRouter;