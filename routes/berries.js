const express = require('express');
const ObjectID = require('mongodb').ObjectID;
const utils = require('../utils');

const HttpError = utils.HttpError;

const BERRIES_COLLECTION = 'berries';
const USERS_COLLECTION = 'users';

const router = new express.Router();

module.exports = (db, auth) => {
  //router.use(auth);

  // {
  //     "_id": {
  //         "$oid": "581675e2d9c57c0010d6f736"
  //     },
  //     "userId": "580da397705c29001043bd10",
  //     "image": www.image.com,
  //     "description": "point of interest establishment ",
  //     "createDate": "123456789",
  //     "location": {
  //         "lat": 48.47004578553588,
  //         "lng": -123.3187735453248
  //     }
  // }

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

      db.collection(BERRIES_COLLECTION).find(area).toArray((err, doc) => {
        if (err) {
          utils.handleError(res, err.message, 'Failed to get berries');
        } else {
          res.status(200).json(doc);
        }
      });
    })
    .post((req, res) => {
      const newBerry = req.body;
      newBerry.userId = req.body.userId || 'Unknown';
      newBerry.image = req.body.image || 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Question_Mark.svg/2000px-Question_Mark.svg.png';
      newBerry.description = req.body.description || '';
      newBerry.createDate = new Date().getTime();
      newBerry.location.lat = req.body.location.lat || '0.0';
      newBerry.location.lng = req.body.location.lng || '0.0';

      db.collection(BERRIES_COLLECTION).insertOne(newBerry, (err, doc) => {
        if (err) {
          utils.handleError(res, err.message, 'Failed to create new berry.');
        } else {
          res.status(201).json(doc.ops[0]);
        }
      });
    });

   /*
   * "/berries/:id"
   * GET: get berry by id
   */

   router.route('/:id')
    .get((req, res) => {
      db.collection(BERRIES_COLLECTION).findOne({ _id: new ObjectID(req.params.id) }, (err, doc) => {
        if (err) {
          utils.handleError(res, err.message, 'Failed to get berry');
        } else {
          res.status(200).json(doc);
        }
      });
    });

    return router;
};