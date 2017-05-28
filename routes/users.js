const express = require('express');
const ObjectID = require('mongodb').ObjectID;
const utils = require('../utils');

const BERRIES_COLLECTION = 'berries';
const USERS_COLLECTION = 'users';

const router = new express.Router();

module.exports = (db, auth) => {
  router.use(auth);

  /*
   * "/users/"
   * GET: get user
   * POST: create user
   */
  router.route('/')
  	.post((req,res) => {
      const newUser = req.body;
      newUser.berries = [];
      db.collection(USERS_COLLECTION).insertOne(newUser, (err, doc) => {
        if (err) {
          utils.handleError(res, err.message, 'Failed to create new user.');
        } else {
          res.status(201).json(doc.ops[0]);
        }
      });
  	});

  router.route('/:id/berries')
    .get((req, res) => {
      db.collection(USERS_COLLECTION).findOne({ _id: new ObjectID(req.params.id) }, (err, result) => {
        if (err) {
          utils.handleError(res, err.message, 'Failed to get user');
        } else {
          const account = result;
          res.status(200).json(account.berries);
        }
      });
    })
    .post((req, res) => {
      const berryId = req.body.berryId;
      if (!berryId) {
        utils.handleError(res, 'berryId field not provided', 'Invalid format', 400);
        return;
      }

      db.collection(USERS_COLLECTION).updateOne({ _id: new ObjectID(req.params.id) }, { $addToSet: berryId }, (err, result) => {
        if (err) {
          utils.handleError(res, err.message, 'Failed to update myBerries');
        } else {
          if (!result) {
            utils.handleError(res, 'User id not found', 'Invalid user id', 400);
            return;
          }
          res.status(204).end();
        }
      })
    });


  router.route('/token/:token')
    .get((req, res) => {
      db.collection(USERS_COLLECTION).findOne({ token: parseInt(req.params.token, 10) },
          (err, doc) => {
            if (err) {
              utils.handleError(res, err.message, 'Failed to authenticate user');
              res.status(401).end();
            } else {
              res.status(200).json(doc);
            }
          });
  	});

  return router;
};