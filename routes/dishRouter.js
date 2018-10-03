const express = require('express');
const dishRouter = express.Router();
const bodyParser = require('body-parser');

dishRouter.use(bodyParser.json());

dishRouter.route('/')
.all((req, res, next) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    next();
})
.get((req, res, next) => {
    res.end('All the dishes will be sent to you');
})
.post((req, res, next) => {
    res.end(`Will add the dish ${req.body.name} with details ${req.body.description}`);
})
.put((req, res, next) => {
    res.statusCode = 403;
    res.end('PUT request not supported on /dishes');
})
.delete((req, res, next) => {
    res.end('Will delete all the dishes');
});

dishRouter.route('/:dishId')
.get((req, res, next) => {
    res.end('Dish ' + req.params.dishId + ' will be sent to you');
})
.post((req, res, next) => {
    res.statusCode = 403;
    res.end(`POST to ${req.params.dishId} is not supported`);
})
.put((req, res, next) => {
    res.write('Updating dish ' + req.params.dishId + '\n'); 
    res.end('Will update the dish: ' + req.body.name + 
    ' with details: ' + req.body.description);
})
.delete((req, res, next) => {
    res.end('Will delete dish ' + req.params.dishId);
});
module.exports = dishRouter;