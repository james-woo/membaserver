const express = require('express');
const mongodb = require('mongodb');

const router = new express.Router();
const ObjectID = mongodb.ObjectID;

const berries = require('./berries');
const users = require('./users');

module.exports = (db, auth) => {
  // -------------- BERRIES API BELOW -------------------------------
  router.use('/berries', berries(db, auth));
  
  // -------------- ACCOUNT API BELOW -------------------------
  router.use('/users', users(db, auth));

  return router;
};