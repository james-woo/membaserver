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
  //     "userId": "123456789",
  //     "userName": "username"
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
      db.collection(USERS_COLLECTION).find({}).toArray((err, doc) => {
        if (err) {
          utils.handleError(res, err.message, 'Failed to get users.');
        } else {
          res.status(200).json(doc);
        }
      });
    })
  	.post((req,res) => {
      const newUser = req.body;
      newUser.berries = [];
      newUser.createDate = new Date().getTime();
      db.collection(USERS_COLLECTION).insertOne(newUser, (err, doc) => {
        if (err) {
          utils.handleError(res, err.message, 'Failed to create new user.');
        } else {
          res.status(201).json(doc.ops[0]);
        }
      });
  	});

  /*
   * "/users/"
   * GET: get user by id
   */
  router.route('/:id')
    .get((req,res) => {
      db.collection(USERS_COLLECTION).findOne({ userId: req.params.id }, (err, doc) => {
        if (err) {
          utils.handleError(res, err.message, 'Failed to get users.');
        } else {
          if (!doc) {
            const userId = req.params.id;
            res.status(404).json(userId);
            return;
          }
          res.status(200).json(doc).end();
        }
      });
    })
    .put((req, res) => {
      const newUsername = req.body.userName;
      db.collection(USERS_COLLECTION).updateOne({ userId: req.params.id }, {$set: {'userName':newUsername}}, (err, doc) => {
        if (err) {
          utils.handleError(res, err.message, 'Failed to update user');
        } else {
          if (!doc) {
            utils.handleError(res, 'User id not found', 'Invalid user id', 400);
            return;
          }
          res.status(204).end();
        }
      });
      db.collection(BERRIES_COLLECTION).update({ userId: req.params.id }, {$set: {'userName':newUsername}}, { multi: true }, (err, doc) => {
        if (err) {
          utils.handleError(res, err.message, 'Failed to update berry');
        } else {
          if (!doc) {
            utils.handleError(res, 'User id not found', 'Invalid user id', 400);
            return;
          }
          res.status(204).end();
        }
      });
    });

  router.route('/:id/berries')
    .get((req, res) => {
      db.collection(BERRIES_COLLECTION).find({ userId: req.params.id }).toArray((err, doc) => {
        if (err) {
          utils.handleError(res, err.message, 'Failed to get user');
        } else {
          res.status(200).json(doc);
        }
      });
    })
    .post((req, res) => {
      const berryId = req.body._id;
      if (!berryId) {
        utils.handleError(res, 'berryId field not provided', 'Invalid format', 400);
        return;
      }
      db.collection(USERS_COLLECTION).updateOne({ userId: req.params.id }, { $addToSet: {'berries':berryId} }, (err, doc) => {
        if (err) {
          utils.handleError(res, err.message, 'Failed to update myBerries');
        } else {
          if (!doc) {
            utils.handleError(res, 'User id not found', 'Invalid user id', 400);
            return;
          }
          res.status(204).end();
        }
      });
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