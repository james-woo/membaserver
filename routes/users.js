const express = require('express');
const ObjectID = require('mongodb').ObjectID;
const utils = require('../utils');

const BERRIES_COLLECTION = 'berries';
const USERS_COLLECTION = 'users';

const router = new express.Router();

module.exports = (db, auth) => {
  //router.use(auth);

  //  {
  //     "_id": {
  //         "$oid": "580fdbf89a5490001016eaec"
  //     },
  //     "userId": "123456789"
  //     "createDate": 123456789,
  //     "berries": []
  //  }

  /*
   * "/users/"
   * GET: get user
   * POST: create user
   */
  router.route('/')
    .get((req,res) => {
      db.collection(USERS_COLLECTION).find({}).toArray((err, result) => {
        if (err) {
          utils.handleError(res, err.message, 'Failed to get users.');
        } else {
          res.status(200).json(result);
        }
      });
    })
  	.post((req,res) => {
      const newUser = req.body;
      newUser.berries = [];
      newUser.createDate = new Date().getTime();
      db.collection(USERS_COLLECTION).insertOne(newUser, (err, result) => {
        if (err) {
          utils.handleError(res, err.message, 'Failed to create new user.');
        } else {
          res.status(201).json(result.ops[0]);
        }
      });
  	});

  router.route('/:id/berries')
    .get((req, res) => {
      db.collection(BERRIES_COLLECTION).find({ userId: req.params.id }).toArray((err, result) => {
        if (err) {
          utils.handleError(res, err.message, 'Failed to get user');
        } else {
          res.status(200).json(result);
        }
      });
    })
    .post((req, res) => {
      const berryId = req.body._id;
      if (!berryId) {
        utils.handleError(res, 'berryId field not provided', 'Invalid format', 400);
        return;
      }
      db.collection(USERS_COLLECTION).updateOne({ _id: new ObjectID(req.params.id) }, { $addToSet: {'berries':berryId} }, (err, result) => {
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
      db.collection(USERS_COLLECTION).findOne({ token: parseInt(req.params.token, 10) }, (err, doc) => {
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