const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('./cors');
var util = require("util");

const Favorites = require('../models/favorites');
var authenticate = require('../authenticate');

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
        Favorites.find({ user: req.user._id })
            .populate('dishes._id')
            .populate('user')
            .then((favorites) => {
                if (favorites != null) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorites);
                }
                else {
                    err = new Error('There are no Favorites!');
                    err.status = 404;
                    return next(err);
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorites.find({ user: req.user._id })
            .then((favorites) => {
                if (favorites != null) {
                    if (favorites.length == 0) {
                        req.dishes = req.body;
                        req.user = req.user._id;
                        Favorites.create(req)
                            .then((favorites) => {
                                Favorites.findById(favorites._id)
                                    .populate('dishes._id')
                                    .populate('user')
                                    .then((fav) => {
                                        res.statusCode = 200;
                                        res.setHeader('Content-Type', 'application/json');
                                        res.json(fav);
                                    }, (err) => next(err))
                                    .catch((err) => next(err));
                            }, (err) => next(err))
                            .catch((err) => next(err));
                    } else {
                        for (i = 0; i < req.body.length; i++)
                            if (favorite.dishes.indexOf(req.body[i]._id) < 0)
                                favorite.dishes.push(req.body[i]);
                        favorite.save()
                            .then((favorite) => {
                                Favorites.findById(favorite._id)
                                    .populate('user')
                                    .populate('dishes._id')
                                    .then((favorite) => {
                                        res.statusCode = 200;
                                        res.setHeader('Content-Type', 'application/json');
                                        res.json(favorite);
                                    })
                            })
                            .catch((err) => {
                                return next(err);
                            });

                    }
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /leaders');
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorites.find({ user: req.user._id })
            .then((favorites) => {
                if (favorites.length == 0) {
                    res.statusCode = 403;
                    res.end('You have no Favorite List');
                } else {
                    favorites[0].remove({})
                        .populate('user')
                        .populate('dishes._id')
                        .then((resp) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(resp);
                        }, (err) => next(err))
                        .catch((err) => next(err));
                }

            }, (err) => next(err))
            .catch((err) => next(err));
    });

favoriteRouter.route('/:dishId')
    .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({ user: req.user._id })
            .then((favorites) => {
                if (!favorites) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    return res.json({ "exists": false, "favorites": favorites });
                }
                else {
                    if (favorites.dishes.indexOf(req.params.dishId) < 0) {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        return res.json({ "exists": false, "favorites": favorites });
                    }
                    else {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        return res.json({ "exists": true, "favorites": favorites });
                    }
                }

            }, (err) => next(err))
            .catch((err) => next(err))
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Favorites.find({ user: req.user._id })
            .then((favorites) => {
                if (favorites.length == 0) {
                    var js = { "_id": req.params.dishId }
                    req.dishes = [js];
                    req.user = req.user._id;
                    Favorites.create(req)
                        .then((favorites) => {
                            Favorites.findById(favorites._id)
                                .populate('dishes._id')
                                .populate('user')
                                .then((fav) => {
                                    res.statusCode = 200;
                                    res.setHeader('Content-Type', 'application/json');
                                    res.json(fav);
                                }, (err) => next(err))
                                .catch((err) => next(err));
                        }, (err) => next(err))
                        .catch((err) => next(err));

                } else {
                    var found = false;
                    var j;
                    for (j = 0; j < favorites[0].dishes.length; j++) {
                        if (favorites[0].dishes[j].equals(req.params.dishId))
                            found = true;
                    }
                    if (!found) {
                        favorites[0].dishes.push(req.params.dishId);
                        favorites[0].save()
                            .then((favorites) => {
                                Favorites.findById(favorites._id)
                                    .populate('dishes._id')
                                    .populate('user')
                                    .then((fav) => {
                                        res.statusCode = 200;
                                        res.setHeader('Content-Type', 'application/json');
                                        res.json(fav);
                                    }, (err) => next(err))
                                    .catch((err) => next(err));
                            }, (err) => next(err));

                    } else {
                        res.statusCode = 403;
                        res.end('Dish is already in your Favorites');
                    }
                }

            }, (err) => next(err))
            .catch((err) => next(err));

    })
    .put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /favorites/:dishId' + req.params.dishId);
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Favorites.find({ user: req.user._id })
            .then((favorites) => {
                if (favorites == 0) {
                    err = new Error('There are no Favorites!');
                    err.status = 404;
                    return next(err);
                } else {
                    if (favorites[0].dishes != null && favorites[0].dishes.id(req.params.dishId) != null) {
                        favorites[0].dishes.id(req.params.dishId).remove();
                        favorites[0].save()
                            .then((fav) => {
                                Favorites.findById(fav._id)
                                    .populate('user')
                                    .populate('dishes')
                                    .then((f) => {
                                        res.statusCode = 200;
                                        res.setHeader('Content-Type', 'application/json');
                                        res.json(f);
                                    })
                            }, (err) => next(err))
                            .catch((err) => next(err));
                    }
                    else {
                        err = new Error('There is no favorite with this id:!' + req.params.dishId);
                        err.status = 404;
                        return next(err);
                    }

                }
            }, (err) => next(err))
            .catch((err) => next(err));
    });



module.exports = favoriteRouter;