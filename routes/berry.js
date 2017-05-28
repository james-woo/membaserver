const express = require('express');
const ObjectID = require('mongodb').ObjectID;
const utils = require('../utils');

const HttpError = utils.HttpError;

const BERRIES_COLLECTION = 'berries';
const USERS_COLLECTION = 'users';

const router = new express.Router();

module.exports = (db, auth) => {
  router.use(auth);

  /*
   * "/berry/"
   * GET: gets all berries
   *  query params:
   *    searchArea: '{topleftlat},{topleftlng},{btmrightlat},{btmrightlng}'
   * POST: creates a new berry
   */

   router.route('/')
    .get((req, res) => {
      const searchArea = (req.query.searchArea || '').split(',');
      const area = searchArea.length === 4 ? {
          $and: [
          { 'location.lat': { $lte: parseFloat(searchArea[0]) } },
          { 'location.lng': { $lte: parseFloat(searchArea[1]) } },
          { 'location.lat': { $gte: parseFloat(searchArea[2]) } },
          { 'location.lng': { $gte: parseFloat(searchArea[3]) } },
        ],
      } : {};

      db.collection(BERRIES_COLLECTION).find(area).toArray((err, result) => {
        if (err) {
          utils.handleError(res, err.message, 'Failed to get berries');
        } else {
          res.status(200).json(result);
        }
      });
    })
    .post((req, res) => {
      const newBerry = req.body;
      newBerry.username = req.body.username || 'Unknown';
      newBerry.image = req.body.image || 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Question_Mark.svg/2000px-Question_Mark.svg.png';
      newBerry.description = req.body.description || '';
      newBerry.date = new Date();
      newBerry.location.lat = req.body.location.lat || '0.0';
      newBerry.location.lng = req.body.location.lng || '0.0';

      db.collection(BERRIES_COLLECTION).insertOne(newBerry, (err, result) => {
        if (err) {
          utils.handleError(res, err.message, 'Failed to create new berry.');
        } else {
          res.status(201).json(result.ops[0]);
        }
      });
    });

   /*
   * "/berries/:id"
   * GET: get berry by id
   */

   router.route('/:id')
    .get((req, res) => {
      db.collection(BERRIES_COLLECTION).findOne({ _id: new ObjectID(req.params.id) }, (err, result) => {
        if (err) {
          utils.handleError(res, err.message, 'Failed to get berry');
        } else {
          res.status(200).json(result);
        }
      });
    });

    return router;
};