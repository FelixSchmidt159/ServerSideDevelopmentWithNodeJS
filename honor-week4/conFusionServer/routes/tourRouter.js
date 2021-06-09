const express = require('express');
const bodyParser = require('body-parser');
const Tours = require('../models/tours');
var authenticate = require('../authenticate');
const cors = require('./cors');

const tourRouter = express.Router();

tourRouter.use(bodyParser.json());

tourRouter.route('/')
    .options(cors.corsWithOptions, authenticate.verifyUser, (req, res) => { res.sendStatus(200); })
    .get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Tours.find({ driver: req.user._id })
            .populate('driver')
            .populate('vehicle')
            .then((tours) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(tours);
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        req.body.driver = req.user._id;
        Tours.create(req.body)
            .then((tour) => {
                Tours.findById(tour._id)
                    .populate('driver')
                    .populate('vehicle')
                    .then((tour) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(tour);
                    }, (err) => next(err))
                    .catch((err) => next(err));
                console.log('Tour Created ', tour);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(tour);
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /tours');
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end('DELETE operation not supported on /tours');
    });

tourRouter.route('/:tourId')
    .options(cors.corsWithOptions, authenticate.verifyUser, (req, res) => { res.sendStatus(200); })
    .get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Tours.findById(req.params.tourId)
            .then((tour) => {
                if (tour.driver.equals(req.user._id)) {
                    Tours.findById(req.params.tourId)
                        .populate('driver')
                        .populate('vehicle')
                        .then((tour) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(tour);
                        }, (err) => next(err))
                        .catch((err) => next(err));


                } else {
                    res.statusCode = 200;
                    rres.end('No Tour found with id: ' + req.params.tourId);
                }

            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end('POST operation not supported on /tours/' + req.params.tourId);
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Tours.findById(req.params.tourId)
            .then((tour) => {
                if (tour.driver.equals(req.user._id)) {
                    req.body.driver = req.user._id;
                    Tours.findByIdAndUpdate(req.params.tourId, {
                        $set: req.body
                    }, { new: true })
                        .populate('driver')
                        .populate('vehicle')
                        .then((tour) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(tour);
                        }, (err) => next(err))
                        .catch((err) => next(err));


                } else {
                    res.statusCode = 200;
                    rres.end('No Tour found with id: ' + req.params.tourId);
                }

            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {

        Tours.findById(req.params.tourId)
            .then((tour) => {
                if (tour.driver.equals(req.user._id)) {
                    req.body.driver = req.user._id;
                    Tours.findByIdAndRemove(req.params.tourId)
                        .populate('driver')
                        .populate('vehicle')
                        .then((tour) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(tour);
                        }, (err) => next(err))
                        .catch((err) => next(err));


                } else {
                    res.statusCode = 200;
                    rres.end('No Tour found with id: ' + req.params.tourId);
                }

            }, (err) => next(err))
            .catch((err) => next(err));
    });



module.exports = tourRouter;