const express = require('express');
const bodyParser = require('body-parser');
const Vehicle = require('../models/vehicles');
var authenticate = require('../authenticate');
const cors = require('./cors');

const vehicleRouter = express.Router();

vehicleRouter.use(bodyParser.json());

vehicleRouter.route('/')
    .options(cors.corsWithOptions, authenticate.verifyUser, (req, res) => { res.sendStatus(200); })
    .get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        console.log(req.user);
        Vehicle.find({ driver: req.user._id })
            .populate('driver')
            .then((tours) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(tours);
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        req.body.driver = req.user._id;
        Vehicle.create(req.body)
            .then((vehicle) => {
                Vehicle.findById(vehicle._id)
                    .populate('driver')
                    .then((tour) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(tour);
                    }, (err) => next(err))
                    .catch((err) => next(err));
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /vehicles');
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end('DELETE operation not supported on /vehicles');
    });

vehicleRouter.route('/:vehicleId')
    .options(cors.corsWithOptions, authenticate.verifyUser, (req, res) => { res.sendStatus(200); })
    .get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Vehicle.findById(req.params.vehicleId)
            .then((vehicle) => {
                if (vehicle.driver.equals(req.user._id)) {
                    Vehicle.findById(req.params.vehicleId)
                        .populate('driver')
                        .then((tour) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(tour);
                        }, (err) => next(err))
                        .catch((err) => next(err));


                } else {
                    res.statusCode = 200;
                    res.end('No Vehicle found with id: ' + req.params.vehicleId);
                }

            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end('POST operation not supported on /vehicles/' + req.params.vehicleId);
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Vehicle.findById(req.params.vehicleId)
            .then((vehicle) => {
                if (vehicle.driver.equals(req.user._id)) {
                    req.body.driver = req.user._id;
                    Vehicle.findByIdAndUpdate(req.params.vehicleId, {
                        $set: req.body
                    }, { new: true })
                        .populate('driver')
                        .then((veh) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(veh);
                        }, (err) => next(err))
                        .catch((err) => next(err));


                } else {
                    res.statusCode = 200;
                    res.end('No Vehicle found with id: ' + req.params.vehicleId);
                }

            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {

        Vehicle.findById(req.params.vehicleId)
            .then((vehicle) => {
                if (vehicle.driver.equals(req.user._id)) {
                    req.body.driver = req.user._id;
                    Vehicle.findByIdAndRemove(req.params.vehicleId)
                        .populate('driver')
                        .then((veh) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(veh);
                        }, (err) => next(err))
                        .catch((err) => next(err));


                } else {
                    res.statusCode = 200;
                    res.end('No Vehicle found with id: ' + req.params.vehicleId);
                }

            }, (err) => next(err))
            .catch((err) => next(err));
    });



module.exports = vehicleRouter;