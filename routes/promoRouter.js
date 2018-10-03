const express = require('express');
const promoRouter = express.Router();
const bodyParser = require('body-parser');

promoRouter.use(bodyParser.json());

promoRouter.route('/')
.all((req, res, next) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    next();
})
.get((req, res, next) => {
    res.end('All the promos will be sent to you');
})
.post((req, res, next) => {
    res.end(`Will add the promotion ${req.body.name} with details ${req.body.description}`);
})
.put((req, res, next) => {
    res.statusCode = 403;
    res.end('PUT request not supported on /promos');
})
.delete((req, res, next) => {
    res.end('Will delete all the promotions');
});

promoRouter.route('/:promoId')
.get((req, res, next) => {
    res.end('Promotion ' + req.params.promoId + ' will be sent to you');
})
.post((req, res, next) => {
    res.statusCode = 403;
    res.end(`POST to ${req.params.promoId} is not supported`);
})
.put((req, res, next) => {
    res.write('Updating promotion ' + req.params.promoId + '\n'); 
    res.end('Will update the promotion: ' + req.body.name + 
    ' with details: ' + req.body.description);
})
.delete((req, res, next) => {
    res.end('Will delete promotion ' + req.params.promoId);
});

module.exports = promoRouter;