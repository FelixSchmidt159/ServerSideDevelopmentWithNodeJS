const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');

const Favorites = require('../models/favorites');

const favoritesRouter = express.Router();
favoritesRouter.use(bodyParser.json());

favoritesRouter.route('/')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .get(cors.cors, authenticate.verifyUser, (req,res,next) => {
        Favorites.findOne({ user: req.user._id })
            .populate('user')
            .populate('dishes')
            .then((favorites) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorites);
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({ user: req.user._id })
            .then((favorites) => {
                // favorites already exist
                if (favorites != null) {
                    // check for every Id in body if it is already in favorites
                    for (let i = 0; i < req.body.length; i++) {
                        if (favorites.dishes.indexOf(req.body[i]._id) === -1) {
                            favorites.dishes.push(req.body[i]._id);
                        }
                        else {
                            console.log('Duplicate Dish' + req.body[i]._id + 'already in favorites');
                        }
                    }
                    favorites.save()
                        .then((favorite) => {
                            Favorites.findById(favorite._id)
                                .populate('user')
                                .populate('dishes')
                                .then((favorite) => {
                                    res.statusCode = 200;
                                    res.setHeader('Content-Type', 'application/json');
                                    res.json(favorite);
                                })
                        })
                        .catch((err) => {
                            return next(err);
                        });
                } else {
                    // rethink mares
                    for (let i = 0; i < req.body.length; i++) {
                        if (favorites.dishes.indexOf(req.body[i]._id)) {
                            favorites.dishes.push(req.body[i]);
                        }
                    }
                    favorites.save()
                        .then((favorite) => {
                            Favorites.findById(favorite._id)
                                .populate('user')
                                .populate('dishes')
                                .then((favorite) => {
                                    res.statusCode = 200;
                                    res.setHeader('Content-Type', 'application/json');
                                    res.json(favorite);
                                })
                        })
                        .catch((err) => {
                            return next(err);
                        })

                    // Favorites.create({ user: req.user._id, dishes: req.body })
                    //     .then((favorite) => {
                    //         console.log('Favorites Created ', favorite);
                    //         res.statusCode = 200;
                    //         res.setHeader('Content-Type', 'application/json');
                    //         res.json(favorite);
                    //     }, (err) => next(err))
                    //     .catch((err) => next(err));
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorites.findOneAndDelete({ user: req.user._id })
            .then((favorites) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorites);
            }, (err) => next(err))
            .catch((err) => next(err));
    });


favoritesRouter.route('/:dishId')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .get(cors.cors, authenticate.verifyUser, (req,res,next) => {
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
    .post(cors.corsWithOptions, authenticate.verifyUser,(req, res, next) => {
        Favorites.findOne({ user: req.user._id })
            .then((favorites) => {
                // favorites already exist
                if (favorites != null) {
                    if (favorites.dishes.indexOf(req.params.dishId) === -1) {
                        favorites.dishes.push(req.params.dishId);
                    }
                    else {
                        console.log('Duplicate Dish' + req.params.dishId + 'already in favorites');
                    }
                    favorites.save()
                        .then((favorite) => {
                            Favorites.findById(favorite._id)
                                .populate('user')
                                .populate('dishes')
                                .then((favorite) => {
                                    res.statusCode = 200;
                                    res.setHeader('Content-Type', 'application/json');
                                    res.json(favorite);
                                })
                        })
                        .catch((err) => {
                            return next(err);
                        });
                } else {
                    Favorites.create({ user: req.user._id })
                        .then((favorite) => {
                            favorite.dishes.push( { "_id": req.params.dishId})
                            favorite.save()
                            .then((favorite) => {
                                Favorites.findById(favorite._id)
                                    .populate('user')
                                    .populate('dishes')
                                    .then((favorite) => {
                                        res.statusCode = 200;
                                        res.setHeader('Content-Type', 'application/json');
                                        res.json(favorite);
                                    })
                            })
                        })
                        .catch((err) => {
                            return next(err);
                        });

                    // Favorites.create({ user: req.user._id, dishes: [ { _id: req.params.dishId } ] })
                    //     .then((favorite) => {
                    //         console.log('Favorites Created ', favorite);
                    //         res.statusCode = 200;
                    //         res.setHeader('Content-Type', 'application/json');
                    //         res.json(favorite);
                    //     }, (err) => next(err))
                    //     .catch((err) => next(err));
                }
            },
                (err) => next(err))
            .catch((err) => next(err));
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({ user: req.user._id })
            .then((favorites) => {
                if (favorites != null) {

                    for(let i = 0; i < favorites.dishes.length; i++) {
                        if(favorites.dishes[i] == req.params.dishId) {
                            favorites.dishes.splice(i, 1);
                            break;
                        }
                    }
                    // favorites.dishes.id(req.params.dishId).remove();
                    favorites.save()
                        .then((favorite) => {
                            Favorites.findById(favorite._id)
                                .populate('user')
                                .populate('dishes')
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
                else {
                    err = new Error('Dish ' + req.params.dishId + ' not found in favorites');
                    err.status = 404;
                    return next(err);
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    });

module.exports = favoritesRouter;
