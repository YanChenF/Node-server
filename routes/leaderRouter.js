const express = require('express');
const leaderRouter = express.Router();
const bodyParser = require('body-parser');

leaderRouter.use(bodyParser.json());

leaderRouter.route('/')
.all((req, res, next) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    next();
})
.get((req, res, next) => {
    res.end('All the leaders will be sent to you');
})
.post((req, res, next) => {
    res.end(`Will add the leader ${req.body.name} with details ${req.body.description}`);
})
.put((req, res, next) => {
    res.statusCode = 403;
    res.end('PUT request not supported on /leaders');
})
.delete((req, res, next) => {
    res.end('Will delete all the leaders');
});

leaderRouter.route('/:leaderId')
.get((req, res, next) => {
    res.end('Leader ' + req.params.leaderId + ' will be sent to you');
})
.post((req, res, next) => {
    res.statusCode = 403;
    res.end(`POST to ${req.params.leaderId} is not supported`);
})
.put((req, res, next) => {
    res.write('Updating leader ' + req.params.leaderId + '\n'); 
    res.end('Will update the leader: ' + req.body.name + 
    ' with details: ' + req.body.description);
})
.delete((req, res, next) => {
    res.end('Will delete leader ' + req.params.leaderId);
});
module.exports = leaderRouter;